module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1654652886940, function(require, module, exports) {


/**
 * Module dependencies.
 */

var parse = require('url').parse;
var debug = require('debug')('get-uri');

/**
 * Module exports.
 */

module.exports = exports = getUri;

/**
 * Supported "protocols".
 */

exports.protocols = {
  data: require('./data'),
  file: require('./file'),
  ftp: require('./ftp'),
  http: require('./http'),
  https: require('./https')
};

/**
 * Async function that returns a `stream.Readable` instance to the
 * callback function that will output the contents of the given URI.
 *
 * For caching purposes, you can pass in a `stream` instance from a previous
 * `getUri()` call as a `cache: stream` option, and if the destination has
 * not changed since the last time the endpoint was retreived then the callback
 * will be invoked with an Error object with `code` set to "ENOTMODIFIED" and
 * `null` for the "stream" instance argument. In this case, you can skip
 * retreiving the file again and continue to use the previous payload.
 *
 * @param {String} uri URI to retrieve
 * @param {Object} opts optional "options" object
 * @param {Function} fn callback function
 * @api public
 */

function getUri (uri, opts, fn) {
  debug('getUri(%o)', uri);

  if ('function' == typeof opts) {
    fn = opts;
    opts = null;
  }
  if ('function' != typeof fn) {
    throw new TypeError('a callback function must be provided');
  }

  if (!uri) return fn(new TypeError('must pass in a URI to "get"'));

  var parsed = parse(uri);
  var protocol = parsed.protocol;
  if (!protocol) return fn(new TypeError('URI does not contain a protocol: ' + uri));

  // strip trailing :
  protocol = protocol.replace(/\:$/, '');

  var getter = exports.protocols[protocol];

  if ('function' != typeof getter)
    return fn(new TypeError('unsupported protocol "' + protocol + '" specified in URI: ' + uri));

  getter(parsed, opts || {}, fn);
}

}, function(modId) {var map = {"./data":1654652886941,"./file":1654652886943,"./ftp":1654652886945,"./http":1654652886946,"./https":1654652886947}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886941, function(require, module, exports) {

/**
 * Module dependencies.
 */

var crypto = require('crypto');
var Readable = require('readable-stream');;
var dataUriToBuffer = require('data-uri-to-buffer');
var NotModifiedError = require('./notmodified');
var debug = require('debug')('get-uri:data');

/**
 * Module exports.
 */

module.exports = get;

/**
 * Returns a Readable stream from a "data:" URI.
 *
 * @api protected
 */

function get (parsed, opts, fn) {
  var uri = parsed.href;
  var cache = opts.cache;

  // need to create a SHA1 hash of the URI string, for cacheability checks
  // in future `getUri()` calls with the same data URI passed in.
  var shasum = crypto.createHash('sha1');
  shasum.update(uri);
  var hash = shasum.digest('hex');
  debug('generated SHA1 hash for "data:" URI: %o', hash);

  // check if the cache is the same "data:" URI that was previously passed in.
  if (cache && cache.hash == hash) {
    debug('got matching cache SHA1 hash: %o', hash);
    fn(new NotModifiedError());
  } else {
    debug('creating Readable stream from "data:" URI buffer');
    var buf = dataUriToBuffer(uri, opts);
    var rs = new Readable();
    rs._read = read(buf);
    buf = null;
    rs.hash = hash;
    fn(null, rs);
  }
}

/**
 * Function that returns a Readable `_read` function implementation.
 *
 * @api private
 */

function read (buf) {
  return function (n) {
    this.push(buf);
    this.push(null);
    buf = null;
  };
}

}, function(modId) { var map = {"./notmodified":1654652886942}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886942, function(require, module, exports) {

/**
 * Module dependencies.
 */

var inherits = require('util').inherits;

/**
 * Module exports.
 */

module.exports = NotModifiedError;

/**
 * Error subclass to use when the source has not been modified.
 *
 * @param {String} message optional "message" property to set
 * @api protected
 */

function NotModifiedError (message) {
  this.name = 'NotModifiedError';
  this.code = 'ENOTMODIFIED';
  this.message = message || 'Source has not been modified since the provied "cache", re-use previous results';
  Error.captureStackTrace(this, NotModifiedError);
}

inherits(NotModifiedError, Error);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886943, function(require, module, exports) {

/**
 * Module dependencies.
 */

var fs = require('fs');
var uri2path = require('file-uri-to-path');
var NotFoundError = require('./notfound');
var NotModifiedError = require('./notmodified');
var debug = require('debug')('get-uri:file');

/**
 * Module exports.
 */

module.exports = get;

/**
 * Returns a `fs.ReadStream` instance from a "file:" URI.
 *
 * @api protected
 */

function get (parsed, opts, fn) {

  var fd;
  var cache = opts.cache;

  // same as in fs.ReadStream's constructor
  var flags = opts.hasOwnProperty('flags') ? options.flags : 'r';
  var mode = opts.hasOwnProperty('mode') ? options.mode : 438; /*=0666*/

  // convert URI → Path
  var uri = parsed.href;
  var filepath = uri2path(uri);
  debug('normalized pathname: %o', filepath);

  // open() first to get a fd and ensure that the file exists
  fs.open(filepath, flags, mode, onopen);

  function onerror (err) {
    if ('number' == typeof fd) {
      fs.close(fd, onclose);
    }
    fn(err);
  }

  function onclose () {
    debug('closed fd %o', fd);
  }

  function onopen (err, _fd) {
    if (err) {
      if ('ENOENT' == err.code) {
        err = new NotFoundError();
      }
      return onerror(err);
    }
    fd = _fd;

    // now fstat() to check the `mtime` and store the stat object for the cache
    fs.fstat(fd, onstat);
  }

  function onstat (err, stat) {
    if (err) return onerror(err);

    // if a `cache` was provided, check if the file has not been modified
    if (cache && cache.stat && stat && isNotModified(cache.stat, stat)) {
      return onerror(new NotModifiedError());
    }

    // `fs.ReadStream` takes care of calling `fs.close()` on the
    // fd after it's done reading
    opts.fd = fd;
    var rs = fs.createReadStream(null, opts);
    rs.stat = stat;

    fn(null, rs);
  }

  // returns `true` if the `mtime` of the 2 stat objects are equal
  function isNotModified (prev, curr) {
    return +prev.mtime == +curr.mtime;
  }
}

}, function(modId) { var map = {"./notfound":1654652886944,"./notmodified":1654652886942}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886944, function(require, module, exports) {

/**
 * Module dependencies.
 */

var inherits = require('util').inherits;

/**
 * Module exports.
 */

module.exports = NotFoundError;

/**
 * Error subclass to use when the source does not exist at the specified endpoint.
 *
 * @param {String} message optional "message" property to set
 * @api protected
 */

function NotFoundError (message) {
  this.name = 'NotFoundError';
  this.code = 'ENOTFOUND';
  this.message = message || 'File does not exist at the specified endpoint';
  Error.captureStackTrace(this, NotFoundError);
}

inherits(NotFoundError, Error);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886945, function(require, module, exports) {

/**
 * Module dependencies.
 */

var FTP = require('ftp');
var path = require('path');
var NotFoundError = require('./notfound');
var NotModifiedError = require('./notmodified');
var debug = require('debug')('get-uri:ftp');

/**
 * Module exports.
 */

module.exports = get;

/**
 * Returns a Readable stream from an "ftp:" URI.
 *
 * @api protected
 */

function get (parsed, opts, fn) {
  var cache = opts.cache;
  var client = new FTP();
  var filepath = parsed.pathname;
  var lastModified;

  client.once('error', onerror);
  client.once('ready', onready);
  client.once('greeting', ongreeting);

  function onready () {
    // first we have to figure out the Last Modified date.
    // try the MDTM command first, which is an optional extension command.
    client.lastMod(filepath, onlastmod);
  }

  function ongreeting (greeting) {
    debug('FTP greeting: %o', greeting);
  }

  function onerror (err) {
    client.end();
    fn(err);
  }

  function onfile (err, stream) {
    if (err) return onerror(err);
    stream.once('end', onend);
    stream.lastModified = lastModified;
    fn(null, stream);
  }

  function onend () {
    // close the FTP client socket connection
    client.end();
  }

  function getFile () {
    client.get(filepath, onfile);
  }

  function onlastmod (err, lastmod) {
    // handle the "file not found" error code
    if (err) {
      if (550 == err.code) {
        onerror(new NotFoundError());
      }
      // any other error then we'll try the LIST command instead
    }
    if (lastmod) {
      setLastMod(lastmod);
    } else {
      // try to get the last modified date via the LIST command (uses
      // more bandwidth, but is more compatible with older FTP servers
      var dir = path.dirname(filepath);
      client.list(dir, onlist);
    }
  }

  function setLastMod (lastmod) {
    lastModified = lastmod;
    if (cache && isNotModified()) {
      // file is the same as in the "cache", return a not modified error
      onerror(new NotModifiedError());
    } else {
      // XXX: a small timeout seemed necessary otherwise FTP servers
      // were returning empty sockets for the file occasionally
      setTimeout(client.get.bind(client, filepath, onfile), 10);
    }
  }

  function onlist (err, list) {
    if (err) return onerror(err);
    var name = path.basename(filepath);

    // attempt to find the "entry" with a matching "name"
    var entry;
    for (var i = 0; i < list.length; i++) {
      entry = list[i];
      debug('file %o: %o', i, entry.name);
      if (entry.name == name) {
        break;
      }
      entry = null;
    }

    if (entry) {
      setLastMod(entry.date);
    } else {
      onerror(new NotFoundError());
    }
  }

  // called when `lastModified` is set, and a "cache" stream was provided
  function isNotModified () {
    return +cache.lastModified == +lastModified;
  }

  opts.host = parsed.hostname || parsed.host || 'localhost';
  opts.port = parseInt(parsed.port, 10) || 21;
  if (debug.enabled) opts.debug = debug;

  if (parsed.auth) {
    const [user, password] = parsed.auth.split(":");
    opts.user = user;
    opts.password = password;
  }
  
  client.connect(opts);
}

}, function(modId) { var map = {"ftp":1654652886945,"./notfound":1654652886944,"./notmodified":1654652886942}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886946, function(require, module, exports) {

/**
 * Module dependencies.
 */

var url = require('url');
var http = require('http');
var https = require('https');
var extend = require('extend');
var NotFoundError = require('./notfound');
var NotModifiedError = require('./notmodified');
var debug = require('debug')('get-uri:http');

/**
 * Module exports.
 */

module.exports = get;

/**
 * Returns a Readable stream from an "http:" URI.
 *
 * @api protected
 */

function get (parsed, opts, fn) {
  debug('GET %o', parsed.href);

  var cache = getCache(parsed, opts.cache);

  // 5 redirects allowed by default
  var maxRedirects = opts.hasOwnProperty('maxRedirects') ? opts.maxRedirects : 5;
  debug('allowing %o max redirects', maxRedirects);

  // first check the previous Expires and/or Cache-Control headers
  // of a previous response if a `cache` was provided
  if (cache && isFresh(cache)) {

    // check for a 3xx "redirect" status code on the previous cache
    var location = cache.headers.location;
    var type = (cache.statusCode / 100 | 0);
    if (3 == type && location) {
      debug('cached redirect');
      fn(new Error('TODO: implement cached redirects!'));
    } else {
      // otherwise we assume that it's the destination endpoint,
      // since there's nowhere else to redirect to
      fn(new NotModifiedError());
    }
    return;
  }

  var mod;
  if (opts.http) {
    // the `https` module passed in from the "http.js" file
    mod = opts.http;
    debug('using secure `https` core module');
  } else {
    mod = http;
    debug('using `http` core module');
  }

  var options = extend({}, opts, parsed);

  // add "cache validation" headers if a `cache` was provided
  if (cache) {
    if (!options.headers) options.headers = {};

    var lastModified = cache.headers['last-modified'];
    if (lastModified != null) {
      options.headers['If-Modified-Since'] = lastModified;
      debug('added "If-Modified-Since" request header: %o', lastModified);
    }

    var etag = cache.headers.etag;
    if (etag != null) {
      options.headers['If-None-Match'] = etag;
      debug('added "If-None-Match" request header: %o', etag);
    }
  }

  var req = mod.get(options);
  req.once('error', onerror);
  req.once('response', onresponse);

  // http.ClientRequest "error" event handler
  function onerror (err) {
    debug('http.ClientRequest "error" event: %o', err.stack || err);
    fn(err);
  }

  // http.ClientRequest "response" event handler
  function onresponse (res) {
    var code = res.statusCode;

    // assign a Date to this response for the "Cache-Control" delta calculation
    res.date = new Date();
    res.parsed = parsed;

    debug('got %o response status code', code);

    // any 2xx response is a "success" code
    var type = (code / 100 | 0);

    // check for a 3xx "redirect" status code
    var location = res.headers.location;
    if (3 == type && location) {
      if (!opts.redirects) opts.redirects = [];
      var redirects = opts.redirects;

      if (redirects.length < maxRedirects) {
        debug('got a "redirect" status code with Location: %o', location);

        // flush this response - we're not going to use it
        res.resume();

        // hang on to this Response object for the "redirects" Array
        redirects.push(res);

        var newUri = url.resolve(parsed, location);
        debug('resolved redirect URL: %o', newUri);

        var left = maxRedirects - redirects.length;
        debug('%o more redirects allowed after this one', left);

        // check if redirecting to a different protocol
        var parsedUrl = url.parse(newUri);
        if (parsedUrl.protocol !== parsed.protocol) {
          opts.http = parsedUrl.protocol === 'https:' ? https : undefined;
        }

        return get(parsedUrl, opts, fn);
      }
    }

    // if we didn't get a 2xx "success" status code, then create an Error object
    if (2 != type) {
      var err;
      if (304 == code) {
        err = new NotModifiedError();
      } else if (404 == code) {
        err = new NotFoundError();
      } else {
        // other HTTP-level error
        var message = http.STATUS_CODES[code];
        err = new Error(message);
        err.statusCode = code;
        err.code = code;
      }

      res.resume();
      return fn(err);
    }

    if (opts.redirects) {
      // store a reference to the "redirects" Array on the Response object so that
      // they can be inspected during a subsequent call to GET the same URI
      res.redirects = opts.redirects;
    }

    fn(null, res);
  }
}

/**
 * Returns `true` if the provided cache's "freshness" is valid. That is, either
 * the Cache-Control header or Expires header values are still within the allowed
 * time period.
 *
 * @return {Boolean}
 * @api private
 */

function isFresh (cache) {
  var cacheControl = cache.headers['cache-control'];
  var expires = cache.headers.expires;
  var fresh;

  if (cacheControl) {
    // for Cache-Control rules, see: http://www.mnot.net/cache_docs/#CACHE-CONTROL
    debug('Cache-Control: %o', cacheControl);

    var parts = cacheControl.split(/,\s*?\b/);
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      var subparts = part.split('=');
      var name = subparts[0];
      switch (name) {
        case 'max-age':
          var val = +subparts[1];
          expires = new Date(+cache.date + (val * 1000));
          fresh = new Date() < expires;
          if (fresh) debug('cache is "fresh" due to previous %o Cache-Control param', part);
          return fresh;
        case 'must-revalidate':
          // XXX: what we supposed to do here?
          break;
        case 'no-cache':
        case 'no-store':
          debug('cache is "stale" due to explicit %o Cache-Control param', name);
          return false;
      }
    }

  } else if (expires) {
    // for Expires rules, see: http://www.mnot.net/cache_docs/#EXPIRES
    debug('Expires: %o', expires);

    fresh = new Date() < new Date(expires);
    if (fresh) debug('cache is "fresh" due to previous Expires response header');
    return fresh;
  }

  return false;
}

/**
 * Attempts to return a previous Response object from a previous GET call to the
 * same URI.
 *
 * @api private
 */

function getCache (parsed, cache) {
  if (!cache) return;
  var href = parsed.href;
  if (cache.parsed.href == href) {
    return cache;
  }
  var redirects = cache.redirects;
  if (redirects) {
    for (var i = 0; i < redirects.length; i++) {
      var c = getCache(parsed, redirects[i]);
      if (c) return c;
    }
  }
}

}, function(modId) { var map = {"http":1654652886946,"https":1654652886947,"./notfound":1654652886944,"./notmodified":1654652886942}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652886947, function(require, module, exports) {

/**
 * Module dependencies.
 */

var http = require('./http');
var https = require('https');

/**
 * Module exports.
 */

module.exports = get;

/**
 * Returns a Readable stream from an "https:" URI.
 *
 * @api protected
 */

function get (parsed, opts, fn) {
  opts.http = https;
  http(parsed, opts, fn);
}

}, function(modId) { var map = {"./http":1654652886946,"https":1654652886947}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1654652886940);
})()
//miniprogram-npm-outsideDeps=["url","debug","crypto","readable-stream","data-uri-to-buffer","util","fs","file-uri-to-path","path","extend"]
//# sourceMappingURL=index.js.map