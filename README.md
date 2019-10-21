# Commitlint Github Action

Lints Pull Request commits with commitlint

## Usage

Create a github workflow in the `.github` folder, e.g. `.github/workflows/commitlint.yml`:

```yaml
name: Commitlint
on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - uses: actions/checkout@v1
      - uses: wagoid/commitlint-github-action@v1.2.2
```

Alternatively, you can run on other event types such as `on: [push]`. In that case the action will lint the current commit instead of linting all commits from a pull request.

## Inputs

### `configFile`

The path to your commitlint config file. Default `commitlint.config.js`.

### `firstParent`

When set to true, we follow only the first parent commit when seeing a merge commit.

This helps to ignore errors in commits that were already present in your default branch (e.g. `master`) before adding conventional commit checks.
More info in [git-log docs](https://git-scm.com/docs/git-log#Documentation/git-log.txt---first-parent).

Default `true`

## About `extends` in your config file

This is a [`Docker` action](https://github.com/actions/toolkit/blob/e2adf403d6d14a9ca7474976ccaca20f72ff8209/docs/action-types.md#why-would-i-choose-a-docker-action), and was made like this so that you can run it with minimum setup, regardless of your repo's environment. It comes packed with the most famous shared configurations that you can use in your commitlint config's `extends` field:

- [@commitlint/config-angular](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-angular)
- [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)
- [@commitlint/config-lerna-scopes](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-lerna-scopes)
- [@commitlint/config-patternplate](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-patternplate)
- [conventional-changelog-lint-config-canonical](https://github.com/gajus/conventional-changelog-lint-config-canonical)
- [commitlint-config-jira](https://github.com/Gherciu/commitlint-jira)

If you have a custom shared config that lies in a private registry, let us know! We will be happy to cover this case if necessary.
