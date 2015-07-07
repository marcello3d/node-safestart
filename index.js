var fs = require('fs')
var path = require('path')
var semver = require('semver')

var gitDependencyMatch = require('./git_dependency_match')

var packages = {}

module.exports = checkPath

function checkPath(basePath) {
    var packageJsonPath = path.normalize(path.join(basePath, 'package.json'))
    var packageJson = packages[packageJsonPath]
    if (packageJson) {
        return packageJson
    }
    if (!fs.existsSync(basePath)) {
        packages[packageJsonPath] = null
        return
    }
    packageJson = packages[packageJsonPath] = JSON.parse(fs.readFileSync(packageJsonPath))

    if ((packageJson.engineStrict || packageJson['engine-strict']) && packageJson.engines) {
        if (packageJson.engines.node && !semver.satisfies(process.version, packageJson.engines.node)) {
            throw new Error(packageJson.name + " node version mismatch (expected: " + packageJson.engines.node + ", got: " + process.version + ")")
        }
        if (packageJson.engines.iojs && !semver.satisfies(process.version, packageJson.engines.iojs)) {
            throw new Error(packageJson.name + " iojs version mismatch (expected: " + packageJson.engines.iojs + ", got: " + process.version + ")")
        }
    }

    var dependencies = packageJson.dependencies || {}
    var optionalDependencies = packageJson.optionalDependencies || {}

    // Optional dependencies override regular dependencies, see: https://docs.npmjs.com/files/package.json#optionaldependencies
    Object.keys(optionalDependencies).forEach(function(key) {
        delete dependencies[key]
    })
    scanDependencies(packageJson, basePath, dependencies, true)
    scanDependencies(packageJson, basePath, optionalDependencies, false)

    return packageJson
}


function scanDependencies(packageJson, basePath, dependencies, required) {
    Object.keys(dependencies).sort().forEach(function (dependencyName) {
        var expectedVersion = dependencies[dependencyName]
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
                if (!required) {
                    // It's ok if we can't find an optional dependency, skip it
                    return
                }
                throw new Error(packageJson.name + " dependency not found: " + dependencyName + " (expected: " + expectedVersion + ")")
            }
            base = path.dirname(base)
        }
        if (/#/.test(expectedVersion) || /^(http|git)/.test(expectedVersion)) {
            if (!dependency._resolved) {
                return;
            }

            if (!gitDependencyMatch(expectedVersion, dependency._resolved)) {
                fail(packageJson, dependencyName, dependencyPath, expectedVersion, dependency._resolved)
            }

        } else if (!/latest/.test(expectedVersion) && !semver.satisfies(dependency.version, expectedVersion, true)) {
            fail(packageJson, dependencyName, dependencyPath, expectedVersion, dependency.version)
        }
    })
}

function fail(packageJson, dependencyName, dependencyPath, expectedVersion, foundVersion) {
    var error = new Error(packageJson.name + " dependency mismatch: " + dependencyName + " from " + dependencyPath + " (expected: " + expectedVersion + ", got: " + foundVersion + ")")
    error.packageName = dependencyName
    error.packagePath = dependencyPath
    error.packageVersion = foundVersion
    error.expectedVersion = expectedVersion
    throw error
}
