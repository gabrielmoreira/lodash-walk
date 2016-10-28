var _ = require('../index.js')(require('lodash'));

var data = {
  a: {
    b: {
      c: [
        [
          {
            d: {
              e: [
                [
                  'hello'
                ]
              ]
            },
            bomb: true,
            fn: function() {},
            customObj: new function(){ }
          }
        ]
      ]
    },
    c: {
      d: { a: 1, b: 2, c: 3 },
      e: { f: 2, g: 3, e: 1 },
      test: {
        some: 'not include'
      }
    },
    hello: {
      abc: 1
    }
  }
}
var dataArray = [
  data, data, data
];

var circular = {};
circular = _.assign(circular, {
  a: {
    b: {
      c: {
        self: circular
      }
    }
  },
  b: {
    self: circular
  },
  self: circular,
  array: [{ a: 1 }, circular, { b: 2 }],
  other: [circular, circular]
});

var assert = require('chai').assert;
describe("lodash-walk", function () {
  describe("walk", function () {
    it("should skip child when node.key contains 'hello'", function () {
      var ids = [];
      var result = _.walk(data, function (value, key, node) {
        if (node.key.indexOf('hello') > -1) node.skip = true;
        ids.push(node.id);
      });
      assert.notInclude(ids, 'a.hello.abc');
    })

    it("should stop when find node.key with 'bomb'", function () {
      var hasBomb = false;
      var count = 0;
      var result = _.walk(data, function (value, key, node) {
        if (hasBomb) count++;
        if (node.key === 'bomb') {
          hasBomb = true;
          node.stop = true;
        }
      });
      assert.equal(count, 0);
    })

    it("should prefix all ids with 'ohmygod'", function () {
      var ids = [];
      _.walk(data, { prefix: 'ohmygod' }, function (value, key, node) {
        ids.push(node.id);
      });
      assert.match(ids, /^ohmygod[.\[]/);
    })
    it("should walk in arrays", function () {
      var ids = [];
      _.walk(dataArray, { prefix: 'ohmygod' }, function (value, key, node) {
        ids.push(node.id);
      });
      assert.match(ids, /^ohmygod\[[0-2]\]/);
    })
    it("should not walk in circles", function () {
      var ids = []
      _.walk(circular, function (value, key, node) {
        ids.push(node.id);
      });
      assert.lengthOf(ids, 16);
    });
    it("should not walk in strings", function() {
      var ids = []
      _.walk(data, function (value, key, node) {
        ids.push(node.id);
      });
    })
  })

  describe("deepMap", function () {
    it("should collect all node.id from nodes with key 'e'", function () {
      var result = _.deepMap(data, function (value, key, node) {
        if (node.key === 'e')
          return node.id;
      });
      assert.lengthOf(result, 3);
    });
    it("should collect all node.path from nodes with path containing ('.e[]' or '.e.') or key 'e'", function () {
      var result = _.deepMap(data, function (value, key, node) {
        if (node.path.indexOf('.e[]') > -1 || node.path.indexOf('.e.') > -1 || node.key === 'e')
          return node.path;
      });
      assert.lengthOf(result, 7);
    });
    it("should collect all node with parent key 'e'", function () {
      var result = _.deepMap(data, { withParent: true }, function (value, key, node) {
        if (node.parent && node.parent.key === 'e')
          return node.id;
      });
      assert.lengthOf(result, 4);
    });
    it("should skip child when node.key contains 'hello'", function () {
      var result = _.deepMap(data, function (value, key, node) {
        if (node.key.indexOf('hello') > -1) node.skip = true;
        return node.id;
      });
      assert.notInclude(result, 'a.hello.abc');
    });
    it("should collect using custom result filter", function () {
      var customData = [{a: 1}, {a: 2}, {b:3}, {c: {d: 4}, e: [[[[{f: 5, g: 6}]]]]}];
      var result = _.deepMap(customData, {
        filter: function(result) {
          return result && result % 2 === 0;
        }
      }, function (value, key, node) {
        return value;
      });
      assert.notInclude(result, 1);
      assert.notInclude(result, 3);
      assert.notInclude(result, 5);
      assert.include(result, 2);
      assert.include(result, 4);
      assert.include(result, 6);
      assert.lengthOf(result, 3);
    })
  });
});
