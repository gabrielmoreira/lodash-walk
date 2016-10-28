(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function (_) {
  function walk(obj, options, visitor) {
    if (_.isFunction(options)) {
      visitor = options;
      options = {};
    }
    options = options || {};
    var withParent = options.withParent || false;
    var stop = false;
    function _walk(obj, parent, depth, visited) {
      depth++;
      if (parent.skip) return;
      if (parent.stop || stop) {
        stop = true;
        return;
      }
      if (visited.has(obj)) return;
      visited.add(obj);
      _.forOwn(obj, function (value, key) {
        if (stop) return;
        var isArray = _.isArray(obj);
        var separator = parent && parent.key ? '.' : '';
        var node = {
          id: ((parent && parent.id) || '') + (isArray ? '[' + key + ']' : separator + key),
          path: ((parent && parent.path) || '') + (isArray ? '[]' : separator + key),
          key: key,
          value: value,
          depth: depth
        };
        if (withParent) node.parent = parent;
        visitor(value, key, node);
        _walk(value, node, depth, visited);
      })
      visited.delete(obj);
    }
    var parent = {};
    if (options.prefix) {
      parent.id = options.prefix;
      parent.path = options.prefix;
      parent.key = options.prefix;
    }
    _walk(obj, parent, 0, new Set());
  }

  function deepFilter(obj, options, visitor) {
    if (_.isFunction(options)) {
      visitor = options;
      options = {};
    }
    var collected = [];
    walk(obj, options, function () {
      var result = visitor.apply(this, arguments);
      if (result !== undefined) {
        collected.push(result);
      }
    })
    return collected;
  }

  return { walk: walk, deepFilter: deepFilter };
}

},{}]},{},[1])
//# sourceMappingURL=walk.js.map
