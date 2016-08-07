var url = require('url')
var ngu = require('normalize-git-url')

// dependency match git urls
function dependencyMatch (expected, actual) {
  // expand github:user/repo#hash to git://github.com/...
  if (expected.indexOf('github:') === 0) {
    expected = expected.replace(/^github:/, 'git://github.com/')
    var parsed = url.parse(expected)
    parsed.pathname += '.git'
    expected = url.format(parsed)
  }

    // normalize git+https prefix
  actual = actual.replace(/^git\+https/, 'git')
  expected = expected.replace(/^git\+https/, 'git')

  expected = ngu(expected)
  actual = ngu(actual)

  expected.url = expected.url.replace('https://', 'git://')
  actual.url = actual.url.replace('https://', 'git://')

  if (expected.url !== actual.url) {
    return false
  }

  if (actual.branch && actual.branch.indexOf(expected.branch) !== 0) {
    return false
  }

  return true
}

module.exports = dependencyMatch
