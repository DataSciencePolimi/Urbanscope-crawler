'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var marked0$0 = [open].map(_regeneratorRuntime.mark);

// Load system modules

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

// Load modules

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _Mongorito = require('mongorito');

var _Mongorito2 = _interopRequireDefault(_Mongorito);

// Load my modules

var _Post = require('./post');

var _Post2 = _interopRequireDefault(_Post);

var _config = require('../../config/mongo.json');

var _config2 = _interopRequireDefault(_config);

'use strict';

// Constant declaration

// Module variables declaration
var log = _bunyan2['default'].createLogger({
  name: 'model',
  level: 'trace' });

// Module functions declaration
function open() {
  var hostname, dbName, fullUrl;
  return _regeneratorRuntime.wrap(function open$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        hostname = _config2['default'].url;
        dbName = _config2['default'].database;
        fullUrl = _url2['default'].resolve(hostname + '/', dbName);

        log.trace(fullUrl);
        _Mongorito2['default'].connect(fullUrl);

        context$1$0.next = 7;
        return _Post2['default'].index('id', { index: true, unique: true });

      case 7:
        context$1$0.next = 9;
        return _Post2['default'].index('date', { index: true });

      case 9:
        context$1$0.next = 11;
        return _Post2['default'].index('author', { index: true });

      case 11:
        context$1$0.next = 13;
        return _Post2['default'].index('authorId', { index: true });

      case 13:
        context$1$0.next = 15;
        return _Post2['default'].index('source', { index: true });

      case 15:
        context$1$0.next = 17;
        return _Post2['default'].index({ location: '2dsphere' });

      case 17:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this);
}
function close() {
  _Mongorito2['default'].disconnect();
}

// Module class declaration

// Module initialization (at first load)

// Entry point

// Exports
exports.open = open;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
exports.close = close;
//# sourceMappingURL=../model/index.js.map