const dargs = require('dargs')
const execa = require('execa')

const commitDelimiter = '--------->commit---------'

const hashDelimiter = '--------->hash---------'

const format = `%H${hashDelimiter}%B%n${commitDelimiter}`

const buildGitArgs = (gitOpts) => {
  const { from, to, ...otherOpts } = gitOpts
  const formatArg = `--format=${format}`
  const fromToArg = [from, to].filter(Boolean).join('..')

  const gitArgs = ['log', formatArg, fromToArg]

  return gitArgs.concat(
    dargs(gitOpts, {
      includes: Object.keys(otherOpts),
    }),
  )
}

const gitCommits = async (gitOpts) => {
  const args = buildGitArgs(gitOpts)

  const { stdout } = await execa('git', args, {
    cwd: process.cwd(),
  })

  const commits = stdout.split(`${commitDelimiter}\n`).map((messageItem) => {
    const [hash, message] = messageItem.split(hashDelimiter)

    return {
      hash,
      message,
    }
  })

  return commits
}

module.exports = gitCommits
