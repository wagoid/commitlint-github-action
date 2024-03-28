/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env jest */
import { git } from '@commitlint/test'
import { jest, describe, it } from '@jest/globals'
import * as td from 'testdouble'
import {
  updatePushEnvVars,
  createPushEventPayload,
  createPullRequestEventPayload,
  updatePullRequestEnvVars,
  buildResponseCommit,
} from './testUtils.mjs'

const resultsOutputId = 'results'

const {
  matchers: { contains },
} = td

const initialEnv = { ...process.env }

const mockListCommits = td.func('listCommits')

const mockCore = td.object(['getInput', 'setFailed', 'setOutput'])

jest.unstable_mockModule('@actions/core', () => mockCore)

jest.unstable_mockModule('@actions/github', () => {
  class MockOctokit {
    constructor() {
      this.rest = {
        pulls: {
          listCommits: mockListCommits,
        },
      }
    }
  }

  return {
    ...jest.requireActual('@actions/github'),
    getOctokit: () => new MockOctokit(),
  }
})

const runAction = async () => {
  const action = (await import('./action.mjs')).default

  return action()
}

describe('Commit Linter action', () => {
  let cwd

  beforeEach(async () => {
    td.when(mockCore.getInput('configFile')).thenReturn(
      './commitlint.config.js',
    )
    td.when(mockCore.getInput('failOnWarnings')).thenReturn('false')
    td.when(mockCore.getInput('helpURL')).thenReturn(
      'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
    )
  })

  afterEach(() => {
    td.reset()
    process.env = initialEnv
    jest.resetModules()
  })

  it('should use default config when config file does not exist', async () => {
    td.when(mockCore.getInput('configFile')).thenReturn(
      './not-existing-config.js',
    )
    cwd = await git.bootstrap('fixtures/conventional', process.cwd())
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'wrong-message',
          message: 'wrong message',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(
      mockCore.setFailed(contains('You have commit messages with errors')),
    )
    td.verify(
      mockCore.setFailed(
        contains(
          'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
        ),
      ),
    )
  })

  it('should fail for single push with incorrect message', async () => {
    cwd = await git.bootstrap('fixtures/conventional', process.cwd())
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'wrong-message',
          message: 'wrong message',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(
      mockCore.setFailed(contains('You have commit messages with errors')),
    )
  })

  it('should fail for push range with wrong messages', async () => {
    cwd = await git.bootstrap('fixtures/conventional', process.cwd())
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'wrong-message-1',
          message: 'wrong message 1',
        },
        {
          id: 'wrong-message-2',
          message: 'wrong message 2',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)

    await runAction()
    td.verify(mockCore.setFailed(contains('wrong message 1')))
    td.verify(mockCore.setFailed(contains('wrong message 2')))
  })

  it('should pass for push range with wrong messages with failOnErrors set to false', async () => {
    td.when(mockCore.getInput('failOnErrors')).thenReturn('false')
    cwd = await git.bootstrap('fixtures/conventional', process.cwd())
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'wrong-message-1',
          message: 'wrong message 1',
        },
        {
          id: 'wrong-message-2',
          message: 'wrong message 2',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
    td.verify(console.log(contains('wrong message 1')))
    td.verify(console.log(contains('wrong message 2')))
    td.verify(console.log(contains('Passing despite errors ✅')))
  })

  it('should pass for push range with correct messages with failOnErrors set to false', async () => {
    td.when(mockCore.getInput('failOnErrors')).thenReturn('false')
    cwd = await git.bootstrap('fixtures/conventional', process.cwd())
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'correct-message-1',
          message: 'chore: correct message 1',
        },
        {
          id: 'correct-message-2',
          message: 'chore: correct message 2',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
    td.verify(console.log('Lint free! 🎉'))
  })

  it('should pass for push range with correct messages', async () => {
    cwd = await git.bootstrap('fixtures/conventional', process.cwd())
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'correct-message-1',
          message: 'chore: correct message 1',
        },
        {
          id: 'correct-message-2',
          message: 'chore: correct message 2',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
    td.verify(console.log('Lint free! 🎉'))
  })

  it('should fail for commit with scope that is not a lerna package', async () => {
    cwd = await git.bootstrap('fixtures/lerna-scopes', process.cwd())
    td.when(mockCore.getInput('configFile')).thenReturn(
      './commitlint.config.yml',
    )
    await createPushEventPayload(cwd, {
      commits: [
        {
          message: 'chore(wrong): not including package scope',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(
      mockCore.setFailed(contains('chore(wrong): not including package scope')),
    )
  })

  it('should pass for scope that is a lerna package', async () => {
    cwd = await git.bootstrap('fixtures/lerna-scopes', process.cwd())
    td.when(mockCore.getInput('configFile')).thenReturn(
      './commitlint.config.yml',
    )
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'correct-message',
          message: 'chore(second-package): this works',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(console.log('Lint free! 🎉'))
  })

  it("should fail for commit that doesn't comply with jira rules", async () => {
    cwd = await git.bootstrap('fixtures/jira', process.cwd())
    td.when(mockCore.getInput('configFile')).thenReturn(
      './commitlint.config.js',
    )
    await createPushEventPayload(cwd, {
      commits: [
        {
          id: 'wrong-message',
          message: 'ib-21212121212121: without jira ticket',
        },
      ],
    })
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)

    await runAction()

    td.verify(
      mockCore.setFailed(contains('ib-21212121212121: without jira ticket')),
    )
    td.verify(
      mockCore.setFailed(
        contains(
          'ib-21212121212121 taskId must not be longer than 9 characters',
        ),
      ),
    )
    td.verify(
      mockCore.setFailed(
        contains('ib-21212121212121 taskId must be uppercase case'),
      ),
    )
    td.verify(
      mockCore.setFailed(
        contains('ib-21212121212121 commitStatus must be uppercase case'),
      ),
    )
  })

  it('should pass when commits are not available', async () => {
    td.when(mockCore.getInput('configFile')).thenReturn(
      './commitlint.config.js',
    )
    cwd = await git.bootstrap('fixtures/conventional', process.cwd())
    await createPushEventPayload(cwd, {})
    updatePushEnvVars(cwd)
    td.replace(process, 'cwd', () => cwd)
    td.replace(console, 'log')

    await runAction()

    td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
    td.verify(console.log('Lint free! 🎉'))
  })

  describe.each(['pull_request', 'pull_request_target'])(
    'when there are multiple commits failing in the %s event',
    (eventName) => {
      let expectedResultsOutput
      const firstCommit = buildResponseCommit('first-commit', 'wrong message 1')
      const secondCommit = buildResponseCommit(
        'second-commit',
        'wrong message 2',
      )

      beforeEach(async () => {
        cwd = await git.bootstrap('fixtures/conventional', process.cwd())
        td.when(mockCore.getInput('configFile')).thenReturn(
          './commitlint.config.js',
        )
        await createPullRequestEventPayload(cwd)
        updatePullRequestEnvVars(cwd, { eventName })
        td.when(
          mockListCommits({
            owner: 'wagoid',
            repo: 'commitlint-github-action',
            pull_number: '1',
            per_page: 100,
          }),
        ).thenResolve({
          data: [firstCommit, secondCommit],
        })
        td.replace(process, 'cwd', () => cwd)

        expectedResultsOutput = [
          {
            hash: firstCommit.sha,
            message: firstCommit.commit.message,
            valid: false,
            errors: ['subject may not be empty', 'type may not be empty'],
            warnings: [],
          },
          {
            hash: secondCommit.sha,
            message: secondCommit.commit.message,
            valid: false,
            errors: ['subject may not be empty', 'type may not be empty'],
            warnings: [],
          },
        ]
      })

      it('should NOT show errors for a message from before the push', async () => {
        await runAction()

        td.verify(mockCore.setFailed(contains('message from before push')), {
          times: 0,
        })
      })

      it('should show errors for the first wrong message', async () => {
        await runAction()

        td.verify(mockCore.setFailed(contains(firstCommit.commit.message)))
      })

      it('should show errors for the second wrong message', async () => {
        await runAction()

        td.verify(mockCore.setFailed(contains(secondCommit.commit.message)))
      })

      it('should generate a JSON output of the errors', async () => {
        await runAction()

        td.verify(mockCore.setOutput(resultsOutputId, expectedResultsOutput))
      })
    },
  )

  describe('when it fails to fetch commits', () => {
    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional', process.cwd())
      td.when(mockCore.getInput('configFile')).thenReturn(
        './commitlint.config.js',
      )
      await createPullRequestEventPayload(cwd)
      updatePullRequestEnvVars(cwd)
      td.when(
        mockListCommits({
          owner: 'wagoid',
          repo: 'commitlint-github-action',
          pull_number: '1',
          per_page: 100,
        }),
      ).thenReject(new Error('HttpError: Bad credentials'))
      td.replace(process, 'cwd', () => cwd)
    })

    it('should show an error message', async () => {
      await runAction()

      td.verify(
        mockCore.setFailed(
          contains("error trying to get list of pull request's commits"),
        ),
      )
    })

    it('should show the original error message', async () => {
      await runAction()

      td.verify(mockCore.setFailed(contains('HttpError: Bad credentials')))
    })
  })

  describe("when there's a single commit with correct message", () => {
    const commit = {
      id: 'correct-message',
      message: 'chore: correct message',
    }

    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional', process.cwd())
      await createPushEventPayload(cwd, { commits: [commit] })
      updatePushEnvVars(cwd)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should pass', async () => {
      await runAction()

      td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
    })

    it('should show success message', async () => {
      await runAction()

      td.verify(console.log('Lint free! 🎉'))
    })

    it('should generate a JSON output of the messages', async () => {
      const expectedResultsOutput = [
        {
          hash: commit.id,
          message: commit.message,
          valid: true,
          errors: [],
          warnings: [],
        },
      ]

      await runAction()

      td.verify(mockCore.setOutput(resultsOutputId, expectedResultsOutput))
    })
  })

  describe('when all errors are just warnings', () => {
    let expectedResultsOutput

    beforeEach(async () => {
      const correctCommit = {
        id: 'correct-commit',
        message: 'chore: correct message with no warnings',
      }
      const commitWithWarning = {
        id: 'commit-with-warning',
        message:
          'chore: correct message\nsome context without leading blank line',
      }
      cwd = await git.bootstrap('fixtures/conventional', process.cwd())
      await createPushEventPayload(cwd, {
        commits: [commitWithWarning, correctCommit],
      })
      updatePushEnvVars(cwd)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')

      expectedResultsOutput = [
        {
          hash: commitWithWarning.id,
          message:
            'chore: correct message\n\nsome context without leading blank line',
          valid: true,
          errors: [],
          warnings: ['body must have leading blank line'],
        },
        {
          hash: correctCommit.id,
          message: 'chore: correct message with no warnings',
          valid: true,
          errors: [],
          warnings: [],
        },
      ]
    })

    it('should pass and show that warnings exist', async () => {
      await runAction()

      td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
      td.verify(console.log(contains('You have commit messages with warnings')))
    })

    it('should show the results in an output', async () => {
      await runAction()

      td.verify(mockCore.setOutput(resultsOutputId, expectedResultsOutput))
    })

    describe('and failOnWarnings is set to true', () => {
      beforeEach(() => {
        td.when(mockCore.getInput('failOnWarnings')).thenReturn('true')
      })

      it('should fail', async () => {
        await runAction()

        td.verify(
          mockCore.setFailed(contains('You have commit messages with errors')),
        )
      })

      it('should show the results in an output', async () => {
        await runAction()

        td.verify(mockCore.setOutput(resultsOutputId, expectedResultsOutput))
      })
    })
  })

  describe('when a subset of errors are just warnings', () => {
    const commitWithWarning = {
      id: 'first-commit',
      message:
        'chore: correct message\nsome context without leading blank line',
    }
    const wrongCommit = {
      id: 'second-commit',
      message: 'wrong-message',
    }

    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional', process.cwd())
      await createPushEventPayload(cwd, {
        commits: [wrongCommit, commitWithWarning],
      })
      updatePushEnvVars(cwd)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should fail', async () => {
      await runAction()

      td.verify(
        mockCore.setFailed(contains('You have commit messages with errors')),
      )
    })

    it('should show the results in an output', async () => {
      const expectedResultsOutput = [
        {
          hash: wrongCommit.id,
          message: wrongCommit.message,
          valid: false,
          errors: ['subject may not be empty', 'type may not be empty'],
          warnings: [],
        },
        {
          hash: commitWithWarning.id,
          message:
            'chore: correct message\n\nsome context without leading blank line',
          valid: true,
          errors: [],
          warnings: ['body must have leading blank line'],
        },
      ]

      await runAction()

      td.verify(mockCore.setOutput(resultsOutputId, expectedResultsOutput))
    })

    describe('and failOnWarnings is set to true', () => {
      beforeEach(() => {
        td.when(mockCore.getInput('failOnWarnings')).thenReturn('true')
      })

      it('should fail', async () => {
        await runAction()

        td.verify(
          mockCore.setFailed(contains('You have commit messages with errors')),
        )
      })
    })
  })

  describe('when commit contains required signed-off-by message', () => {
    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/signed-off-by', process.cwd())
      await createPushEventPayload(cwd, {
        commits: [
          {
            id: 'correct-commit',
            message:
              'chore: correct message\n\nsome context without leading blank line.\n\nSigned-off-by: John Doe <john.doe@example.com>',
          },
        ],
      })
      updatePushEnvVars(cwd)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should pass', async () => {
      await runAction()

      td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
      td.verify(console.log('Lint free! 🎉'))
    })
  })

  describe('when a different helpUrl is provided in the config', () => {
    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/custom-help-url', process.cwd())
      await createPushEventPayload(cwd, {
        commits: [
          {
            id: 'wrong-commit',
            message: 'wrong message',
          },
        ],
      })
      updatePushEnvVars(cwd)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should show custom URL from helpUrl', async () => {
      await runAction()

      td.verify(
        mockCore.setFailed(contains('You have commit messages with errors')),
      )
      td.verify(mockCore.setFailed(contains(' https://example.org')))
    })
  })

  describe('when commitDepth is provided in the config', () => {
    const incorrectCommit = {
      id: 'incorrect-message',
      message: 'incorrect message within commit depth',
    }

    beforeEach(async () => {
      cwd = await git.bootstrap('fixtures/conventional', process.cwd())
      await createPushEventPayload(cwd, {
        commits: [
          { id: 'correct-commit', message: 'chore: correct message 2' },
          incorrectCommit,
        ],
      })
      updatePushEnvVars(cwd)
      td.replace(process, 'cwd', () => cwd)
      td.replace(console, 'log')
    })

    it('should pass when only considering messages defined by commitDepth', async () => {
      td.when(mockCore.getInput('commitDepth')).thenReturn('1')
      await runAction()

      td.verify(mockCore.setFailed(), { times: 0, ignoreExtraArgs: true })
      td.verify(console.log('Lint free! 🎉'))
    })

    it('should fail when older commits have lint errors', async () => {
      td.when(mockCore.getInput('commitDepth')).thenReturn('2')
      await runAction()

      td.verify(mockCore.setFailed(contains(incorrectCommit.message)))
    })

    it('should consider all commits when an invalid commit depth is passed in config', async () => {
      td.when(mockCore.getInput('commitDepth')).thenReturn('xzy')
      await runAction()

      td.verify(mockCore.setFailed(contains(incorrectCommit.message)))
    })
  })
})
