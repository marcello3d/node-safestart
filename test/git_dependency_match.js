var assert = require('assert')
var gitDependencyMatch = require('../git_dependency_match')

var test = it

describe('gitDependencyMatch', function() {
    test('should match shorthand github dependencies', function() {
        assert(gitDependencyMatch(
            'github:loriopatrick/big.js#b2457791c4',
            'git://github.com/loriopatrick/big.js.git#b2457791c452c77110a3cb15d7705248df779d61'
        ))
        assert(gitDependencyMatch(
            'github:loriopatrick/big.js#b2457791c4',
            'https://github.com/loriopatrick/big.js.git#b2457791c452c77110a3cb15d7705248df779d61'
        ))
    })

    test('should match longer form git dependencies', function() {
        assert(gitDependencyMatch(
            'git://github.com/defunctzombie/uniq.git#36a99d1c',
            'git+https://github.com/defunctzombie/uniq.git#36a99d1c57f4c34164393439de8e75b165f2dc2d'
        ))
        assert(gitDependencyMatch(
            'git://github.com/defunctzombie/uniq.git#36a99d1c',
            'https://github.com/defunctzombie/uniq.git#36a99d1c57f4c34164393439de8e75b165f2dc2d'
        ))
    })

    test('should not match mismatched hashes', function() {
        assert(!gitDependencyMatch(
            'git://github.com/defunctzombie/uniq.git#a6a99d1c',
            'git+https://github.com/defunctzombie/uniq.git#36a99d1c57f4c34164393439de8e75b165f2dc2d'
        ))
    })

    test('should not match mismatched repos', function() {
        assert(!gitDependencyMatch(
            'git://github.com/defunctzombie/uniq.git#a6a99d1c',
            'git+https://github.com/loriopatrick/uniq.git#36a99d1c57f4c34164393439de8e75b165f2dc2d'
        ))
    })
})


