'use strict';

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

var marked0$0 = [init].map(_regeneratorRuntime.mark);

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
function init() {
  return _regeneratorRuntime.wrap(function init$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        context$1$0.next = 2;
        return _Post2['default'].index('id', { unique: true });

      case 2:
      case 'end':
        return context$1$0.stop();
    }
  }, marked0$0[0], this);
}

// Module class declaration

// Module initialization (at first load)
var hostname = _config2['default'].url;
var dbName = _config2['default'].database;
var fullUrl = _url2['default'].resolve(hostname + '/', dbName);

// Entry point
log.trace(fullUrl);
_Mongorito2['default'].connect(fullUrl);

// Exports
exports['default'] = init;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
module.exports = exports['default'];
//# sourceMappingURL=../model/index.js.map