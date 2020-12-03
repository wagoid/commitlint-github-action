module.exports = {
  '*.{ts,tsx,vue,css,less,scss,html,htm,md,markdown}': 'prettier --write',
  '*.{js,jsx,json,yml,yaml}': ['prettier --write', () => 'npm run test'],
}
