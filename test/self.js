var test = it;

describe('safestart', function() {
    test('should work on self', function() {
        require('../index.js')(__dirname+'/..')
    })
})
