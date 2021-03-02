# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.0.6](https://github.com/wagoid/commitlint-github-action/compare/v3.0.5...v3.0.6) (2021-03-02)


### Bug Fixes

* perform an atomic push when releasing ([9d00d1e](https://github.com/wagoid/commitlint-github-action/commit/9d00d1e75718143215dbf95c9c12956c56225e90))

### [3.0.5](https://github.com/wagoid/commitlint-github-action/compare/v3.0.3...v3.0.5) (2021-03-02)

### [3.0.4](https://github.com/wagoid/commitlint-github-action/compare/v3.0.3...v3.0.4) (2021-03-02)

### [3.0.3](https://github.com/wagoid/commitlint-github-action/compare/v3.0.2...v3.0.3) (2021-03-02)

### [3.0.2](https://github.com/wagoid/commitlint-github-action/compare/v3.0.1...v3.0.2) (2021-03-02)

### [3.0.1](https://github.com/wagoid/commitlint-github-action/compare/v3.0.0...v3.0.1) (2021-02-25)

## [3.0.0](https://github.com/wagoid/commitlint-github-action/compare/v2.2.5...v3.0.0) (2021-02-24)


### ⚠ BREAKING CHANGES

* **deps:** Remove support for lerna v2 and change the order of the `extends` resolution
from right-to-left to left-to-right.

### Bug Fixes

* **deps:** udpate commitlint monorepo to v12 ([8b0b095](https://github.com/wagoid/commitlint-github-action/commit/8b0b095f5e2c4a8bc5ebc94da6e1a9c0ebc6b862)), closes [#97](https://github.com/wagoid/commitlint-github-action/issues/97)

### [2.2.5](https://github.com/wagoid/commitlint-github-action/compare/v2.2.4...v2.2.5) (2021-02-18)

### [2.2.4](https://github.com/wagoid/commitlint-github-action/compare/v2.2.3...v2.2.4) (2021-02-17)


### Bug Fixes

* call getOctokit function instead of removed Github constructor ([84dd768](https://github.com/wagoid/commitlint-github-action/commit/84dd7685c6e51c38415801f8ca57df0578a83059))

### [2.2.3](https://github.com/wagoid/commitlint-github-action/compare/v2.2.2...v2.2.3) (2021-02-15)

### [2.2.2](https://github.com/wagoid/commitlint-github-action/compare/v2.2.1...v2.2.2) (2021-02-10)

### [2.2.1](https://github.com/wagoid/commitlint-github-action/compare/v2.2.0...v2.2.1) (2021-02-10)

## [2.2.0](https://github.com/wagoid/commitlint-github-action/compare/v2.1.7...v2.2.0) (2021-02-07)


### Features

* add outputs generation again ([a34ac47](https://github.com/wagoid/commitlint-github-action/commit/a34ac47c340ba0062e19bae66271eef6390ab03e)), closes [/github.com/actions/toolkit/issues/702#issuecomment-774269650](https://github.com/wagoid//github.com/actions/toolkit/issues/702/issues/issuecomment-774269650)

### [2.1.7](https://github.com/wagoid/commitlint-github-action/compare/v2.1.6...v2.1.7) (2021-01-28)


### Bug Fixes

* remove output generation ([b674cd3](https://github.com/wagoid/commitlint-github-action/commit/b674cd3ec44b3d627899d44e7cd5c649566d291a))
* stop trying to issue commands on failures ([1128358](https://github.com/wagoid/commitlint-github-action/commit/1128358de33626153faadc9d01d0fad8bde5cfb8)), closes [#70](https://github.com/wagoid/commitlint-github-action/issues/70)

### [2.1.6](https://github.com/wagoid/commitlint-github-action/compare/v2.1.5...v2.1.6) (2020-12-16)

### [2.1.5](https://github.com/wagoid/commitlint-github-action/compare/v2.1.4...v2.1.5) (2020-12-16)

### [2.1.4](https://github.com/wagoid/commitlint-github-action/compare/v2.1.3...v2.1.4) (2020-12-03)

### [2.1.3](https://github.com/wagoid/commitlint-github-action/compare/v2.1.2...v2.1.3) (2020-11-29)

### [2.1.2](https://github.com/wagoid/commitlint-github-action/compare/v2.1.1...v2.1.2) (2020-11-21)

### [2.1.1](https://github.com/wagoid/commitlint-github-action/compare/v2.1.0...v2.1.1) (2020-11-11)


### Bug Fixes

* do not run workflow commands in commit messages ([d67c2ec](https://github.com/wagoid/commitlint-github-action/commit/d67c2ec96c0039c3cdbde4e677be13127062ed85))

## [2.1.0](https://github.com/wagoid/commitlint-github-action/compare/v2.0.5...v2.1.0) (2020-09-14)


### Features

* upgrade dependencies to their latest version ([f162ac0](https://github.com/wagoid/commitlint-github-action/commit/f162ac07f904e8b5578fa77172b997145fd61b7a))

### 2.0.5 (2020-09-14)

### 2.0.4 (2020-09-14)

### 2.0.3 (2020-09-14)

### Features

- use config-conventional as default config ([7e67891](https://github.com/wagoid/commitlint-github-action/commit/7e678913ff14e04ef128e3d06523eabd0df4d639))

### 2.0.2 (2020-08-22)

## [2.0.1](https://github.com/wagoid/commitlint-github-action/compare/v2.0.0...v2.0.1) (2020-08-20)

### Bug Fixes

- action shows error ouput when not all commits have warnings ([0911cae](https://github.com/wagoid/commitlint-github-action/commit/0911cae00990e44bafab30af5357ed057b5cf964)), closes [#43](https://github.com/wagoid/commitlint-github-action/issues/43)

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
