module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1654652887044, function(require, module, exports) {


/**
 * Module dependencies.
 */

var url = require('url');
var LRU = require('lru-cache');
var Agent = require('agent-base');
var inherits = require('util').inherits;
var debug = require('debug')('proxy-agent');
var getProxyForUrl = require('proxy-from-env').getProxyForUrl;

var http = require('http');
var https = require('https');
var PacProxyAgent = require('pac-proxy-agent');
var HttpProxyAgent = require('http-proxy-agent');
var HttpsProxyAgent = require('https-proxy-agent');
var SocksProxyAgent = require('socks-proxy-agent');

/**
 * Module exports.
 */

exports = module.exports = ProxyAgent;

/**
 * Number of `http.Agent` instances to cache.
 *
 * This value was arbitrarily chosen... a better
 * value could be conceived with some benchmarks.
 */

var cacheSize = 20;

/**
 * Cache for `http.Agent` instances.
 */

exports.cache = new LRU(cacheSize);

/**
 * Built-in proxy types.
 */

exports.proxies = Object.create(null);
exports.proxies.http = httpOrHttpsProxy;
exports.proxies.https = httpOrHttpsProxy;
exports.proxies.socks = SocksProxyAgent;
exports.proxies.socks4 = SocksProxyAgent;
exports.proxies.socks4a = SocksProxyAgent;
exports.proxies.socks5 = SocksProxyAgent;
exports.proxies.socks5h = SocksProxyAgent;

PacProxyAgent.protocols.forEach(function (protocol) {
  exports.proxies['pac+' + protocol] = PacProxyAgent;
});

function httpOrHttps(opts, secureEndpoint) {
  if (secureEndpoint) {
    // HTTPS
    return https.globalAgent;
  } else {
    // HTTP
    return http.globalAgent;
  }
}

function httpOrHttpsProxy(opts, secureEndpoint) {
  if (secureEndpoint) {
    // HTTPS
    return new HttpsProxyAgent(opts);
  } else {
    // HTTP
    return new HttpProxyAgent(opts);
  }
}

function mapOptsToProxy(opts) {
  // NO_PROXY case
  if (!opts) {
    return {
      uri: 'no proxy',
      fn: httpOrHttps
    };
  }

  if ('string' == typeof opts) opts = url.parse(opts);

  var proxies;
  if (opts.proxies) {
    proxies = Object.assign({}, exports.proxies, opts.proxies);
  } else {
    proxies = exports.proxies;
  }

  // get the requested proxy "protocol"
  var protocol = opts.protocol;
  if (!protocol) {
    throw new TypeError('You must specify a "protocol" for the ' +
                        'proxy type (' + Object.keys(proxies).join(', ') + ')');
  }

  // strip the trailing ":" if present
  if (':' == protocol[protocol.length - 1]) {
    protocol = protocol.substring(0, protocol.length - 1);
  }

  // get the proxy `http.Agent` creation function
  var proxyFn = proxies[protocol];
  if ('function' != typeof proxyFn) {
    throw new TypeError('unsupported proxy protocol: "' + protocol + '"');
  }

  // format the proxy info back into a URI, since an opts object
  // could have been passed in originally. This generated URI is used
  // as part of the "key" for the LRU cache
  return {
    opts: opts,
    uri: url.format({
      protocol: protocol + ':',
      slashes: true,
      auth: opts.auth,
      hostname: opts.hostname || opts.host,
      port: opts.port
    }),
    fn: proxyFn,
  }
}

/**
 * Attempts to get an `http.Agent` instance based off of the given proxy URI
 * information, and the `secure` flag.
 *
 * An LRU cache is used, to prevent unnecessary creation of proxy
 * `http.Agent` instances.
 *
 * @param {String} uri proxy url
 * @param {Boolean} secure true if this is for an HTTPS request, false for HTTP
 * @return {http.Agent}
 * @api public
 */

function ProxyAgent (opts) {
  if (!(this instanceof ProxyAgent)) return new ProxyAgent(opts);
  debug('creating new ProxyAgent instance: %o', opts);
  Agent.call(this, connect);

  if (opts) {
    var proxy = mapOptsToProxy(opts);
    this.proxy = proxy.opts;
    this.proxyUri = proxy.uri;
    this.proxyFn = proxy.fn;
  }
}
inherits(ProxyAgent, Agent);

/**
 *
 */

function connect (req, opts, fn) {
  var proxyOpts = this.proxy;
  var proxyUri = this.proxyUri;
  var proxyFn = this.proxyFn;

  // if we did not instantiate with a proxy, set one per request
  if (!proxyOpts) {
    var urlOpts = getProxyForUrl(opts);
    var proxy = mapOptsToProxy(urlOpts, opts);
    proxyOpts = proxy.opts;
    proxyUri = proxy.uri;
    proxyFn = proxy.fn;
  }

  // create the "key" for the LRU cache
  var key = proxyUri;
  if (opts.secureEndpoint) key += ' secure';

  // attempt to get a cached `http.Agent` instance first
  var agent = exports.cache.get(key);
  if (!agent) {
    // get an `http.Agent` instance from protocol-specific agent function
    agent = proxyFn(proxyOpts, opts.secureEndpoint);
    if (agent) {
      exports.cache.set(key, agent);
    }
  } else {
    debug('cache hit with key: %o', key);
  }

  if (!proxyOpts) {
    agent.addRequest(req, opts);
  } else {
    // XXX: agent.callback() is an agent-base-ism
    agent.callback(req, opts, fn);
  }
}

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1654652887044);
})()
//miniprogram-npm-outsideDeps=["url","lru-cache","agent-base","util","debug","proxy-from-env","http","https","pac-proxy-agent","http-proxy-agent","https-proxy-agent","socks-proxy-agent"]
//# sourceMappingURL=index.js.map