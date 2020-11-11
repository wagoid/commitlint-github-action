const { existsSync } = require('fs')
const { resolve } = require('path')
const { v4: uuidv4 } = require('uuid')
const core = require('@actions/core')
const github = require('@actions/github')
const lint = require('@commitlint/lint').default
const { format } = require('@commitlint/format')
const load = require('@commitlint/load').default
const gitCommits = require('./gitCommits')
const generateOutputs = require('./generateOutputs')

const pullRequestEvent = 'pull_request'

const { GITHUB_EVENT_NAME, GITHUB_SHA } = process.env

const configPath = resolve(
  process.env.GITHUB_WORKSPACE,
  core.getInput('configFile'),
)

const { context: eventContext } = github

const pushEventHasOnlyOneCommit = from => {
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
  if (GITHUB_EVENT_NAME !== pullRequestEvent) return getRangeForPushEvent()

  const octokit = new github.GitHub(core.getInput('token'))
  const { owner, repo, number } = eventContext.issue
  const { data: commits } = await octokit.pulls.listCommits({
    owner,
    repo,
    pull_number: number,
  })
  const commitShas = commits.map(commit => commit.sha)
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

  if (core.getInput('firstParent') === 'true') {
    options.firstParent = true
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

const formatErrors = lintedCommits =>
  format(
    { results: lintedCommits.map(commit => commit.lintResult) },
    {
      color: true,
      helpUrl: core.getInput('helpURL'),
    },
  )

const hasOnlyWarnings = lintedCommits =>
  lintedCommits.length &&
  lintedCommits.every(({ lintResult }) => lintResult.valid) &&
  lintedCommits.some(({ lintResult }) => lintResult.warnings.length)

const setFailed = formattedResults => {
  core.setFailed(`You have commit messages with errors\n\n${formattedResults}`)
}

const handleOnlyWarnings = formattedResults => {
  if (core.getInput('failOnWarnings') === 'true') {
    setFailed(formattedResults)
  } else {
    console.log(`You have commit messages with warnings\n\n${formattedResults}`)
  }
}

const showLintResults = async ([from, to]) => {
  const commits = await getHistoryCommits(from, to)
  const config = existsSync(configPath)
    ? await load({}, { file: configPath })
    : await load({ extends: ['@commitlint/config-conventional'] })
  const opts = getOptsFromConfig(config)
  const lintedCommits = await Promise.all(
    commits.map(async commit => ({
      lintResult: await lint(commit.message, config.rules, opts),
      hash: commit.hash,
    })),
  )
  const formattedResults = formatErrors(lintedCommits)

  generateOutputs(lintedCommits)

  // disable workflow commands
  const token = uuidv4()
  console.log(`::stop-commands::${token}`)

  if (hasOnlyWarnings(lintedCommits)) {
    handleOnlyWarnings(formattedResults)
  } else if (formattedResults) {
    setFailed(formattedResults)
  } else {
    console.log('Lint free! 🎉')
  }

  // enable workflow commands
  console.log(`::${token}::`)
}

const exitWithMessage = message => error => {
  core.setFailed(`${message}\n${error.message}\n${error.stack}`)
}

const commitLinterAction = () =>
  getRangeForEvent()
    .catch(
      exitWithMessage("error trying to get list of pull request's commits"),
    )
    .then(showLintResults)
    .catch(exitWithMessage('error running commitlint'))

module.exports = commitLinterAction
