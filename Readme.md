Safe start
=================

Checks if your dependencies are valid. Or throws an Error.

Usage / Examples
----------------


```js
var safestart = require('safestart')

safestart(__dirname) // throws an Error on failure

// you can exclude particular libraries, e.g. if you've installed
// `foo` from a fork on GitHub, causing a version mismatch
safestart(__dirname, {
  exclude: ['foo']
})
```

Can also be used commandline:
```
safestart
```

Development
-----------

When developing, be sure to test the package and also check the dependencies are free of CVEs.

```bash
npm run test
npm run scan_packages
```

License
-------
Open source software under the [zlib license](LICENSE).
