module.exports = {
  '*.{ts,tsx,vue,css,less,scss,html,htm,md,markdown}': 'prettier --write',
  '*.{json,yml,yaml}': ['prettier --write', () => 'npm run test'],
  '*.{js,jsx}': ['eslint --fix', () => 'npm run test'],
}
