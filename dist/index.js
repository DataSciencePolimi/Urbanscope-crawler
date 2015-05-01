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

var _openMongo$closeMongo = require('./model/');

var _gridConfig = require('../config/grid-config.json');

var _gridConfig2 = _interopRequireDefault(_gridConfig);

'use strict';
// import { query as twQuery } from './social/twitter';
// import { query as igQuery } from './social/instagram';

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
          context$1$0.next = 19;
          break;
        }

        post = _step.value;
        context$1$0.prev = 7;

        log.trace('Saving post %s', post.get('id'));
        context$1$0.next = 11;
        return post.save();

      case 11:
        context$1$0.next = 16;
        break;

      case 13:
        context$1$0.prev = 13;
        context$1$0.t247 = context$1$0['catch'](7);

        if (context$1$0.t247.code === 11000) {
          log.error('Post already present');
        } else {
          log.error(context$1$0.t247, 'Cannot insert post');
        }

      case 16:
        _iteratorNormalCompletion = true;
        context$1$0.next = 5;
        break;

      case 19:
        context$1$0.next = 25;
        break;

      case 21:
        context$1$0.prev = 21;
        context$1$0.t248 = context$1$0['catch'](3);
        _didIteratorError = true;
        _iteratorError = context$1$0.t248;

      case 25:
        context$1$0.prev = 25;
        context$1$0.prev = 26;

        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }

      case 28:
        context$1$0.prev = 28;

        if (!_didIteratorError) {
          context$1$0.next = 31;
          break;
        }

        throw _iteratorError;

      case 31:
        return context$1$0.finish(28);

      case 32:
        return context$1$0.finish(25);

      case 33:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this, [[3, 21, 25, 33], [7, 13], [26,, 28, 32]]);
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
        return _openMongo$closeMongo.open();

      case 2:

        // Create the grid points
        log.debug('Generating point grids');
        fc = _grid2['default'].json(_gridConfig2['default']);
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
        if (!(idx < _gridConfig2['default'].length)) {
          context$1$0.next = 59;
          break;
        }

        currentMpp = _gridConfig2['default'][idx].mpp;
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
        context$1$0.t249 = context$1$0['catch'](25);

        if (context$1$0.t249.code === 'ECONNREFUSED') {
          log.error('Cannot connect %s', context$1$0.t249.message);
        }

        log.error(context$1$0.t249, 'Query failed: %s', context$1$0.t249.message);

      case 38:
        _iteratorNormalCompletion2 = true;
        context$1$0.next = 20;
        break;

      case 41:
        context$1$0.next = 47;
        break;

      case 43:
        context$1$0.prev = 43;
        context$1$0.t250 = context$1$0['catch'](18);
        _didIteratorError2 = true;
        _iteratorError2 = context$1$0.t250;

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

      case 60:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this, [[18, 43, 47, 55], [25, 34], [48,, 50, 54]]);
}))['catch'](function (err) {
  log.fatal(err, 'NUOOOOOOOOO');
}).then(function () {
  _openMongo$closeMongo.close();
  log.info('Bye');
});

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78

// Setup mongo
// Load social
/*
let socialMap = {
  twitter: twQuery,
  instagram: igQuery,
};
let query = socialMap[ social ];
*/

// Cycle over the grids
//# sourceMappingURL=index.js.map