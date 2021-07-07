import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import execa from 'execa'

const writeFile = promisify(fs.writeFile)

export const updateEnvVars = (envVars) => {
  Object.keys(envVars).forEach((key) => {
    process.env[key] = envVars[key]
  })
}

export const gitEmptyCommit = (cwd, message) =>
  execa('git', ['commit', '--allow-empty', '-m', message], { cwd })

export const getCommitHashes = async (cwd) => {
  const { stdout } = await execa.command('git log --pretty=%H', { cwd })
  const hashes = stdout.split('\n').reverse()

  return hashes
}

export const updatePushEnvVars = (cwd, to) => {
  updateEnvVars({
    GITHUB_WORKSPACE: cwd,
    GITHUB_EVENT_NAME: 'push',
    GITHUB_SHA: to,
  })
}

export const createPushEventPayload = async (
  cwd,
  { before = null, to, forced = false },
) => {
  const payload = {
    after: to,
    before,
    forced,
  }
  const eventPath = path.join(cwd, 'pushEventPayload.json')

  updateEnvVars({ GITHUB_EVENT_PATH: eventPath })
  await writeFile(eventPath, JSON.stringify(payload), 'utf8')
}

export const createPullRequestEventPayload = async (cwd) => {
  const payload = {
    number: '1',
    repository: {
      owner: {
        login: 'wagoid',
      },
      name: 'commitlint-github-action',
    },
  }

  const eventPath = path.join(cwd, 'pullRequestEventPayload.json')

  updateEnvVars({
    GITHUB_EVENT_PATH: eventPath,
    GITHUB_REPOSITORY: 'wagoid/commitlint-github-action',
  })
  await writeFile(eventPath, JSON.stringify(payload), 'utf8')
}

export const updatePullRequestEnvVars = (cwd, to, options = {}) => {
  const { eventName = 'pull_request' } = options

  updateEnvVars({
    GITHUB_WORKSPACE: cwd,
    GITHUB_EVENT_NAME: eventName,
    GITHUB_SHA: to,
  })
}
