'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var marked0$0 = [query].map(_regeneratorRuntime.mark);

// Load system modules

// Load modules

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _instagramNode = require('instagram-node');

var _instagramNode2 = _interopRequireDefault(_instagramNode);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

// Load my modules

var _configInstagramKeysJson = require('../../config/instagram-keys.json');

var _configInstagramKeysJson2 = _interopRequireDefault(_configInstagramKeysJson);

'use strict';

// Constant declaration
var MAX_RESULTS = 100; // 33 in reality
var MAX_REQUESTS = 5000; // jshint ignore: line
var WINDOW = 1000 * 60 * 60; // 1 h;
// const WINDOW = 1000*30; // 30 sec;
// const COLLECTION_NAME = 'tweets';
var SOCIAL = 'instagram';

// Module variables declaration
var log = _bunyan2['default'].createLogger({
  name: SOCIAL,
  level: 'trace' });
var api = _instagramNode2['default'].instagram();
log.trace({ apiKeys: _configInstagramKeysJson2['default'] }, 'Using api keys');
api.use(_configInstagramKeysJson2['default']);

// Module class declaration

// Module functions declaration
function wrap(media) {
  log.trace('Converting media %s', media.id); // jshint ignore: line
  var date = _moment2['default'].unix(media.created_time); // jshint ignore: line

  var location = media.location;

  var post = {
    source: SOCIAL,
    id: media.id,
    text: media.caption,
    date: date.toDate(),
    location: location ? {
      type: 'Point',
      coordinates: [location.longitude, location.latitude] } : null,
    author: media.user.username,
    authorId: media.user.id,
    tags: media.tags,
    raw: media };

  return post;
}

function wrapAll(medias) {
  log.trace('Wrapping %d media to posts', medias.length);
  var wrapped = medias.map(wrap);
  var filtered = wrapped.filter(function (t) {
    return t.location;
  });
  return filtered;
}

function query(lat, lon, distance) {
  var options, _ref, _ref2, medias, rem, limit;

  return _regeneratorRuntime.wrap(function query$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.prev = 0;
        options = {
          distance: distance,
          count: MAX_RESULTS };
        context$1$0.next = 4;
        return api.media_searchAsync(lat, lon, options);

      case 4:
        _ref = context$1$0.sent;
        _ref2 = _slicedToArray(_ref, 3);
        medias = _ref2[0];
        rem = _ref2[1];
        limit = _ref2[2];
        // jshint ignore: line
        log.debug('Retrieved %d medias', medias.length);
        context$1$0.next = 12;
        return wrapAll(medias);

      case 12:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 15:
        context$1$0.prev = 15;
        context$1$0.t23 = context$1$0['catch'](0);

        if (!(context$1$0.t23.code === 429)) {
          context$1$0.next = 24;
          break;
        }

        // Rate limit reached
        log.debug('Limit reached, waiting');
        context$1$0.next = 21;
        return _bluebird2['default'].delay(WINDOW);

      case 21:
        context$1$0.next = 23;
        return query(lat, lon, distance);

      case 23:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 24:
        throw context$1$0.t23;

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this, [[0, 15]]);
}

// Module initialization (at first load)
api = _bluebird2['default'].promisifyAll(api);

// Entry point

// Exports
exports.query = query;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../social/instagram.js.map