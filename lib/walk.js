module.exports = function (_, disableMixin) {
  function walk(obj, options, visitor) {
    if (_.isFunction(options)) {
      visitor = options;
      options = {};
    }
    options = options || {};
    var withParent = options.withParent || false;
    var canVisit = options.canVisit || _.isObjectLike;
    var stop = false;
    function _walk(obj, parent, depth, visited) {
      if (parent.skip) return;
      if (parent.stop || stop) {
        stop = true;
        return;
      }
      if (!canVisit(obj)) return;
      if (visited.has(obj)) return;
      visited.add(obj);
      depth++;
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
    var parent = {value: obj};
    if (options.prefix) {
      parent.id = options.prefix;
      parent.path = options.prefix;
      parent.key = options.prefix;
    }
    _walk(obj, parent, 0, new Set());
  }

  function deepMap(obj, options, visitor) {
    if (_.isFunction(options)) {
      visitor = options;
      options = {};
    }
    var filter = options.filter || function(result, node) {
      return typeof(result) !== 'undefined';
    }
    var collected = [];
    walk(obj, options, function (value, key, node) {
      var result = visitor.apply(this, arguments);
      if (filter(result, node))
        collected.push(result);
    })
    return collected;
  }

  var lodashWalk = { walk: walk, deepMap: deepMap };
  if (!disableMixin) {
    _.mixin(lodashWalk);
    return _;
  }
  return lodashWalk;
}

module.exports.noConflict = function(_) {
  return module.exports(_, true);
}
