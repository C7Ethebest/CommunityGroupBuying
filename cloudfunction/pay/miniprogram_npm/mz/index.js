module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1654652886997, function(require, module, exports) {
module.exports = {
  fs: require('./fs'),
  dns: require('./dns'),
  zlib: require('./zlib'),
  crypto: require('./crypto'),
  readline: require('./readline'),
  child_process: require('./child_process')
}

}, function(modId) {var map = {"./fs":1654652886998,"./dns":1654652886999,"./zlib":1654652887000,"./crypto":1654652887001,"./readline":1654652887002,"./child_process":1654652887003}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886998, function(require, module, exports) {

var Promise = require('any-promise')
var fs
try {
  fs = require('graceful-fs')
} catch(err) {
  fs = require('fs')
}

var api = [
  'appendFile',
  'chmod',
  'chown',
  'close',
  'fchmod',
  'fchown',
  'fdatasync',
  'fstat',
  'fsync',
  'ftruncate',
  'futimes',
  'lchown',
  'link',
  'lstat',
  'mkdir',
  'open',
  'read',
  'readFile',
  'readdir',
  'readlink',
  'realpath',
  'rename',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'write',
  'writeFile'
]

typeof fs.access === 'function' && api.push('access')
typeof fs.copyFile === 'function' && api.push('copyFile')
typeof fs.mkdtemp === 'function' && api.push('mkdtemp')

require('thenify-all').withCallback(fs, exports, api)

exports.exists = function (filename, callback) {
  // callback
  if (typeof callback === 'function') {
    return fs.stat(filename, function (err) {
      callback(null, !err);
    })
  }
  // or promise
  return new Promise(function (resolve) {
    fs.stat(filename, function (err) {
      resolve(!err)
    })
  })
}

}, function(modId) { var map = {"fs":1654652886998}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886999, function(require, module, exports) {

require('thenify-all').withCallback(
  require('dns'),
  exports, [
    'lookup',
    'resolve',
    'resolve4',
    'resolve6',
    'resolveCname',
    'resolveMx',
    'resolveNs',
    'resolveSrv',
    'resolveTxt',
    'reverse'
  ]
)

}, function(modId) { var map = {"dns":1654652886999}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887000, function(require, module, exports) {

require('thenify-all').withCallback(
  require('zlib'),
  exports, [
    'deflate',
    'deflateRaw',
    'gzip',
    'gunzip',
    'inflate',
    'inflateRaw',
    'unzip',
  ]
)

}, function(modId) { var map = {"zlib":1654652887000}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887001, function(require, module, exports) {

require('thenify-all').withCallback(
  require('crypto'),
  exports, [
    'pbkdf2',
    'pseudoRandomBytes',
    'randomBytes'
  ]
)

}, function(modId) { var map = {"crypto":1654652887001}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887002, function(require, module, exports) {
var readline = require('readline')
var Promise = require('any-promise')
var objectAssign = require('object-assign')
var Interface = readline.Interface

function wrapCompleter (completer) {
  if (completer.length === 2) return completer

  return function (line, cb) {
    var result = completer(line)

    if (typeof result.then !== 'function') {
      return cb(null, result)
    }

    result.catch(cb).then(function (result) {
      process.nextTick(function () { cb(null, result) })
    })
  }
}

function InterfaceAsPromised (input, output, completer, terminal) {
  if (arguments.length === 1) {
    var options = input

    if (typeof options.completer === 'function') {
      options = objectAssign({}, options, {
        completer: wrapCompleter(options.completer)
      })
    }

    Interface.call(this, options)
  } else {
    if (typeof completer === 'function') {
      completer = wrapCompleter(completer)
    }

    Interface.call(this, input, output, completer, terminal)
  }
}

InterfaceAsPromised.prototype = Object.create(Interface.prototype)

InterfaceAsPromised.prototype.question = function (question, callback) {
  if (typeof callback === 'function') {
    return Interface.prototype.question.call(this, question, callback)
  }

  var self = this
  return new Promise(function (resolve) {
    Interface.prototype.question.call(self, question, resolve)
  })
}

objectAssign(exports, readline, {
  Interface: InterfaceAsPromised,
  createInterface: function (input, output, completer, terminal) {
    if (arguments.length === 1) {
      return new InterfaceAsPromised(input)
    }

    return new InterfaceAsPromised(input, output, completer, terminal)
  }
})

}, function(modId) { var map = {"readline":1654652887002}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887003, function(require, module, exports) {

require('thenify-all').withCallback(
  require('child_process'),
  exports, [
    'exec',
    'execFile',
  ]
)

}, function(modId) { var map = {"child_process":1654652887003}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1654652886997);
})()
//miniprogram-npm-outsideDeps=["any-promise","graceful-fs","thenify-all","object-assign"]
//# sourceMappingURL=index.js.map