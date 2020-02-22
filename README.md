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
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: wagoid/commitlint-github-action@v1
```

Alternatively, you can run on other event types such as `on: [push]`. In that case the action will lint the push event's commit(s) instead of linting commits from a pull request. You can also combine `push` and `pull_request` together in the same workflow.

**Note**: It's necessary that you specify the `fetch-depth` argument to `actions/checkout@v2` step. By default they fetch only latest commit of the branch, but we need more commits since we validate a range of commit messages.

## Inputs

### `configFile`

The path to your commitlint config file.

Default: `commitlint.config.js`

### `firstParent`

When set to true, we follow only the first parent commit when seeing a merge commit.

This helps to ignore errors in commits that were already present in your default branch (e.g. `master`) before adding conventional commit checks. More info in [git-log docs](https://git-scm.com/docs/git-log#Documentation/git-log.txt---first-parent).

Default: `true`

### `failOnWarnings`

Whether you want to fail on warnings or not.

Default: `false`

### `helpURL`

Link to a page explaining your commit message convention.

default: `https://github.com/conventional-changelog/commitlint/#what-is-commitlint`

## About `extends` in your config file

This is a [`Docker` action](https://github.com/actions/toolkit/blob/e2adf403d6d14a9ca7474976ccaca20f72ff8209/docs/action-types.md#why-would-i-choose-a-docker-action), and was made like this so that you can run it with minimum setup, regardless of your repo's environment. It comes packed with the most famous shared configurations that you can use in your commitlint config's `extends` field:

- [@commitlint/config-angular](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-angular)
- [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)
- [@commitlint/config-lerna-scopes](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-lerna-scopes)
- [@commitlint/config-patternplate](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-patternplate)
- [@elevai/commitlint-config-github](https://github.com/elevai-consulting/commitlint-github/)
- [conventional-changelog-lint-config-canonical](https://github.com/gajus/conventional-changelog-lint-config-canonical)
- [commitlint-config-jira](https://github.com/Gherciu/commitlint-jira)

If you have a custom shared config that lies in a private registry, let us know! We will be happy to cover this case if necessary.
