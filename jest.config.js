module.exports = {
  // Automatically clear mock calls and instances between every test
  // preset: 'rollup-jest',
  clearMocks: true,
  testEnvironment: '@commitlint/test-environment',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!dargs)'],
}
