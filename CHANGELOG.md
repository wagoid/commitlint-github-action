# [2.0.0](https://github.com/wagoid/commitlint-github-action/compare/v1.8.0...v2.0.0) (2020-08-02)

### Features

- upgrade commitlint dependencies to v9 ([a413a3f](https://github.com/wagoid/commitlint-github-action/commit/a413a3f439c38181670fdd6d1be4b528c942af4b))
- use action input instead of env var to get the github token ([18e9bff](https://github.com/wagoid/commitlint-github-action/commit/18e9bff0e6956f1bfe76e18cc582c6cb5d3b9800))

### BREAKING CHANGES

- GITHUB_TOKEN env var is now ignored. In case a custom token is needed,
  it'll be necessary to pass it via the `token` input from now on.
- this includes breaking changes from commitlint v9,
  like the fact that `improvement` type is now rejected in `@commitlint/config-conventional`.

<a name="1.8.0"></a>

# [1.8.0](https://github.com/wagoid/commitlint-github-action/compare/v1.7.0...v1.8.0) (2020-08-02)

### Features

- add `results` output ([550792f](https://github.com/wagoid/commitlint-github-action/commit/550792f)), closes [#39](https://github.com/wagoid/commitlint-github-action/issues/39)

<a name="1.7.0"></a>

# [1.7.0](https://github.com/wagoid/commitlint-github-action/compare/v1.6.0...v1.7.0) (2020-07-03)

### Performance Improvements

- improve action pull speed by using an alpine image ([d0b8181](https://github.com/wagoid/commitlint-github-action/commit/d0b8181)), closes [#37](https://github.com/wagoid/commitlint-github-action/issues/37)

<a name="1.6.0"></a>

# [1.6.0](https://github.com/wagoid/commitlint-github-action/compare/v1.5.0...v1.6.0) (2020-03-11)

### Features

- upgrade to latest commitlint version ([6125fde](https://github.com/wagoid/commitlint-github-action/commit/6125fde))

<a name="1.5.0"></a>

# [1.5.0](https://github.com/wagoid/commitlint-github-action/compare/v1.4.0...v1.5.0) (2020-02-22)

### Features

- add support for additional dependencies ([895d9f3](https://github.com/wagoid/commitlint-github-action/commit/895d9f3)), closes [#27](https://github.com/wagoid/commitlint-github-action/issues/27)

<a name="1.4.0"></a>

# [1.4.0](https://github.com/wagoid/commitlint-github-action/compare/v1.3.2...v1.4.0) (2020-02-01)

### Bug Fixes

- don't fail on warnings ([6e0fcb1](https://github.com/wagoid/commitlint-github-action/commit/6e0fcb1))

### Features

- add helpURL parameter ([f4821d1](https://github.com/wagoid/commitlint-github-action/commit/f4821d1))

<a name="1.3.2"></a>

## [1.3.2](https://github.com/wagoid/commitlint-github-action/compare/v1.3.1...v1.3.2) (2020-01-05)

### Bug Fixes

- update jira rules ([1be2ce0](https://github.com/wagoid/commitlint-github-action/commit/1be2ce0))

<a name="1.3.1"></a>

## [1.3.1](https://github.com/wagoid/commitlint-github-action/compare/v1.3.0...v1.3.1) (2019-11-30)

### Bug Fixes

- do not try to get parent of push event's "before" field ([c1bba52](https://github.com/wagoid/commitlint-github-action/commit/c1bba52)), closes [#18](https://github.com/wagoid/commitlint-github-action/issues/18)

<a name="1.3.0"></a>

# [1.3.0](https://github.com/wagoid/commitlint-github-action/compare/v1.2.3...v1.3.0) (2019-11-25)

### Features

- support opts for lint ([c1cb555](https://github.com/wagoid/commitlint-github-action/commit/c1cb555))

<a name="1.2.3"></a>

## [1.2.3](https://github.com/wagoid/commitlint-github-action/compare/v1.2.2...v1.2.3) (2019-11-24)

### Bug Fixes

- also check range of commits for push events ([aa3e7ae](https://github.com/wagoid/commitlint-github-action/commit/aa3e7ae))
- errors not showing when PR has only one commit ([8dd0fbf](https://github.com/wagoid/commitlint-github-action/commit/8dd0fbf))
- Jira rules can now be used out of the box ([6cede4b](https://github.com/wagoid/commitlint-github-action/commit/6cede4b))

<a name="1.2.2"></a>

## [1.2.2](https://github.com/wagoid/commitlint-github-action/compare/v1.2.1...v1.2.2) (2019-10-21)

### Bug Fixes

- set [@commitlint](https://github.com/commitlint)/config-conventional to exact version 8.2.0 ([4fb9495](https://github.com/wagoid/commitlint-github-action/commit/4fb9495))
- update [@commitlint](https://github.com/commitlint)/config-conventional to latest version ([bc31cec](https://github.com/wagoid/commitlint-github-action/commit/bc31cec))

<a name="1.2.1"></a>

## [1.2.1](https://github.com/wagoid/commitlint-github-action/compare/v1.2.0...v1.2.1) (2019-10-18)

### Bug Fixes

- also show stack when an error happens ([2c42093](https://github.com/wagoid/commitlint-github-action/commit/2c42093))
- lerna scopes not working due to missing lerna dependency ([99b068a](https://github.com/wagoid/commitlint-github-action/commit/99b068a))

<a name="1.2.0"></a>

## [1.2.1](https://github.com/wagoid/commitlint-github-action/compare/v1.1.1...v1.2.0) (2019-10-15)

### Features

- add ability to run commitlint on events that are not pull requests ([23cd801](https://github.com/wagoid/commitlint-github-action/commit/23cd801))
- add firstParent input to ignore errors from your default branch ([598e473](https://github.com/wagoid/commitlint-github-action/commit/598e473))

<a name="1.1.1"></a>

## [1.1.1](https://github.com/wagoid/commitlint-github-action/compare/v1.1.0...v1.1.1) (2019-10-08)

### Bug Fixes

- do not call `require` in the config file to allow other file types ([949b695](https://github.com/wagoid/commitlint-github-action/commit/949b695))

<a name="1.1.0"></a>

# [1.1.0](https://github.com/wagoid/commitlint-github-action/compare/v1.0.0...v1.1.0) (2019-10-04)

### Features

- use image from docker hub ([9379b32](https://github.com/wagoid/commitlint-github-action/commit/9379b32))

<a name="1.0.0"></a>

# 1.0.0 (2019-10-02)

### Bug Fixes

- make action name unique ([fd906ae](https://github.com/wagoid/commitlint-github-action/commit/fd906ae))
- revert action to use debian image ([33f8aa3](https://github.com/wagoid/commitlint-github-action/commit/33f8aa3))
- use Commit Linter as a unique action name ([dedf966](https://github.com/wagoid/commitlint-github-action/commit/dedf966))

### Features

- add commitlint action ([478fbaf](https://github.com/wagoid/commitlint-github-action/commit/478fbaf))
