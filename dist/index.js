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

var _grid = require('node-geojson-grid');

var _grid2 = _interopRequireDefault(_grid);

// Load my modules

var _initMongo = require('./model/');

var _initMongo2 = _interopRequireDefault(_initMongo);

var _gridConfig = require('../config/grid-config.json');

var _gridConfig2 = _interopRequireDefault(_gridConfig);

var _query = require('./social/twitter');

// import instagramApi from './social/instagram';

// Constant declaration

// Module variables declaration
var log = _bunyan2['default'].createLogger({
  name: 'cralwer',
  level: 'trace' });

// Module functions declaration
function savePosts(posts) {
  var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, post;

  return _regeneratorRuntime.wrap(function savePosts$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        _iteratorNormalCompletion = true;
        _didIteratorError = false;
        _iteratorError = undefined;
        context$1$0.prev = 3;
        _iterator = _getIterator(posts);

      case 5:
        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
          context$1$0.next = 13;
          break;
        }

        post = _step.value;

        log.trace('Saving post %s', post.get('id'));
        context$1$0.next = 10;
        return post.save();

      case 10:
        _iteratorNormalCompletion = true;
        context$1$0.next = 5;
        break;

      case 13:
        context$1$0.next = 19;
        break;

      case 15:
        context$1$0.prev = 15;
        context$1$0.t8 = context$1$0['catch'](3);
        _didIteratorError = true;
        _iteratorError = context$1$0.t8;

      case 19:
        context$1$0.prev = 19;
        context$1$0.prev = 20;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 22:
        context$1$0.prev = 22;

        if (!_didIteratorError) {
          context$1$0.next = 25;
          break;
        }

        throw _iteratorError;

      case 25:
        return context$1$0.finish(22);

      case 26:
        return context$1$0.finish(19);

      case 27:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this, [[3, 15, 19, 27], [20,, 22, 26]]);
}

// Module class declaration

// Module initialization (at first load)

// Entry point
log.debug('Generating point grids');
var fc = _grid2['default'].json(_gridConfig2['default']);
var grids = fc.features.map(function (f) {
  return f.geometry.coordinates;
});
log.trace('Generated %d grids', grids.length);

_co2['default'](_regeneratorRuntime.mark(function callee$0$0() {
  var idx, currentMpp, points, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, coords, lat, lon, radius, posts;

  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _initMongo2['default']();

      case 2:
        idx = 0;

      case 3:
        if (!(idx < _gridConfig2['default'].length)) {
          context$1$0.next = 43;
          break;
        }

        currentMpp = _gridConfig2['default'][idx].mpp;
        points = grids[idx];

        log.trace('Current grid: %d with %d points', idx, points.length);

        _iteratorNormalCompletion2 = true;
        _didIteratorError2 = false;
        _iteratorError2 = undefined;
        context$1$0.prev = 10;
        _iterator2 = _getIterator(points);

      case 12:
        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
          context$1$0.next = 26;
          break;
        }

        coords = _step2.value;
        lat = coords[1];
        lon = coords[0];
        radius = currentMpp / 1000;
        context$1$0.next = 19;
        return _query.query(lat, lon, radius);

      case 19:
        posts = context$1$0.sent;

        log.trace('Returned %d posts', posts.length);

        context$1$0.next = 23;
        return savePosts(posts);

      case 23:
        _iteratorNormalCompletion2 = true;
        context$1$0.next = 12;
        break;

      case 26:
        context$1$0.next = 32;
        break;

      case 28:
        context$1$0.prev = 28;
        context$1$0.t9 = context$1$0['catch'](10);
        _didIteratorError2 = true;
        _iteratorError2 = context$1$0.t9;

      case 32:
        context$1$0.prev = 32;
        context$1$0.prev = 33;

        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }

      case 35:
        context$1$0.prev = 35;

        if (!_didIteratorError2) {
          context$1$0.next = 38;
          break;
        }

        throw _iteratorError2;

      case 38:
        return context$1$0.finish(35);

      case 39:
        return context$1$0.finish(32);

      case 40:
        idx++;
        context$1$0.next = 3;
        break;

      case 43:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this, [[10, 28, 32, 40], [33,, 35, 39]]);
}));

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78

// Setup mongo
//# sourceMappingURL=index.js.map