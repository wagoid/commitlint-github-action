const { existsSync } = require('fs')
const { resolve } = require('path')
const core = require('@actions/core')
const github = require('@actions/github')
const read = require('@commitlint/read')
const lint = require('@commitlint/lint')
const { format } = require('@commitlint/format')
const load = require('@commitlint/load')

const githubToken = process.env.GITHUB_TOKEN

const configPath = resolve(
  process.env.GITHUB_WORKSPACE,
  core.getInput('configFile'),
)

const getRangeFromPullRequest = async () => {
  const octokit = new github.GitHub(githubToken)
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

const showLintResults = async ([from, to]) => {
  const commits = await read({ from, to })
  const config = existsSync(configPath) ? await load(require(configPath)) : {}
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

  if (formattedResults.length) {
    process.stderr.write(formattedResults)
    process.exit(1)
  } else {
    console.log('Lint free! 🎉')
  }
}

const exitWithMessage = message => error => {
  console.log(message)
  console.error(error)
  process.exit(1)
}

const main = () =>
  getRangeFromPullRequest()
    .catch(
      exitWithMessage("error trying to get list of pull request's commits"),
    )
    .then(showLintResults)
    .catch(exitWithMessage('error running commitlint'))

main()
