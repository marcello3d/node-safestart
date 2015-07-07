# UNRELEASED

  * @defunctzombie: fix handling of git dependencies
    - support for github:user/repo#hash shorthand
    - better normalization against installed _resolved url
    - add tests for git dependency matching
  * support "engine-strict" in addition to "engineStrict"

# 0.6.0 (2015-04-17)

  * fix cache install issues by using `_resolved` instead of `_from` for git repos

# 0.5.0

  * support for optionalDependencies

# 0.4.0

  * loose semver matching support (resolves weirdly formatted semver problems)

# 0.3.1

  * support for github style short dependencies

# 0.3.0

  * support git repos by checking `_from` field
  * add more information to error object

# 0.2.0

  * upgrade to semver 2.2.1

# 0.1.3

  * ignore http/https/git urls

# 0.1.2

  * only test engines.node if engineStrict is true

# 0.1.1

  * initial version
