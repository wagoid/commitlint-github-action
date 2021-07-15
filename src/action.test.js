/* eslint-env jest */
import { jest } from '@jest/globals'
import { git } from '@commitlint/test'
import execa from 'execa'
import td from 'testdouble'
import {
  gitEmptyCommit,
  getCommitHashes,
  updatePushEnvVars,
  createPushEventPayload,
  createPullRequestEventPayload,
  updatePullRequestEnvVars,
} from './testUtils.js'

const resultsOutputId = 'results'

const {
  matchers: { contains },
} = td

const initialEnv = { ...process.env }

const listCommits = td.func('listCommits')

const runAction = async () => {
  const github = (await import('@actions/github')).default
  class MockOctokit {
    constructor() {
      this.pulls = {
        listCommits,
      }
    }
  }

  td.replace(github, 'getOctokit', () => new MockOctokit())

  const action = (await import('./action.js')).default

  return action()
}

describe('Commit Linter action', () => {
  let core
  let cwd

  beforeEach(async () => {
    core = (await import('@actions/core')).default
    td.replace(core, 'getInput')
    td.replace(core, 'setFailed')
    td.replace(core, 'setOutput')
    td.when(core.getInput('configFile')).thenReturn('./commitlint.config.cjs')
    td.when(core.getInput('firstParent')).thenReturn('true')
    td.when(core.getInput('failOnWarnings')).thenReturn('false')
    td.when(core.getInput('helpURL')).thenReturn(
      'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
    )
  })

  afterEach(() => {
    td.reset()
    process.env = initialEnv
    jest.resetModules()
  })

  it('should use default config when config file does not exist', async () => {
    td.when(core.getInput('configFile')).thenReturn('./not-existing-config.js')
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'wrong message')
    const [to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(core.setFailed(contains('You have commit messages with errors')))
  })

  it('should fail for single push with incorrect message', async () => {
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'wrong message')
    const [to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(core.setFailed(contains('You have commit messages with errors')))
  })

  it('should fail for push range with wrong messages', async () => {
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'message from before push')
    await gitEmptyCommit(cwd, 'wrong message 1')
    await gitEmptyCommit(cwd, 'wrong message 2')
    const [before, , to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { before, to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(core.setFailed(contains('wrong message 1')))
    td.verify(core.setFailed(contains('wrong message 2')))
  })

  it('should pass for push range with correct messages', async () => {
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'message from before push')
    await gitEmptyCommit(cwd, 'chore: correct message 1')
    await gitEmptyCommit(cwd, 'chore: correct message 2')
    const [before, , to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { before, to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(core.setFailed(), { times: 0, ignoreExtraArgs: true })
    td.verify(console.log('Lint free! 🎉'))
  })

  it('should lint only last commit for forced push', async () => {
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'message from before push')
    await gitEmptyCommit(cwd, 'wrong message 1')
    await gitEmptyCommit(cwd, 'wrong message 2')
    const [before, , to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { before, to, forced: true })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'warn')

    await runAction()

    td.verify(
      console.warn(
        'Commit was forced, checking only the latest commit from push instead of a range of commit messages',
      ),
    )
    td.verify(core.setFailed(contains('wrong message 1')), { times: 0 })
    td.verify(core.setFailed(contains('wrong message 2')))
  })

  it('should lint only last commit when "before" field is an empty sha', async () => {
    const gitEmptySha = '0000000000000000000000000000000000000000'
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'message from before push')
    await gitEmptyCommit(cwd, 'wrong message 1')
    await gitEmptyCommit(cwd, 'wrong message 2')
    const [, , to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { before: gitEmptySha, to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(core.setFailed(contains('wrong message 1')), { times: 0 })
    td.verify(core.setFailed(contains('wrong message 2')))
  })

  it('should fail for commit with scope that is not a lerna package', async () => {
    cwd = await git.bootstrap('fixtures/lerna-scopes')
    td.when(core.getInput('configFile')).thenReturn('./commitlint.config.yml')
    await gitEmptyCommit(cwd, 'chore(wrong): not including package scope')
    const [to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(
      core.setFailed(contains('chore(wrong): not including package scope')),
    )
  })

  it('should pass for scope that is a lerna package', async () => {
    cwd = await git.bootstrap('fixtures/lerna-scopes')
    td.when(core.getInput('configFile')).thenReturn('./commitlint.config.yml')
    await gitEmptyCommit(cwd, 'chore(second-package): this works')
    const [to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(console.log('Lint free! 🎉'))
  })

  it("should fail for commit that doesn't comply with jira rules", async () => {
    cwd = await git.bootstrap('fixtures/jira')
    td.when(core.getInput('configFile')).thenReturn('./commitlint.config.cjs')
    await gitEmptyCommit(cwd, 'ib-21212121212121: without jira ticket')
    const [to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(
      core.setFailed(contains('ib-21212121212121: without jira ticket')),
    )
    td.verify(
      core.setFailed(
        contains(
          'ib-21212121212121 taskId must not be loonger than 9 characters',
        ),
      ),
    )
    td.verify(
      core.setFailed(
        contains('ib-21212121212121 taskId must be uppercase case'),
      ),
    )
    td.verify(
      core.setFailed(
        contains('ib-21212121212121 commitStatus must be uppercase case'),
      ),
    )
  })

  it('should NOT consider commits from another branch', async () => {
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'chore: commit before')
    await gitEmptyCommit(cwd, 'chore: correct message')
    await execa.command('git checkout -b another-branch', { cwd })
    await gitEmptyCommit(cwd, 'wrong commit from another branch')
    await execa.command('git checkout -', { cwd })
    await execa.command('git merge --no-ff another-branch', { cwd })
    const [before, , to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { before, to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(console.log('Lint free! 🎉'))
  })

  it('should consider commits from another branch when firstParent is false', async () => {
    cwd = await git.bootstrap('fixtures/conventional')
    await gitEmptyCommit(cwd, 'chore: commit before')
    await gitEmptyCommit(cwd, 'chore: correct message')
    await execa.command('git checkout -b another-branch', { cwd })
    await gitEmptyCommit(cwd, 'wrong commit from another branch')
    await execa.command('git checkout -', { cwd })
    await execa.command('git merge --no-ff another-branch', { cwd })
    const [before, , , to] = await getCommitHashes(cwd)
    await createPushEventPayload(cwd, { before, to })
    updatePushEnvVars(cwd, to)
    td.replace(process, 'cwd', () => cwd)
    td.when(core.getInput('firstParent')).thenReturn('false')

    await runAction()

    td.verify(core.setFailed(contains('wrong commit from another branch')))
  })

  describe.each(['pull_request', 'pull_request_target'])(
    'when there are multiple commits failing in the %s event',
    (eventName) => {
      let expectedResultsOutput
      const firstMessage = 'wrong message 1'
      const secondMessage = 'wrong message 2'

      beforeEach(async () => {
        cwd = await git.bootstrap('fixtures/conventional')
        td.when(core.getInput('configFile')).thenReturn(
          './commitlint.config.cjs',
        )
        await gitEmptyCommit(cwd, 'message from before push')
        await gitEmptyCommit(cwd, firstMessage)
        await gitEmptyCommit(cwd, secondMessage)
        await createPullRequestEventPayload(cwd)
        const [, first, to] = await getCommitHashes(cwd)
        updatePullRequestEnvVars(cwd, to, { eventName })
        td.when(
          listCommits({
            owner: 'wagoid',
            repo: 'commitlint-github-action',
            pull_number: '1',
          }),
        ).thenResolve({
          data: [first, to].map((sha) => ({ sha })),
        })
        td.replace(process, 'cwd', () => cwd)

        expectedResultsOutput = [
          {
            hash: to,
            message: secondMessage,
            valid: false,
            errors: ['subject may not be empty', 'type may not be empty'],
            warnings: [],
          },
          {
            hash: first,
            message: firstMessage,
            valid: false,
            errors: ['subject may not be empty', 'type may not be empty'],
            warnings: [],
          },
        ]
      })

      it('should NOT show errors for a message from before the push', async () => {
        await runAction()

        td.verify(core.setFailed(contains('message from before push')), {
          times: 0,
        })
      })

      it('should show errors for the first wrong message', async () => {
        await runAction()

        td.verify(core.setFailed(contains(firstMessage)))
      })

      it('should show errors for the second wrong message', async () => {
        await runAction()

        td.verify(core.setFailed(contains(secondMessage)))
      })

      it('should generate a JSON output of the errors', async () => {
        await runAction()

        td.verify(core.setOutput(resultsOutputId, expectedResultsOutput))
      })
    },
  )

  describe('when it fails to fetch commits', () => {
    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional')
      td.when(core.getInput('configFile')).thenReturn('./commitlint.config.cjs')
      await gitEmptyCommit(cwd, 'commit message')
      await createPullRequestEventPayload(cwd)
      const [to] = await getCommitHashes(cwd)
      updatePullRequestEnvVars(cwd, to)
      td.when(
        listCommits({
          owner: 'wagoid',
          repo: 'commitlint-github-action',
          pull_number: '1',
        }),
      ).thenReject(new Error('HttpError: Bad credentials'))
      td.replace(process, 'cwd', () => cwd)
    })

    it('should show an error message', async () => {
      await runAction()

      td.verify(
        core.setFailed(
          contains("error trying to get list of pull request's commits"),
        ),
      )
    })

    it('should show the original error message', async () => {
      await runAction()

      td.verify(core.setFailed(contains('HttpError: Bad credentials')))
    })
  })

  describe("when there's a single commit with correct message", () => {
    let commitHash

    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional')
      await gitEmptyCommit(cwd, 'chore: correct message')
      const [to] = await getCommitHashes(cwd)
      commitHash = to
      await createPushEventPayload(cwd, { to })
      updatePushEnvVars(cwd, to)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should pass', async () => {
      await runAction()

      td.verify(core.setFailed(), { times: 0, ignoreExtraArgs: true })
    })

    it('should show success message', async () => {
      await runAction()

      td.verify(console.log('Lint free! 🎉'))
    })

    it('should generate a JSON output of the messages', async () => {
      const expectedResultsOutput = [
        {
          hash: commitHash,
          message: 'chore: correct message',
          valid: true,
          errors: [],
          warnings: [],
        },
      ]

      await runAction()

      td.verify(core.setOutput(resultsOutputId, expectedResultsOutput))
    })
  })

  describe('when all errors are just warnings', () => {
    let expectedResultsOutput

    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional')
      await gitEmptyCommit(cwd, 'chore: previous commit')
      await gitEmptyCommit(cwd, 'chore: correct message with no warnings')
      await gitEmptyCommit(
        cwd,
        'chore: correct message\nsome context without leading blank line',
      )
      const [before, from, to] = await getCommitHashes(cwd)
      await createPushEventPayload(cwd, { before, to })
      updatePushEnvVars(cwd, to)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')

      expectedResultsOutput = [
        {
          hash: to,
          message:
            'chore: correct message\n\nsome context without leading blank line',
          valid: true,
          errors: [],
          warnings: ['body must have leading blank line'],
        },
        {
          hash: from,
          message: 'chore: correct message with no warnings',
          valid: true,
          errors: [],
          warnings: [],
        },
      ]
    })

    it('should pass and show that warnings exist', async () => {
      await runAction()

      td.verify(core.setFailed(), { times: 0, ignoreExtraArgs: true })
      td.verify(console.log(contains('You have commit messages with warnings')))
    })

    it('should show the results in an output', async () => {
      await runAction()

      td.verify(core.setOutput(resultsOutputId, expectedResultsOutput))
    })

    describe('and failOnWarnings is set to true', () => {
      beforeEach(() => {
        td.when(core.getInput('failOnWarnings')).thenReturn('true')
      })

      it('should fail', async () => {
        await runAction()

        td.verify(
          core.setFailed(contains('You have commit messages with errors')),
        )
      })

      it('should show the results in an output', async () => {
        await runAction()

        td.verify(core.setOutput(resultsOutputId, expectedResultsOutput))
      })
    })
  })

  describe('when a subset of errors are just warnings', () => {
    let firstHash
    let secondHash

    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional')
      await gitEmptyCommit(cwd, 'message from before push')
      await gitEmptyCommit(
        cwd,
        'chore: correct message\nsome context without leading blank line',
      )
      await gitEmptyCommit(cwd, 'wrong message')
      const [before, firstCommit, to] = await getCommitHashes(cwd)
      firstHash = firstCommit
      secondHash = to
      await createPushEventPayload(cwd, { before, to })
      updatePushEnvVars(cwd, to)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should fail', async () => {
      await runAction()

      td.verify(
        core.setFailed(contains('You have commit messages with errors')),
      )
    })

    it('should show the results in an output', async () => {
      const expectedResultsOutput = [
        {
          hash: secondHash,
          message: 'wrong message',
          valid: false,
          errors: ['subject may not be empty', 'type may not be empty'],
          warnings: [],
        },
        {
          hash: firstHash,
          message:
            'chore: correct message\n\nsome context without leading blank line',
          valid: true,
          errors: [],
          warnings: ['body must have leading blank line'],
        },
      ]

      await runAction()

      td.verify(core.setOutput(resultsOutputId, expectedResultsOutput))
    })

    describe('and failOnWarnings is set to true', () => {
      beforeEach(() => {
        td.when(core.getInput('failOnWarnings')).thenReturn('true')
      })

      it('should fail', async () => {
        await runAction()

        td.verify(
          core.setFailed(contains('You have commit messages with errors')),
        )
      })
    })
  })

  describe('when commit contains signed-off-by message', () => {
    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional')
      await gitEmptyCommit(
        cwd,
        'chore: correct message\n\nsome context without leading blank line\nSigned-off-by: John Doe <john.doe@example.com>',
      )
      const [to] = await getCommitHashes(cwd)
      await createPushEventPayload(cwd, { to })
      updatePushEnvVars(cwd, to)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should pass', async () => {
      await runAction()

      td.verify(core.setFailed(), { times: 0, ignoreExtraArgs: true })
      td.verify(console.log('Lint free! 🎉'))
    })
  })
})
