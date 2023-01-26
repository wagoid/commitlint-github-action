import { existsSync } from 'fs'
import { resolve } from 'path'
import { getInput, setFailed } from '@actions/core'
import { context as eventContext, getOctokit } from '@actions/github'
import lint from '@commitlint/lint'
import { format } from '@commitlint/format'
import load from '@commitlint/load'
import gitCommits from './gitCommits'
import generateOutputs from './generateOutputs'

const pullRequestEvent = 'pull_request'
const pullRequestTargetEvent = 'pull_request_target'
const pullRequestEvents = [pullRequestEvent, pullRequestTargetEvent]

const { GITHUB_EVENT_NAME, GITHUB_SHA } = process.env

const configPath = resolve(process.env.GITHUB_WORKSPACE, getInput('configFile'))

const getCommitDepth = () => {
  const commitDepthString = getInput('commitDepth')
  if (!commitDepthString?.trim()) return null
  const commitDepth = parseInt(commitDepthString, 10)
  return Number.isNaN(commitDepth) ? null : Math.max(commitDepth, 0)
}

const pushEventHasOnlyOneCommit = (from) => {
  const gitEmptySha = '0000000000000000000000000000000000000000'

  return from === gitEmptySha
}

const getRangeForPushEvent = () => {
  let from = eventContext.payload.before
  const to = GITHUB_SHA

  if (eventContext.payload.forced) {
    // When a commit is forced, "before" field from the push event data may point to a commit that doesn't exist
    console.warn(
      'Commit was forced, checking only the latest commit from push instead of a range of commit messages',
    )
    from = null
  }

  if (pushEventHasOnlyOneCommit(from)) {
    from = null
  }

  return [from, to]
}

const getRangeForEvent = async () => {
  if (!pullRequestEvents.includes(GITHUB_EVENT_NAME))
    return getRangeForPushEvent()

  const octokit = getOctokit(getInput('token'))
  const { owner, repo, number } = eventContext.issue
  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: number,
  })
  const commitShas = commits.map((commit) => commit.sha)
  const [from] = commitShas
  const to = commitShas[commitShas.length - 1]
  // Git revision range doesn't include the "from" field in "git log", so for "from" we use the parent commit of PR's first commit
  const fromParent = `${from}^1`

  return [fromParent, to]
}

function getHistoryCommits(from, to) {
  const options = {
    from,
    to,
  }

  if (getInput('firstParent') === 'true') {
    options.firstParent = true
  }

  if (getInput('excludeTarget') === 'true') {
    options[`^${to}`] = true
  }

  if (!from) {
    options.maxCount = 1
  }

  return gitCommits(options)
}

function getOptsFromConfig(config) {
  return {
    parserOpts:
      config.parserPreset != null && config.parserPreset.parserOpts != null
        ? config.parserPreset.parserOpts
        : {},
    plugins: config.plugins != null ? config.plugins : {},
    ignores: config.ignores != null ? config.ignores : [],
    defaultIgnores:
      config.defaultIgnores != null ? config.defaultIgnores : true,
  }
}

const formatErrors = (lintedCommits, { config }) =>
  format(
    { results: lintedCommits.map((commit) => commit.lintResult) },
    {
      color: true,
      helpUrl: config.helpUrl || getInput('helpURL'),
    },
  )

const hasOnlyWarnings = (lintedCommits) =>
  lintedCommits.length &&
  lintedCommits.every(({ lintResult }) => lintResult.valid) &&
  lintedCommits.some(({ lintResult }) => lintResult.warnings.length)

const setFailedAction = (formattedResults) => {
  setFailed(`You have commit messages with errors\n\n${formattedResults}`)
}

const handleOnlyWarnings = (formattedResults) => {
  if (getInput('failOnWarnings') === 'true') {
    setFailedAction(formattedResults)
  } else {
    console.log(`You have commit messages with warnings\n\n${formattedResults}`)
  }
}

const showLintResults = async ([from, to]) => {
  let commits = await getHistoryCommits(from, to)
  const commitDepth = getCommitDepth()
  if (commitDepth) {
    commits = commits?.slice(0, commitDepth)
  }
  const config = existsSync(configPath)
    ? await load({}, { file: configPath })
    : await load({ extends: ['@commitlint/config-conventional'] })
  const opts = getOptsFromConfig(config)
  const lintedCommits = await Promise.all(
    commits.map(async (commit) => ({
      lintResult: await lint(commit.message, config.rules, opts),
      hash: commit.hash,
    })),
  )
  const formattedResults = formatErrors(lintedCommits, { config })
  generateOutputs(lintedCommits)

  if (hasOnlyWarnings(lintedCommits)) {
    handleOnlyWarnings(formattedResults)
  } else if (formattedResults) {
    setFailedAction(formattedResults)
  } else {
    console.log('Lint free! 🎉')
  }
}

const exitWithMessage = (message) => (error) => {
  setFailedAction(`${message}\n${error.message}\n${error.stack}`)
}

const commitLinterAction = () =>
  getRangeForEvent()
    .catch(
      exitWithMessage("error trying to get list of pull request's commits"),
    )
    .then(showLintResults)
    .catch(exitWithMessage('error running commitlint'))

export default commitLinterAction
