var fs = require('fs')
var path = require('path')
var semver = require('semver')

var packages = {}

module.exports = function checkPath(basePath) {
    var packageJsonPath = path.normalize(path.join(basePath, 'package.json'))
    var packageJson = packages[packageJsonPath] 
    if (!packageJson) {
        if (!fs.existsSync(basePath)) {
            return packages[packageJsonPath] = null
        }
        packageJson = packages[packageJsonPath] = JSON.parse(fs.readFileSync(packageJsonPath))
    }

    if (packageJson.engines && packageJson.engines.node &&
            !semver.satisfies(process.version, packageJson.engines.node)) {
        throw new Error(packageJson.name + " node version mismatch (expected: " + packageJson.engines.node + ", got: " + process.version + ")")
    }

    Object.keys(packageJson.dependencies || {}).sort().forEach(function(dependencyName) {
        var expectedVersion = packageJson.dependencies[dependencyName]
        var base = basePath
        var dependecyPath  
        var dependency
        while (true) {
            dependecyPath = path.join(base, 'node_modules', dependencyName)
            dependency = checkPath(dependecyPath)
            if (dependency) {
                break
            }
            if (base == path.dirname(base)) {
                throw new Error(packageJson.name + " dependency not found: " + dependencyName + " (expected: " + expectedVersion + ")")
            }
            base = path.dirname(base)
        }
        if (!/#/.test(expectedVersion) &&
            expectedVersion != 'latest' &&
                !semver.satisfies(dependency.version, expectedVersion)) {
            throw new Error(packageJson.name + " dependency version mismatch: " + dependencyName + " from " + dependecyPath + " (expected: " + expectedVersion + ", got: " + dependency.version + ")")
        }
    })
    return packageJson
}