export default {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  testEnvironment: '@commitlint/test-environment',
  testMatch: [
    '**/__tests__/**/*.?(m)[jt]s?(x)',
    '**/?(*.)+(spec|test).?(m)[tj]s?(x)',
  ],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
}
