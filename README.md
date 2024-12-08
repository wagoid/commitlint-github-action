# Commitlint Github Action

Lints Pull Request commits with [commitlint](https://commitlint.js.org/).

## Usage

Create a github workflow in the `.github` folder, e.g. `.github/workflows/commitlint.yml`:

```yaml
name: Lint Commit Messages
on: [pull_request]

permissions:
  contents: read
  pull-requests: read

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: wagoid/commitlint-github-action@v6
```

Alternatively, you can run on other event types such as `on: [push]`. In that case the action will lint the push event's commit(s) instead of linting commits from a pull request. You can also combine `push` and `pull_request` together in the same workflow.

### Using with GitHub Merge Queues

GitHub's [merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) is a feature that allows you to queue pull requests for merging once they meet certain criteria. When using merge queues, you need to ensure that your workflows are set up to handle the merge_group event, which is triggered when pull requests are added to the merge queue.

#### Workflow Configuration

To use the commitlint-github-action with merge queues, you need to set up a workflow that listens to the merge_group event. Here's an example of how to configure your workflow:

```yaml
name: Lint Commit Messages in Merge Queue

on:
  merge_group:
    types:
      - checks_requested

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.sha }}

      - uses: wagoid/commitlint-github-action@v6
```

#### Important Note:

To ensure that the merge_group event triggers correctly, you need to have **at least one workflow that responds to the pull_request event** with a job named the same as the one in your merge_group workflow (**commitlint** in this example). This is necessary because the merge queue relies on the existence of status checks from the pull request context.

Here's a minimal pull_request workflow to satisfy this requirement:

```yaml
name: Placeholder Workflow for Merge Queue

on:
  pull_request:

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3
```

This workflow can also be a meaningful one that checks out the commits in your PR and runs other checks, but it must have a job named **commitlint**.

### Enabling Merge Queues in Your Repository

Before you can use merge queues, you need to enable the feature in your repository settings:

- Go to your repository's Settings > Branches.
- Under Branch protection rules, edit the rule for your target branch (e.g. master).
- Enable Require merge queue.
- Specify your new job (e.g. commitlint) and any other required status checks, that must pass before merging.

For more information on configuring merge queues, refer to the [GitHub documentation on managing a merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).

## Inputs

You can supply these inputs to the `wagoid/commitlint-github-action@v6` step.

### `configFile`

The path to your commitlint config file.

Default: `commitlint.config.mjs`

If the config file doesn't exist, [config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) settings will be loaded as a default fallback.

Details on the configuration file can be found on [the commitlint website](https://commitlint.js.org/#/reference-configuration).

Note: `commitlint.config.js` doesn't work with this action. If you use a JS config file, it's required to be an ES Module (`.mjs` extension)

### `failOnWarnings`

Whether you want to fail on warnings or not.

Default: `false`

### `failOnErrors`

Whether you want to fail on errors or not. Still outputs the results, just forces the action to pass even if errors are detected.

Default: `true`

### `helpURL`

Link to a page explaining your commit message convention.

default: `https://github.com/conventional-changelog/commitlint/#what-is-commitlint`

### `commitDepth`

When set to a valid Integer value - X, considers only the latest X number of commits.

default: `null` (Equivalent to linting all commits)

### `token`

Personal access token (PAT) used to interact with the GitHub API.
By default, the automatic token provided by GitHub is used.
You can see more info about GitHub's default token [here](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token).

default: `${{ github.token }}`

## Outputs

### `results`

The error and warning messages for each one of the analyzed commits. This is useful if you want to use the commitlint results in a JSON format in other jobs. See [the documentation](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions#fromjson) on how to read JSON information from outputs.

Below you can see an example text output together with its corresponding JSON output:

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
- [commitlint-config-function-rules](https://github.com/vidavidorra/commitlint-plugin-function-rules#readme)

Apart from the shared configurations that are included by default, you can also include extra dependencies for other configs and plugins that you want to use.

In order to do so, you can use `NODE_PATH` env var to make the action take those dependencies into account. Below is an example workflow that does that.

```yaml
name: Lint Commit Messages
on: [pull_request]

permissions:
  contents: read
  pull-requests: read

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm install
      # Run the commitlint action, considering its own dependencies and yours as well 🚀
      # `github.workspace` is the path to your repository.
      - uses: wagoid/commitlint-github-action@v6
        env:
          NODE_PATH: ${{ github.workspace }}/node_modules
```

---

💡 You can see other ways to install your dependencies (including private ones) in [the Setup Node action's docs](https://github.com/actions/setup-node).

---
