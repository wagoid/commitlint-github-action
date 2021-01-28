# Commitlint Github Action

Lints Pull Request commits with commitlint

## Usage

Create a github workflow in the `.github` folder, e.g. `.github/workflows/commitlint.yml`:

```yaml
name: Lint Commit Messages
on: [pull_request]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: wagoid/commitlint-github-action@v2
```

Alternatively, you can run on other event types such as `on: [push]`. In that case the action will lint the push event's commit(s) instead of linting commits from a pull request. You can also combine `push` and `pull_request` together in the same workflow.

**Note**: It's necessary that you specify the `fetch-depth` argument to `actions/checkout@v2` step. By default they fetch only latest commit of the branch, but we need more commits since we validate a range of commit messages.

## Inputs

### `configFile`

The path to your commitlint config file.

Default: `commitlint.config.js`

If the config file doesn't exist, [config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) settings will be loaded as a default fallback.

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

### `token`

Personal access token (PAT) used to interact with the GitHub API.
By default, the automatic token provided by GitHub is used.
You can see more info about GitHub's default token [here](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token).

default: `${{ github.token }}`

```
You have commit messages with errors

⧗   input: wrong message
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint

⧗   input: chore: my message
⚠   body must have leading blank line [body-leading-blank]

⚠   found 0 problems, 1 warnings
ⓘ   Get help: https://github.com/conventional-changelog/commitlint/#what-is-commitlint
```

```JSON
[
  {
    "hash": "cb0f846f13b490c2fd17bd5ed0b6f65ba9b86c75",
    "message": "wrong message",
    "valid": false,
    "errors": ["subject may not be empty", "type may not be empty"],
    "warnings": [],
  },
  {
    "hash": "cb14483cbde23b61322ffb8d3fcdc87f514a3141",
    "message": "chore: my message\n\nsome context without leading blank line",
    "valid": true,
    "errors": [],
    "warnings": ["body must have leading blank line"],
  },
]
```

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
name: Lint Commit Messages
on: [pull_request]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v1
        with:
          node-version: '10.x'
      - run: npm install
      # Run the commitlint action, considering its own dependencies and yours as well 🚀
      # `github.workspace` is the path to your repository.
      - uses: wagoid/commitlint-github-action@v2
        env:
          NODE_PATH: ${{ github.workspace }}/node_modules
```

---

💡 You can see other ways to install your dependencies (including private ones) in [the Setup Node action's docs](https://github.com/actions/setup-node).

---
