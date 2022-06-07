/* eslint-disable import/no-extraneous-dependencies */
const { maxLineLength } = require('@commitlint/ensure')

const bodyMaxLineLength = 100

const validateBodyMaxLengthIgnoringDeps = (parsedCommit) => {
  const { type, scope, body } = parsedCommit
  const isDepsCommit =
    ['chore', 'build'].includes(type) && ['deps', 'deps-dev'].includes(scope)

  return [
    isDepsCommit || !body || maxLineLength(body, bodyMaxLineLength),
    `body's lines must not be longer than ${bodyMaxLineLength}`,
  ]
}

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    'body-max-line-length': [0],
    'function-rules/body-max-line-length': [
      2,
      'always',
      validateBodyMaxLengthIgnoringDeps,
    ],
  },
}
