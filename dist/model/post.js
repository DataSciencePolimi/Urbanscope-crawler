'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

// Load system modules

// Load modules

var _mongorito = require('mongorito');

var _mongorito2 = _interopRequireDefault(_mongorito);

'use strict';

// Load my modules

// Constant declaration

// Module variables declaration
var Model = _mongorito2['default'].Model;

// Module class declaration

var Post = (function (_Model) {
  function Post() {
    _classCallCheck(this, Post);

    if (_Model != null) {
      _Model.apply(this, arguments);
    }
  }

  _inherits(Post, _Model);

  return Post;
})(Model);

// Module functions declaration

// Module initialization (at first load)

// Exports
exports['default'] = Post;

//  50 6F 77 65 72 65 64  62 79  56 6F 6C 6F 78
module.exports = exports['default'];
//# sourceMappingURL=../model/post.js.map