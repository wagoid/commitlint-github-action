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
- [conventional-changelog-lint-config-canonical](https://github.com/gajus/conventional-changelog-lint-config-canonical)
- [commitlint-config-jira](https://github.com/Gherciu/commitlint-jira)

Apart from the shared configurations that are included by default, you can also include extra dependencies for other configs and plugins that you want to use.

In order to do so, you can use `NODE_PATH` env var to make the action take those dependencies into account. Below is an example workflow that does that.

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
      - uses: actions/setup-node@v1
        with:
          node-version: '10.x'
      - run: npm install
      - name: Add dependencies for commitlint action
        # $GITHUB_WORKSPACE is the path to your repository
        run: echo "::set-env name=NODE_PATH::$GITHUB_WORKSPACE/node_modules"
      # Now the commitlint action will run considering its own dependencies and yours as well 🚀
      - uses: wagoid/commitlint-github-action@v1
```

---

💡 You can see other ways to install your dependencies (including private ones) in [the Setup Node action's docs](https://github.com/actions/setup-node).

---
