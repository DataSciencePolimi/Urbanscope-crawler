'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var marked0$0 = [savePosts].map(_regeneratorRuntime.mark);
// Load system modules

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

// Constant declaration
var CONFIG_FOLDER = _path2['default'].join(__dirname, '..', 'config');
var GRID_FILE = _path2['default'].join(CONFIG_FOLDER, 'generated-grids.json');

// Module variables declaration
var STATUS_FILE = undefined;
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
function saveState(grid, coord) {
  var status = {
    grid: grid,
    coord: coord };

  var json = JSON.stringify(status, null, 2);
  _fs2['default'].writeFileSync(STATUS_FILE, json, 'utf8');

  return status;
}

// Module class declaration

// Module initialization (at first load)

// Entry point
(0, _co2['default'])(_regeneratorRuntime.mark(function callee$0$0() {
  var social, _require, query, status, grids, fc, json, gridIndex, currentMpp, points, coordIndex, coords, lat, lon, radius, posts;

  return _regeneratorRuntime.wrap(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return (0, _model.open)();

      case 2:
        social = process.argv[2];

        log.trace('Loading module "%s"', social);
        _require = require('./social/' + social);
        query = _require.query;

        STATUS_FILE = _path2['default'].join(CONFIG_FOLDER, social + '-status.json');

        status = undefined;

        try {
          status = require(STATUS_FILE);
          log.info('Status loaded %d - %d', status.grid, status.coord);
        } catch (err) {
          log.info('Status not present, creating one');
          status = saveState(0, 0);
        }

        grids = undefined;

        try {
          log.trace('Loading from file "%s"', GRID_FILE);
          grids = require(GRID_FILE);
          log.debug('Grid loaded');
        } catch (err) {
          log.info('Generating grids');
          fc = _nodeGeojsonGrid2['default'].json(_configGridConfigJson2['default']);

          grids = fc.features.map(function (f) {
            return f.geometry.coordinates;
          });
          log.trace('Generated %d grids', grids.length);

          json = JSON.stringify(grids, null, 2);

          _fs2['default'].writeFileSync(GRID_FILE, json, 'utf8');
        }

        gridIndex = status.grid;

      case 12:
        if (!(gridIndex < _configGridConfigJson2['default'].length)) {
          context$1$0.next = 46;
          break;
        }

        currentMpp = _configGridConfigJson2['default'][gridIndex].mpp;
        points = grids[gridIndex];

        log.debug('Current grid %d with %d points', gridIndex, points.length);

        coordIndex = status.coord;

      case 17:
        if (!(coordIndex < points.length)) {
          context$1$0.next = 41;
          break;
        }

        coords = points[coordIndex];
        lat = coords[1];
        lon = coords[0];
        radius = currentMpp / 1000;
        context$1$0.prev = 22;
        context$1$0.next = 25;
        return query(lat, lon, radius);

      case 25:
        posts = context$1$0.sent;

        log.trace('Returned %d posts', posts.length);

        context$1$0.next = 29;
        return savePosts(posts);

      case 29:
        context$1$0.next = 35;
        break;

      case 31:
        context$1$0.prev = 31;
        context$1$0.t0 = context$1$0['catch'](22);

        if (context$1$0.t0.code === 'ECONNREFUSED') {
          log.error('Cannot connect %s', context$1$0.t0.message);
        }

        log.error(context$1$0.t0, 'Query failed: %s', context$1$0.t0.message);

      case 35:
        context$1$0.prev = 35;

        // Save state
        saveState(gridIndex, coordIndex);
        return context$1$0.finish(35);

      case 38:
        coordIndex++;
        context$1$0.next = 17;
        break;

      case 41:
        log.debug('Done grid %d', gridIndex);
        status.coord = 0; // Rest coodinates index

      case 43:
        gridIndex++;
        context$1$0.next = 12;
        break;

      case 46:
        log.debug('Done all grids');

        _fs2['default'].unlinkSync(STATUS_FILE);
        (0, _model.close)();

      case 49:
      case 'end':
        return context$1$0.stop();
    }
  }, callee$0$0, this, [[22, 31, 35, 38]]);
}))['catch'](function (err) {
  log.fatal(err, 'NUOOOOOOOOO');
  (0, _model.close)();
}).then(function () {
  log.info('Bye');
  process.exit(0);
});

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
// Create and save the post

// Setup mongo

// Load social
// Load status file
// Create/load the grid points
// Cycle over the grids

// for( let coords of points ) {
//# sourceMappingURL=index.js.map