var fs = require('fs')
var path = require('path')
var semver = require('semver')

var packages = {}

module.exports = function checkPath(basePath) {
    var packageJsonPath = path.normalize(path.join(basePath, 'package.json'))
    var packageJson = packages[packageJsonPath] 
    if (!packageJson) {
        if (!fs.existsSync(basePath)) {
            packages[packageJsonPath] = null
            return
        }
        packageJson = packages[packageJsonPath] = JSON.parse(fs.readFileSync(packageJsonPath))
    }

    if (packageJson.engineStrict &&
        packageJson.engines && packageJson.engines.node &&
            !semver.satisfies(process.version, packageJson.engines.node)) {
        throw new Error(packageJson.name + " node version mismatch (expected: " + packageJson.engines.node + ", got: " + process.version + ")")
    }

    if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).sort().forEach(function(dependencyName) {
            var expectedVersion = packageJson.dependencies[dependencyName]
            var base = basePath
            var dependencyPath
            var dependency
            while (true) {
                dependencyPath = path.join(base, 'node_modules', dependencyName)
                dependency = checkPath(dependencyPath)
                if (dependency) {
                    break
                }
                if (base === path.dirname(base)) {
                    throw new Error(packageJson.name + " dependency not found: " + dependencyName + " (expected: " + expectedVersion + ")")
                }
                base = path.dirname(base)
            }
            if (/#/.test(expectedVersion) || /^(http|git)/.test(expectedVersion)) {
                expectedVersion = expectedVersion.replace(/^git\+https/, 'git')
                if (dependency._from && dependency._from.indexOf(expectedVersion) < 0) {
                    fail(packageJson, dependencyName, dependencyPath, expectedVersion, dependency._from)
                }
            } else if (!/latest/.test(expectedVersion) && !semver.satisfies(dependency.version, expectedVersion)) {
                fail(packageJson, dependencyName, dependencyPath, expectedVersion, dependency.version)
            }
        })
    }
    return packageJson
}

function fail(packageJson, dependencyName, dependencyPath, expectedVersion, foundVersion) {
    var error = new Error(packageJson.name + " dependency mismatch: " + dependencyName + " from " + dependencyPath + " (expected: " + expectedVersion + ", got: " + foundVersion + ")")
    error.packageName = dependencyName
    error.packagePath = dependencyPath
    error.packageVersion = foundVersion
    error.expectedVersion = expectedVersion
    throw error
}
