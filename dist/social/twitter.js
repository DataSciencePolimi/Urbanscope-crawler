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

var _twit = require('twit');

var _twit2 = _interopRequireDefault(_twit);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

// Load my modules

var _configTwitterKeysJson = require('../../config/twitter-keys.json');

var _configTwitterKeysJson2 = _interopRequireDefault(_configTwitterKeysJson);

'use strict';

// Constant declaration
var MAX_RESULTS = 100;
var MAX_REQUESTS = 180; // jshint ignore: line
var WINDOW = 1000 * 60 * 15; // 15 min;
// const WINDOW = 1000*30; // 30 sec;
// const COLLECTION_NAME = 'tweets';
var SOCIAL = 'twitter';
var DATE_FORMAT = 'dd MMM DD HH:mm:ss ZZ YYYY';

// Module variables declaration
var log = _bunyan2['default'].createLogger({
  name: SOCIAL,
  level: 'trace' });
var api = new _twit2['default'](_configTwitterKeysJson2['default']);
log.trace({ apiKeys: _configTwitterKeysJson2['default'] }, 'Using api keys');

// Module class declaration

// Module functions declaration
function wrap(tweet) {
  log.trace('Converting tweet %s', tweet.id_str); // jshint ignore: line
  var tags = [];
  if (tweet.entities) {
    tags = tweet.entities.hashtags.map(function (h) {
      return h.text;
    });
  }
  var date = _moment2['default'](tweet.created_at, DATE_FORMAT, 'en'); // jshint ignore: line

  var post = {
    source: SOCIAL,
    id: tweet.id_str, // jshint ignore: line
    text: tweet.text,
    date: date.toDate(),
    location: tweet.coordinates,
    author: tweet.user.screen_name, // jshint ignore: line
    authorId: tweet.user.id_str, // jshint ignore: line
    tags: tags,
    lang: tweet.lang,
    raw: tweet };

  return post;
}

function wrapAll(tweets) {
  log.trace('Wrapping %d tweets to posts', tweets.length);
  var wrapped = tweets.map(wrap);
  var filtered = wrapped.filter(function (t) {
    return t.location;
  });
  return filtered;
}

function query(lat, lon, radius) {
  var geocode, _ref, _ref2, data, tweets;

  return _regeneratorRuntime.wrap(function query$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        geocode = '' + lat + ',' + lon + ',' + radius + 'km';

        log.trace('Geocode: %s', geocode);

        context$1$0.prev = 2;
        context$1$0.next = 5;
        return api.getAsync('search/tweets', { geocode: geocode, count: MAX_RESULTS });

      case 5:
        _ref = context$1$0.sent;
        _ref2 = _slicedToArray(_ref, 1);
        data = _ref2[0];
        tweets = data.statuses;

        log.debug('Retrieved %d tweets', tweets.length);
        return context$1$0.abrupt('return', wrapAll(tweets));

      case 13:
        context$1$0.prev = 13;
        context$1$0.t24 = context$1$0['catch'](2);

        if (!(context$1$0.t24.code === 88)) {
          context$1$0.next = 22;
          break;
        }

        // Rate limit reached
        log.debug('Limit reached, waiting');
        context$1$0.next = 19;
        return _bluebird2['default'].delay(WINDOW);

      case 19:
        context$1$0.next = 21;
        return query(lat, lon, radius);

      case 21:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 22:
        throw context$1$0.t24;

      case 23:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this, [[2, 13]]);
}

// Module initialization (at first load)
api = _bluebird2['default'].promisifyAll(api);

// Entry point

// Exports
exports.query = query;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../social/twitter.js.map