module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1654652887114, function(require, module, exports) {


var copy = require('copy-to');

copy(require('./function'))
.and(require('./polyfill'))
.and(require('./optimize'))
.and(require('./crypto'))
.and(require('./number'))
.and(require('./string'))
.and(require('./array'))
.and(require('./json'))
.and(require('./date'))
.and(require('./object'))
.and(require('./web'))
.to(module.exports);

}, function(modId) {var map = {"./function":1654652887115,"./polyfill":1654652887116,"./optimize":1654652887117,"./crypto":1654652887118,"./number":1654652887119,"./string":1654652887120,"./array":1654652887121,"./json":1654652887122,"./date":1654652887123,"./object":1654652887124,"./web":1654652887125}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887115, function(require, module, exports) {


var assert = require('assert');

/**
 * A empty function.
 *
 * @return {Function}
 * @public
 */
exports.noop = function noop() {};

/**
 * Get a function parameter's names.
 *
 * @param {Function} func
 * @param {Boolean} [useCache], default is true
 * @return {Array} names
 */
exports.getParamNames = function getParamNames(func, cache) {
  var type = typeof func;
  assert(type === 'function', 'The "func" must be a function. Received type "' + type + '"');

  cache = cache !== false;
  if (cache && func.__cache_names) {
    return func.__cache_names;
  }
  var str = func.toString();
  var names = str.slice(str.indexOf('(') + 1, str.indexOf(')')).match(/([^\s,]+)/g) || [];
  func.__cache_names = names;
  return names;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887116, function(require, module, exports) {


exports.setImmediate = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){
    process.nextTick(fn.bind.apply(fn, arguments));
  };

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887117, function(require, module, exports) {


/**
 * optimize try catch
 * @param {Function} fn
 * @return {Object}
 *   - {Error} error
 *   - {Mix} value
 */
exports.try = function (fn) {
  var res = {
    error: undefined,
    value: undefined
  };

  try {
    res.value = fn();
  } catch (err) {
    res.error = err instanceof Error
      ? err
      : new Error(err);
  }

  return res;
};


/**
 * @description Deal with typescript
 */
exports.UNSTABLE_METHOD = {
  try: exports.try,
};


/**
 * avoid if (a && a.b && a.b.c)
 * @param {Object} obj
 * @param {...String} keys
 * @return {Object}
 */
exports.dig = function (obj) {
  if (!obj) {
    return;
  }
  if (arguments.length <= 1) {
    return obj;
  }

  var value = obj[arguments[1]];
  for (var i = 2; i < arguments.length; i++) {
    if (!value) {
      break;
    }
    value = value[arguments[i]];
  }

  return value;
};

/**
 * optimize arguments to array
 * @param {Arguments} args
 * @return {Array}
 */
exports.argumentsToArray = function (args) {
  var res = new Array(args.length);
  for (var i = 0; i < args.length; i++) {
    res[i] = args[i];
  }
  return res;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887118, function(require, module, exports) {


var crypto = require('crypto');

/**
 * hash
 *
 * @param {String} method hash method, e.g.: 'md5', 'sha1'
 * @param {String|Buffer} s
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} md5 hash string
 * @public
 */
exports.hash = function hash(method, s, format) {
  var sum = crypto.createHash(method);
  var isBuffer = Buffer.isBuffer(s);
  if (!isBuffer && typeof s === 'object') {
    s = JSON.stringify(sortObject(s));
  }
  sum.update(s, isBuffer ? 'binary' : 'utf8');
  return sum.digest(format || 'hex');
};

/**
 * md5 hash
 *
 * @param {String|Buffer} s
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} md5 hash string
 * @public
 */
exports.md5 = function md5(s, format) {
  return exports.hash('md5', s, format);
};

/**
 * sha1 hash
 *
 * @param {String|Buffer} s
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha1 hash string
 * @public
 */
exports.sha1 = function sha1(s, format) {
  return exports.hash('sha1', s, format);
};

/**
 * sha256 hash
 *
 * @param {String|Buffer} s
 * @param {String} [format] output string format, could be 'hex' or 'base64'. default is 'hex'.
 * @return {String} sha256 hash string
 * @public
 */
exports.sha256 = function sha256(s, format) {
  return exports.hash('sha256', s, format);
};

/**
 * HMAC algorithm.
 *
 * Equal bash:
 *
 * ```bash
 * $ echo -n "$data" | openssl dgst -binary -$algorithm -hmac "$key" | openssl $encoding
 * ```
 *
 * @param {String} algorithm, dependent on the available algorithms supported by the version of OpenSSL on the platform.
 *   Examples are 'sha1', 'md5', 'sha256', 'sha512', etc.
 *   On recent releases, `openssl list-message-digest-algorithms` will display the available digest algorithms.
 * @param {String} key, the hmac key to be used.
 * @param {String|Buffer} data, content string.
 * @param {String} [encoding='base64']
 * @return {String} digest string.
 */
exports.hmac = function hmac(algorithm, key, data, encoding) {
  encoding = encoding || 'base64';
  var hmac = crypto.createHmac(algorithm, key);
  hmac.update(data, Buffer.isBuffer(data) ? 'binary' : 'utf8');
  return hmac.digest(encoding);
};

/**
 * Base64 encode string.
 *
 * @param {String|Buffer} s
 * @param {Boolean} [urlsafe=false] Encode string s using a URL-safe alphabet,
 *   which substitutes - instead of + and _ instead of / in the standard Base64 alphabet.
 * @return {String} base64 encode format string.
 */
exports.base64encode = function base64encode(s, urlsafe) {
  if (!Buffer.isBuffer(s)) {
    s = typeof Buffer.from === 'function' ? Buffer.from(s) : new Buffer(s);
  }
  var encode = s.toString('base64');
  if (urlsafe) {
    encode = encode.replace(/\+/g, '-').replace(/\//g, '_');
  }
  return encode;
};

/**
 * Base64 string decode.
 *
 * @param {String} encode, base64 encoding string.
 * @param {Boolean} [urlsafe=false] Decode string s using a URL-safe alphabet,
 *   which substitutes - instead of + and _ instead of / in the standard Base64 alphabet.
 * @param {encoding} [encoding=utf8] if encoding = buffer, will return Buffer instance
 * @return {String|Buffer} plain text.
 */
exports.base64decode = function base64decode(encodeStr, urlsafe, encoding) {
  if (urlsafe) {
    encodeStr = encodeStr.replace(/\-/g, '+').replace(/_/g, '/');
  }
  var buf = typeof Buffer.from === 'function' ? Buffer.from(encodeStr, 'base64') : new Buffer(encodeStr, 'base64');
  if (encoding === 'buffer') {
    return buf;
  }
  return buf.toString(encoding || 'utf8');
};

function sortObject(o) {
  if (!o || Array.isArray(o) || typeof o !== 'object') {
    return o;
  }
  var keys = Object.keys(o);
  keys.sort();
  var values = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    values.push([k, sortObject(o[k])]);
  }
  return values;
}

}, function(modId) { var map = {"crypto":1654652887118}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887119, function(require, module, exports) {


// http://www.2ality.com/2013/10/safe-integers.html
// http://es6.ruanyifeng.com/#docs/number
exports.MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
exports.MIN_SAFE_INTEGER = -exports.MAX_SAFE_INTEGER;
var MAX_SAFE_INTEGER_STR = exports.MAX_SAFE_INTEGER_STR = String(exports.MAX_SAFE_INTEGER);
var MAX_SAFE_INTEGER_STR_LENGTH = MAX_SAFE_INTEGER_STR.length;

/**
 * Detect a number string can safe convert to Javascript Number.
 *
 * @param {String} s number format string, like `"123"`, `"-1000123123123123123123"`
 * @return {Boolean}
 */
exports.isSafeNumberString = function isSafeNumberString(s) {
  if (s[0] === '-') {
    s = s.substring(1);
  }
  if (s.length < MAX_SAFE_INTEGER_STR_LENGTH ||
    (s.length === MAX_SAFE_INTEGER_STR_LENGTH && s <= MAX_SAFE_INTEGER_STR)) {
    return true;
  }
  return false;
};

/**
 * Convert string to Number if string in safe Number scope.
 *
 * @param {String} s number format string.
 * @return {Number|String} success will return Number, otherise return the original string.
 */
exports.toSafeNumber = function toSafeNumber(s) {
  if (typeof s === 'number') {
    return s;
  }

  return exports.isSafeNumberString(s) ? Number(s) : s;
};

/**
 * Produces a random integer between the inclusive `lower` and `upper` bounds.
 *
 * @param {Number} lower The lower bound.
 * @param {Number} upper The upper bound.
 * @return {Number} Returns the random number.
 */
exports.random = function random(lower, upper) {
  if (lower === undefined && upper === undefined) {
    return 0;
  }
  if (upper === undefined) {
    upper = lower;
    lower = 0;
  }
  var temp;
  if (lower > upper) {
    temp = lower;
    lower = upper;
    upper = temp;
  }
  return Math.floor(lower + Math.random() * (upper - lower));
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887120, function(require, module, exports) {


exports.randomString = function randomString(length, charSet) {
  var result = [];
  length = length || 16;
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  while (length--) {
    result.push(charSet[Math.floor(Math.random() * charSet.length)]);
  }
  return result.join('');
};

/**
 * split string to array
 * @param  {String} str
 * @param  {String} [sep] default is ','
 * @return {Array}
 */
exports.split = function split(str, sep) {
  str = str || '';
  sep = sep || ',';
  var items = str.split(sep);
  var needs = [];
  for (var i = 0; i < items.length; i++) {
    var s = items[i].trim();
    if (s.length > 0) {
      needs.push(s);
    }
  }
  return needs;
};
// always optimized
exports.splitAlwaysOptimized = function splitAlwaysOptimized() {
  var str = '';
  var sep = ',';
  if (arguments.length === 1) {
    str = arguments[0] || '';
  } else if (arguments.length === 2) {
    str = arguments[0] || '';
    sep = arguments[1] || ',';
  }
  var items = str.split(sep);
  var needs = [];
  for (var i = 0; i < items.length; i++) {
    var s = items[i].trim();
    if (s.length > 0) {
      needs.push(s);
    }
  }
  return needs;
};

/**
 * Replace string
 *
 * @param  {String} str
 * @param  {String|RegExp} substr
 * @param  {String|Function} newSubstr
 * @return {String}
 */
exports.replace = function replace(str, substr, newSubstr) {
  var replaceFunction = newSubstr;
  if (typeof replaceFunction !== 'function') {
    replaceFunction = function () {
      return newSubstr;
    };
  }
  return str.replace(substr, replaceFunction);
};

// original source https://github.com/nodejs/node/blob/v7.5.0/lib/_http_common.js#L300
/**
 * True if val contains an invalid field-vchar
 *  field-value    = *( field-content / obs-fold )
 *  field-content  = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 *  field-vchar    = VCHAR / obs-text
 *
 * checkInvalidHeaderChar() is currently designed to be inlinable by v8,
 * so take care when making changes to the implementation so that the source
 * code size does not exceed v8's default max_inlined_source_size setting.
 **/
var validHdrChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 48 - 63
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, // 112 - 127
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 128 ...
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  // ... 255
];

/**
 * Replace invalid http header characters with replacement
 *
 * @param  {String} val
 * @param  {String|Function} replacement - can be `function(char)`
 * @return {Object}
 */
exports.replaceInvalidHttpHeaderChar = function replaceInvalidHttpHeaderChar(val, replacement) {
  replacement = replacement || ' ';
  var invalid = false;

  if (!val || typeof val !== 'string') {
    return {
      val: val,
      invalid: invalid,
    };
  }

  var replacementType = typeof replacement;
  var chars;
  for (var i = 0; i < val.length; ++i) {
    if (!validHdrChars[val.charCodeAt(i)]) {
      // delay create chars
      chars = chars || val.split('');
      if (replacementType === 'function') {
        chars[i] = replacement(chars[i]);
      } else {
        chars[i] = replacement;
      }
    }
  }

  if (chars) {
    val = chars.join('');
    invalid = true;
  }

  return {
    val: val,
    invalid: invalid,
  };
};

/**
 * Detect invalid http header characters in a string
 *
 * @param {String} val
 * @return {Boolean}
 */
exports.includesInvalidHttpHeaderChar = function includesInvalidHttpHeaderChar(val) {
  if (!val || typeof val !== 'string') {
    return false;
  }

  for (var i = 0; i < val.length; ++i) {
    if (!validHdrChars[val.charCodeAt(i)]) {
      return true;
    }
  }

  return false;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887121, function(require, module, exports) {


/**
 * Array random slice with items count.
 * @param {Array} arr
 * @param {Number} num, number of sub items.
 * @return {Array}
 */
exports.randomSlice = function randomSlice(arr, num) {
  if (!num || num >= arr.length) {
    return arr.slice();
  }
  var index = Math.floor(Math.random() * arr.length);
  var a = [];
  for (var i = 0, j = index; i < num; i++) {
    a.push(arr[j++]);
    if (j === arr.length) {
      j = 0;
    }
  }
  return a;
};

/**
 * Remove one exists element from an array
 * @param {Array} arr
 * @param  {Number} index - remove element index
 * @return {Array} the array instance
 */
exports.spliceOne = function spliceOne(arr, index) {
  if (index < 0) {
    index = arr.length + index;
    // still negative, not found element
    if (index < 0) {
      return arr;
    }
  }

  // don't touch
  if (index >= arr.length) {
    return arr;
  }

  for (var i = index, k = i + 1, n = arr.length; k < n; i += 1, k += 1) {
    arr[i] = arr[k];
  }
  arr.pop();
  return arr;
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887122, function(require, module, exports) {


var fs = require('mz/fs');
var path = require('path');
var mkdirp = require('mkdirp');

exports.strictJSONParse = function (str) {
  var obj = JSON.parse(str);
  if (!obj || typeof obj !== 'object') {
    throw new Error('JSON string is not object');
  }
  return obj;
};

exports.readJSONSync = function(filepath) {
  if (!fs.existsSync(filepath)) {
    throw new Error(filepath + ' is not found');
  }
  return JSON.parse(fs.readFileSync(filepath));
};

exports.writeJSONSync = function(filepath, str, options) {
  options = options || {};
  if (!('space' in options)) {
    options.space = 2;
  }

  mkdirp.sync(path.dirname(filepath));
  if (typeof str === 'object') {
    str = JSON.stringify(str, options.replacer, options.space) + '\n';
  }

  fs.writeFileSync(filepath, str);
};

exports.readJSON = function(filepath) {
  return fs.exists(filepath)
    .then(function(exists) {
      if (!exists) {
        throw new Error(filepath + ' is not found');
      }
      return fs.readFile(filepath);
    })
    .then(function(buf) {
      return JSON.parse(buf);
    });
};

exports.writeJSON = function(filepath, str, options) {
  options = options || {};
  if (!('space' in options)) {
    options.space = 2;
  }

  if (typeof str === 'object') {
    str = JSON.stringify(str, options.replacer, options.space) + '\n';
  }

  return mkdir(path.dirname(filepath))
    .then(function() {
      return fs.writeFile(filepath, str);
    });
};

function mkdir(dir) {
  return new Promise(function(resolve, reject) {
    mkdirp(dir, function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887123, function(require, module, exports) {


var MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// only set once.
var TIMEZONE = ' ';
var _hourOffset = parseInt(-(new Date().getTimezoneOffset()) / 60, 10);
if (_hourOffset >= 0) {
  TIMEZONE += '+';
} else {
  TIMEZONE += '-';
}
_hourOffset = Math.abs(_hourOffset);
if (_hourOffset < 10) {
  _hourOffset = '0' + _hourOffset;
}
TIMEZONE += _hourOffset + '00';

/**
 * Access log format date. format: `moment().format('DD/MMM/YYYY:HH:mm:ss ZZ')`
 *
 * @return {String}
 */
exports.accessLogDate = function (d) {
  // 16/Apr/2013:16:40:09 +0800
  d = d || new Date();
  var date = d.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  var hours = d.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  var mintues = d.getMinutes();
  if (mintues < 10) {
    mintues = '0' + mintues;
  }
  var seconds = d.getSeconds();
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return date + '/' + MONTHS[d.getMonth()] + '/' + d.getFullYear() +
    ':' + hours + ':' + mintues + ':' + seconds + TIMEZONE;
};

/**
 * Normal log format date. format: `moment().format('YYYY-MM-DD HH:mm:ss.SSS')`
 *
 * @return {String}
 */
exports.logDate = exports.YYYYMMDDHHmmssSSS = function (d, msSep) {
  if (typeof d === 'string') {
    // logDate(msSep)
    msSep = d;
    d = new Date();
  } else {
    // logDate(d, msSep)
    d = d || new Date();
  }
  var date = d.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  var month = d.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  var hours = d.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  var mintues = d.getMinutes();
  if (mintues < 10) {
    mintues = '0' + mintues;
  }
  var seconds = d.getSeconds();
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  var milliseconds = d.getMilliseconds();
  if (milliseconds < 10) {
    milliseconds = '00' + milliseconds;
  } else if (milliseconds < 100) {
    milliseconds = '0' + milliseconds;
  }
  return d.getFullYear() + '-' + month + '-' + date + ' ' +
    hours + ':' + mintues + ':' + seconds + (msSep || '.') + milliseconds;
};

/**
 * `moment().format('YYYY-MM-DD HH:mm:ss')` format date string.
 *
 * @return {String}
 */
exports.YYYYMMDDHHmmss = function (d, options) {
  d = d || new Date();
  if (!(d instanceof Date)) {
    d = new Date(d);
  }

  var dateSep = '-';
  var timeSep = ':';
  if (options) {
    if (options.dateSep) {
      dateSep = options.dateSep;
    }
    if (options.timeSep) {
      timeSep = options.timeSep;
    }
  }
  var date = d.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  var month = d.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  var hours = d.getHours();
  if (hours < 10) {
    hours = '0' + hours;
  }
  var mintues = d.getMinutes();
  if (mintues < 10) {
    mintues = '0' + mintues;
  }
  var seconds = d.getSeconds();
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return d.getFullYear() + dateSep + month + dateSep + date + ' ' +
    hours + timeSep + mintues + timeSep + seconds;
};

/**
 * `moment().format('YYYY-MM-DD')` format date string.
 *
 * @return {String}
 */
exports.YYYYMMDD = function YYYYMMDD(d, sep) {
  if (typeof d === 'string') {
    // YYYYMMDD(sep)
    sep = d;
    d = new Date();
  } else {
    // YYYYMMDD(d, sep)
    d = d || new Date();
    if (typeof sep !== 'string') {
      sep = '-';
    }
  }
  var date = d.getDate();
  if (date < 10) {
    date = '0' + date;
  }
  var month = d.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  return d.getFullYear() + sep + month + sep + date;
};

/**
 * return datetime struct.
 *
 * @return {Object} date
 *  - {Number} YYYYMMDD, 20130401
 *  - {Number} H, 0, 1, 9, 12, 23
 */
exports.datestruct = function (now) {
  now = now || new Date();
  return {
    YYYYMMDD: now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate(),
    H: now.getHours()
  };
};

/**
 * Get Unix's timestamp in seconds.
 * @return {Number}
 */
exports.timestamp = function timestamp(t) {
  if (t) {
    var v = t;
    if (typeof v === 'string') {
      v = Number(v);
    }
    if (String(t).length === 10) {
      v *= 1000;
    }
    return new Date(v);
  }
  return Math.round(Date.now() / 1000);
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887124, function(require, module, exports) {


/**
 * High performance assign before node6
 * @param {Object} target - target object
 * @param {Object | Array} objects - object assign from
 * @return {Object} - return target object
 */
exports.assign = function(target, objects) {
  if (!Array.isArray(objects)) {
    objects = [ objects ];
  }

  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    if (obj) {
      var keys = Object.keys(obj);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        target[key] = obj[key];
      }
    }
  }
  return target;
};

exports.has = function has(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

/**
 * Get all enumerable and ownership of property names
 * @param {Object} obj - detect object
 * @param {Boolean} [ignoreNull] - ignore null, undefined or NaN property
 * @return {Array<String>} property names
 */
exports.getOwnEnumerables = function getOwnEnumerables(obj, ignoreNull) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  return Object.keys(obj).filter(function(key) {
    if (ignoreNull) {
      var value = obj[key];
      if (value === null || value === undefined || Number.isNaN(value)) {
        return false;
      }
    }
    return exports.has(obj, key);
  });
};

/**
 * generate a real map object(clean object), no constructor, no __proto__
 * @param {Object} [obj] - init object, optional
 * @return {Object}
 */
exports.map = function map(obj) {
  var map = new EmptyObject();
  if (!obj) {
    return map;
  }

  for (var key in obj) {
    map[key] = obj[key];
  }
  return map;
};

// faster way like `Object.create(null)` to get a 'clean' empty object
// https://github.com/nodejs/node/blob/master/lib/events.js#L5
// https://cnodejs.org/topic/571e0c445a26c4a841ecbcf1
function EmptyObject() {}
EmptyObject.prototype = Object.create(null);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887125, function(require, module, exports) {


/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @public
 */
exports.escape = require('escape-html');


/**
 * Unescape the given string from html
 * @param {String} html
 * @param {String} type
 * @return {String}
 * @public
 */
exports.unescape = require('unescape');

/**
 * Safe encodeURIComponent, won't throw any error.
 * If `encodeURIComponent` error happen, just return the original value.
 *
 * @param {String} text
 * @return {String} URL encode string.
 */
exports.encodeURIComponent = function encodeURIComponent_(text) {
  try {
    return encodeURIComponent(text);
  } catch (e) {
    return text;
  }
};

/**
 * Safe decodeURIComponent, won't throw any error.
 * If `decodeURIComponent` error happen, just return the original value.
 *
 * @param {String} encodeText
 * @return {String} URL decode original string.
 */
exports.decodeURIComponent = function decodeURIComponent_(encodeText) {
  try {
    return decodeURIComponent(encodeText);
  } catch (e) {
    return encodeText;
  }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1654652887114);
})()
//miniprogram-npm-outsideDeps=["copy-to","assert","mz/fs","path","mkdirp","escape-html","unescape"]
//# sourceMappingURL=index.js.map