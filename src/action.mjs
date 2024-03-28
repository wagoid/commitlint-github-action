import { existsSync } from 'fs'
import { resolve } from 'path'
import { getInput, setFailed } from '@actions/core'
import { context as eventContext, getOctokit } from '@actions/github'
import lint from '@commitlint/lint'
import { format } from '@commitlint/format'
import load from '@commitlint/load'
import generateOutputs from './generateOutputs.mjs'

const pullRequestEvent = 'pull_request'
const pullRequestTargetEvent = 'pull_request_target'
const pullRequestEvents = [pullRequestEvent, pullRequestTargetEvent]

const { GITHUB_EVENT_NAME } = process.env

const configPath = resolve(process.env.GITHUB_WORKSPACE, getInput('configFile'))

const getCommitDepth = () => {
  const commitDepthString = getInput('commitDepth')
  if (!commitDepthString?.trim()) return null
  const commitDepth = parseInt(commitDepthString, 10)
  return Number.isNaN(commitDepth) ? null : Math.max(commitDepth, 0)
}

const getPushEventCommits = () => {
  const mappedCommits = eventContext.payload.commits.map((commit) => ({
    message: commit.message,
    hash: commit.id,
  }))

  return mappedCommits
}

const getPullRequestEventCommits = async () => {
  const octokit = getOctokit(getInput('token'))
  const { owner, repo, number } = eventContext.issue
  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: number,
    per_page: 100,
  })

  return commits.map((commit) => ({
    message: commit.commit.message,
    hash: commit.sha,
  }))
}

const getEventCommits = async () => {
  if (pullRequestEvents.includes(GITHUB_EVENT_NAME)) {
    return getPullRequestEventCommits()
  }
  if (eventContext.payload.commits) {
    return getPushEventCommits()
  }
  return []
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

const showLintResults = async (eventCommits) => {
  let commits = eventCommits
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
  } else if (formattedResults && getInput('failOnErrors') === 'false') {
    // https://github.com/actions/toolkit/tree/master/packages/core#exit-codes
    // this would be a good place to implement the setNeutral() when it's eventually implimented.
    // for now it can pass with a check mark.
    console.log(formattedResults)
    console.log('Fail on Errors is set to false: Passing despite errors ✅')
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
  getEventCommits()
    .catch(
      exitWithMessage("error trying to get list of pull request's commits"),
    )
    .then(showLintResults)
    .catch(exitWithMessage('error running commitlint'))

export default commitLinterAction
