'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

// Entry point

// Exports
exports['default'] = query;
var marked0$0 = [query].map(_regeneratorRuntime.mark);

// Load system modules

// Load modules

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _Twitter = require('twit');

var _Twitter2 = _interopRequireDefault(_Twitter);

var _Promise = require('bluebird');

var _Promise2 = _interopRequireDefault(_Promise);

// Load my modules

var _apiKeys = require('../../config/api-keys.json');

var _apiKeys2 = _interopRequireDefault(_apiKeys);

'use strict';

// Constant declaration
var MAX_RESULTS = 100;
var MAX_REQUESTS = 180; // 450;
var WINDOW = 1000 * 60 * 15; // 15 min;
// const WINDOW = 1000*30; // 30 sec;

// Module variables declaration
var log = _bunyan2['default'].createLogger({
  name: 'cralwer',
  level: 'trace' });
var api = new _Twitter2['default'](_apiKeys2['default']);
log.trace({ apiKeys: _apiKeys2['default'] }, 'Using api keys');

// Module functions declaration

// Module class declaration

// Module initialization (at first load)
api = _Promise2['default'].promisifyAll(api);
function query(lat, lon, radius) {
  var geocode, tweets;
  return _regeneratorRuntime.wrap(function query$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        geocode = '' + lat + ',' + lon + ',' + radius + 'km';

        log.trace('Geocode: %s', geocode);

        context$1$0.prev = 2;
        context$1$0.next = 5;
        return api.getAsync('search/tweets', { geocode: geocode, count: MAX_RESULTS });

      case 5:
        tweets = context$1$0.sent;

        log.debug('Retrieved %d tweets', tweets.length);

        context$1$0.next = 16;
        break;

      case 9:
        context$1$0.prev = 9;
        context$1$0.t7 = context$1$0['catch'](2);

        log.error(context$1$0.t7, 'Twitter query failed: %s', context$1$0.t7.message);

        if (!(context$1$0.t7.code && context$1$0.t7.code === 88)) {
          context$1$0.next = 16;
          break;
        }

        // Rate limit reached
        log.debug('Limit reached, waiting');
        context$1$0.next = 16;
        return _Promise2['default'].delay(WINDOW);

      case 16:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this, [[2, 9]]);
}

module.exports = exports['default'];

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../lib/twitter.js.map