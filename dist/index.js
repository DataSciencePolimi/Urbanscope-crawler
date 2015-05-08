'use strict';

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var marked0$0 = [savePosts].map(_regeneratorRuntime.mark);

// Load system modules

// Load modules

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _turf = require('turf');

var _turf2 = _interopRequireDefault(_turf);

var _nodeGeojsonGrid = require('node-geojson-grid');

var _nodeGeojsonGrid2 = _interopRequireDefault(_nodeGeojsonGrid);

// Load my modules

var _modelPost = require('./model/post');

var _modelPost2 = _interopRequireDefault(_modelPost);

var _model = require('./model/');

var _configGridConfigJson = require('../config/grid-config.json');

var _configGridConfigJson2 = _interopRequireDefault(_configGridConfigJson);

var _configNilsJson = require('../config/nils.json');

var _configNilsJson2 = _interopRequireDefault(_configNilsJson);

'use strict';

// Constant declaration

// Module variables declaration
var log = _bunyan2['default'].createLogger({
  name: 'cralwer',
  level: 'trace' });

// Module functions declaration
function savePosts(posts) {
  var points, taggedPoints, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, point, _point$properties, index, nil, rawPost, post;

  return _regeneratorRuntime.wrap(function savePosts$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        points = _turf2['default'].featurecollection(posts.map(function (p, index) {
          return _turf2['default'].point(p.location.coordinates, { index: index });
        }));
        taggedPoints = _turf2['default'].tag(points, _configNilsJson2['default'], 'ID_NIL', 'nil');
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 5;
        _iterator = _getIterator(taggedPoints.features);

      case 7:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 26;
          break;
        }

        point = _step.value;
        context$1$0.prev = 9;
        _point$properties = point.properties;
        index = _point$properties.index;
        nil = _point$properties.nil;
        rawPost = posts[index];

        // Set the nil
        rawPost.nil = nil;

        post = new _modelPost2['default'](rawPost);
        context$1$0.next = 18;
        return post.save();

      case 18:
        context$1$0.next = 23;
        break;

      case 20:
        context$1$0.prev = 20;
        context$1$0.t0 = context$1$0['catch'](9);

        if (context$1$0.t0.code === 11000) {
          log.error('Post already present');
        } else {
          log.error(context$1$0.t0, 'Cannot insert post');
        }

      case 23:
        _iteratorNormalCompletion = true;
        context$1$0.next = 7;
        break;

      case 26:
        context$1$0.next = 32;
        break;

      case 28:
        context$1$0.prev = 28;
        context$1$0.t1 = context$1$0['catch'](5);
        _didIteratorError = true;
        _iteratorError = context$1$0.t1;

      case 32:
        context$1$0.prev = 32;
        context$1$0.prev = 33;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 35:
        context$1$0.prev = 35;

        if (!_didIteratorError) {
          context$1$0.next = 38;
          break;
        }

        throw _iteratorError;

      case 38:
        return context$1$0.finish(35);

      case 39:
        return context$1$0.finish(32);

      case 40:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this, [[5, 28, 32, 40], [9, 20], [33,, 35, 39]]);
}

// Module class declaration

// Module initialization (at first load)

// Entry point
_co2['default'](_regeneratorRuntime.mark(function callee$0$0() {
  var fc, grids, social, _require, query, idx, currentMpp, points, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, coords, lat, lon, radius, posts;

  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _model.open();

      case 2:

        // Create the grid points
        log.debug('Generating point grids');
        fc = _nodeGeojsonGrid2['default'].json(_configGridConfigJson2['default']);
        grids = fc.features.map(function (f) {
          return f.geometry.coordinates;
        });

        log.trace('Generated %d grids', grids.length);

        social = process.argv[2];

        log.trace('Loading module "%s"', social);
        _require = require('./social/' + social);
        query = _require.query;
        idx = 0;

      case 11:
        if (!(idx < _configGridConfigJson2['default'].length)) {
          context$1$0.next = 59;
          break;
        }

        currentMpp = _configGridConfigJson2['default'][idx].mpp;
        points = grids[idx];

        log.debug('Current grid %d with %d points', idx, points.length);

        _iteratorNormalCompletion2 = true;
        _didIteratorError2 = false;
        _iteratorError2 = undefined;
        context$1$0.prev = 18;
        _iterator2 = _getIterator(points);

      case 20:
        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
          context$1$0.next = 41;
          break;
        }

        coords = _step2.value;
        lat = coords[1];
        lon = coords[0];
        radius = currentMpp / 1000;
        context$1$0.prev = 25;
        context$1$0.next = 28;
        return query(lat, lon, radius);

      case 28:
        posts = context$1$0.sent;

        log.trace('Returned %d posts', posts.length);

        context$1$0.next = 32;
        return savePosts(posts);

      case 32:
        context$1$0.next = 38;
        break;

      case 34:
        context$1$0.prev = 34;
        context$1$0.t2 = context$1$0['catch'](25);

        if (context$1$0.t2.code === 'ECONNREFUSED') {
          log.error('Cannot connect %s', context$1$0.t2.message);
        }

        log.error(context$1$0.t2, 'Query failed: %s', context$1$0.t2.message);

      case 38:
        _iteratorNormalCompletion2 = true;
        context$1$0.next = 20;
        break;

      case 41:
        context$1$0.next = 47;
        break;

      case 43:
        context$1$0.prev = 43;
        context$1$0.t3 = context$1$0['catch'](18);
        _didIteratorError2 = true;
        _iteratorError2 = context$1$0.t3;

      case 47:
        context$1$0.prev = 47;
        context$1$0.prev = 48;

        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }

      case 50:
        context$1$0.prev = 50;

        if (!_didIteratorError2) {
          context$1$0.next = 53;
          break;
        }

        throw _iteratorError2;

      case 53:
        return context$1$0.finish(50);

      case 54:
        return context$1$0.finish(47);

      case 55:
        log.debug('Done grid %d', idx);

      case 56:
        idx++;
        context$1$0.next = 11;
        break;

      case 59:
        log.debug('Done all grids');
        _model.close();

      case 61:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this, [[18, 43, 47, 55], [25, 34], [48,, 50, 54]]);
}))['catch'](function (err) {
  log.fatal(err, 'NUOOOOOOOOO');
  _model.close();
}).then(function () {
  log.info('Bye');
  process.exit(0);
});

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
// Create and save the post

// Setup mongo
// Load social

// Cycle over the grids
//# sourceMappingURL=index.js.map