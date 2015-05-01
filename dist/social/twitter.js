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

var _Twitter = require('twit');

var _Twitter2 = _interopRequireDefault(_Twitter);

var _Promise = require('bluebird');

var _Promise2 = _interopRequireDefault(_Promise);

// Load my modules

var _apiKeys = require('../../config/twitter-keys.json');

var _apiKeys2 = _interopRequireDefault(_apiKeys);

var _Post = require('../model/post');

var _Post2 = _interopRequireDefault(_Post);

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
var api = new _Twitter2['default'](_apiKeys2['default']);
log.trace({ apiKeys: _apiKeys2['default'] }, 'Using api keys');

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

  var post = new _Post2['default']({
    source: SOCIAL,
    id: tweet.id_str, // jshint ignore: line
    text: tweet.text,
    date: date.toDate(),
    location: tweet.coordinates,
    author: tweet.user.screen_name, // jshint ignore: line
    authorId: tweet.user.id_str, // jshint ignore: line
    tags: tags,
    raw: tweet });

  return post;
}

function wrapAll(tweets) {
  log.trace('Wrapping %d tweets to posts', tweets.length);
  return tweets.map(wrap);
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
        context$1$0.next = 12;
        return wrapAll(tweets);

      case 12:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 15:
        context$1$0.prev = 15;
        context$1$0.t252 = context$1$0['catch'](2);

        if (!(context$1$0.t252.code === 88)) {
          context$1$0.next = 24;
          break;
        }

        // Rate limit reached
        log.debug('Limit reached, waiting');
        context$1$0.next = 21;
        return _Promise2['default'].delay(WINDOW);

      case 21:
        context$1$0.next = 23;
        return query(lat, lon, radius);

      case 23:
        return context$1$0.abrupt('return', context$1$0.sent);

      case 24:
        throw context$1$0.t252;

      case 25:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this, [[2, 15]]);
}

// Module initialization (at first load)
api = _Promise2['default'].promisifyAll(api);

// Entry point

// Exports
exports.query = query;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
//# sourceMappingURL=../social/twitter.js.map