const actionYamlUpdater = require.resolve('./.github/tasks/actionYamlUpdater')

module.exports = {
  packageFiles: ['package.json'],
  bumpFiles: [
    'package.json',
    'package-lock.json',
    {
      filename: 'action.yml',
      updater: actionYamlUpdater,
    },
  ],
  releaseCommitMessageFormat:
    'chore(release): publish {{currentTag}} [skip-ci]',
}
