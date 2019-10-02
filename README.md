# Commitlint Github Action

Lints Pull Request commits with commitlint

## Usage

Create a github workflow in the `.github` folder, e.g. `.github/workflows/commitlint.yml`:

```yaml
name: Commitlint
on: [pull_request]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - uses: actions/checkout@v1
      - uses: wagoid/commitlint-github-action@v1.0.0
```

## Inputs

### `configFile`

The path to your commitlint config file. Default `commitlint.config.js`.

## About `extends` in your config file

This is a [`Docker` action](https://github.com/actions/toolkit/blob/e2adf403d6d14a9ca7474976ccaca20f72ff8209/docs/action-types.md#why-would-i-choose-a-docker-action), and was made like this so that you can run it with minimum setup, regardless of your repo's environment. It comes packed with the most famous shared configurations that you can use in your commitlint config's `extends` field:

- [@commitlint/config-angular](./@commitlint/config-angular)
- [@commitlint/config-conventional](./@commitlint/config-conventional)
- [@commitlint/config-lerna-scopes](./@commitlint/config-lerna-scopes)
- [@commitlint/config-patternplate](./@commitlint/config-patternplate)
- [conventional-changelog-lint-config-canonical](https://github.com/gajus/conventional-changelog-lint-config-canonical)
- [commitlint-config-jira](https://github.com/Gherciu/commitlint-jira)

If you have a custom shared config that lies in a private registry, let us know! We will be happy to cover this case if necessary.
