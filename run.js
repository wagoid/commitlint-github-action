const { existsSync } = require('fs')
const { resolve } = require('path')
const core = require('@actions/core')
const github = require('@actions/github')
const exec = require('@actions/exec')
const lint = require('@commitlint/lint')
const { format } = require('@commitlint/format')
const load = require('@commitlint/load')
const gitRawCommits = require('git-raw-commits')

const pullRequestEvent = 'pull_request'

const { GITHUB_TOKEN, GITHUB_EVENT_NAME, GITHUB_SHA } = process.env

const configPath = resolve(
  process.env.GITHUB_WORKSPACE,
  core.getInput('configFile'),
)

const getRangeFromPullRequest = async () => {
  if (GITHUB_EVENT_NAME !== pullRequestEvent) return [null, GITHUB_SHA]

  const octokit = new github.GitHub(GITHUB_TOKEN)
  const { owner, repo, number } = github.context.issue
  const { data: commits } = await octokit.pulls.listCommits({
    owner,
    repo,
    pull_number: number,
  })
  const commitShas = commits.map(commit => commit.sha)
  const [from] = commitShas
  const to = commitShas[commitShas.length - 1]

  return [from, to]
}

function getHistoryCommits(from, to) {
  const options = {
    from,
    to,
  }

  if (!from) {
    options.maxCount = 1
  }

  return new Promise((resolve, reject) => {
    const data = []

    gitRawCommits(options)
      .on('data', chunk => data.push(chunk.toString('utf-8')))
      .on('error', reject)
      .on('end', () => {
        resolve(data)
      })
  })
}

const showLintResults = async ([from, to]) => {
  const commits = await getHistoryCommits(from, to)
  const config = existsSync(configPath)
    ? await load({}, { file: configPath })
    : {}
  const results = await Promise.all(
    commits.map(commit => lint(commit, config.rules)),
  )
  const formattedResults = format(
    { results },
    {
      color: true,
      helpUrl:
        'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
    },
  )

  if (formattedResults) {
    core.setFailed(
      `You have commit messages with errors\n\n${formattedResults}`,
    )
  } else {
    console.log('Lint free! 🎉')
  }
}

const exitWithMessage = message => error => {
  core.setFailed(`${message}\n${error}`)
}

const main = () =>
  getRangeFromPullRequest()
    .catch(
      exitWithMessage("error trying to get list of pull request's commits"),
    )
    .then(showLintResults)
    .catch(exitWithMessage('error running commitlint'))

main()
