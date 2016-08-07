/* global it, describe */

var path = require('path')
var test = it

describe('safestart', function () {
  test('should work on self', function () {
    require('../index.js')(path.resolve(__dirname, '..'))
  })
})
