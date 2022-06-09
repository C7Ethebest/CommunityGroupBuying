module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1654652887018, function(require, module, exports) {


/**
 * Module dependencies.
 */

var co = require('co');
var vm = require('vm');
var parse = require('url').parse;
var thunkify = require('thunkify');
var degenerator = require('degenerator');

/**
 * Built-in PAC functions.
 */

var dateRange = require('./dateRange');
var dnsDomainIs = require('./dnsDomainIs');
var dnsDomainLevels = require('./dnsDomainLevels');
var dnsResolve = require('./dnsResolve');
var isInNet = require('./isInNet');
var isPlainHostName = require('./isPlainHostName');
var isResolvable = require('./isResolvable');
var localHostOrDomainIs = require('./localHostOrDomainIs');
var myIpAddress = require('./myIpAddress');
var shExpMatch = require('./shExpMatch');
var timeRange = require('./timeRange');
var weekdayRange = require('./weekdayRange');

/**
 * Module exports.
 */

module.exports = generate;

/**
 * Returns an asyncronous `FindProxyForURL` function from the
 * given JS string (from a PAC file).
 *
 * @param {String} str JS string
 * @param {Object} opts optional "options" object
 * @return {Function} async resolver function
 */

function generate (_str, opts) {
  var i;
  var str = String(_str)

  // the sandbox to use for the vm
  var sandbox = {
    dateRange: dateRange,
    dnsDomainIs: dnsDomainIs,
    dnsDomainLevels: dnsDomainLevels,
    dnsResolve: dnsResolve,
    isInNet: isInNet,
    isPlainHostName: isPlainHostName,
    isResolvable: isResolvable,
    localHostOrDomainIs: localHostOrDomainIs,
    myIpAddress: myIpAddress,
    shExpMatch: shExpMatch,
    timeRange: timeRange,
    weekdayRange: weekdayRange
  };

  // copy the properties from the user-provided `sandbox` onto ours
  if (opts && opts.sandbox) {
    for (i in opts.sandbox) {
      sandbox[i] = opts.sandbox[i];
    }
  }

  // construct the array of async function names to add `yield` calls to.
  // user-provided async functions added to the `sandbox` must have an
  // `async = true` property set on the function instance
  var names = [];
  for (i in sandbox) {
    if (sandbox[i].async) {
      names.push(i);
      sandbox[i] = thunkify(sandbox[i]);
    }
  }
  //console.log(names);

  // convert the JS FindProxyForURL function into a generator function
  var js = degenerator(str, names);

  // filename of the pac file for the vm
  var filename = (opts && opts.filename) || 'proxy.pac';

  // evaluate the JS string and extract the FindProxyForURL generator function
  var fn = vm.runInNewContext(js + ';FindProxyForURL', sandbox, filename);
  if ('function' != typeof fn) {
    throw new TypeError('PAC file JavaScript contents must define a `FindProxyForURL` function');
  }

  // return the async resolver function
  var resolver = co.wrap(fn);

  return function FindProxyForURL (url, _host, _callback) {
    let host
    let callback
    switch (arguments.length) {
      case 3:
        host = _host
        callback = _callback
        break;
      case 2:
        if (typeof _host === 'function') {
          callback = _host
        } else {
          host = _host
        }
        break;
    }

    if (!host) {
      host = parse(url).hostname;
    }

    const promise = resolver(url, host, callback);

    if (typeof callback === 'function') {
      toCallback(promise, callback)
    } else {
      return promise
    }
  };
}

function toCallback (promise, callback) {
  let called = false
  function resolve(rtn) {
    if (called) return
    called = true
    callback(null, rtn)
  }
  function reject(err) {
    if (called) return
    called = true
    callback(err)
  }
  promise.then(resolve, reject)
}

}, function(modId) {var map = {"./dateRange":1654652887019,"./dnsDomainIs":1654652887020,"./dnsDomainLevels":1654652887021,"./dnsResolve":1654652887022,"./isInNet":1654652887023,"./isPlainHostName":1654652887024,"./isResolvable":1654652887025,"./localHostOrDomainIs":1654652887026,"./myIpAddress":1654652887027,"./shExpMatch":1654652887028,"./timeRange":1654652887029,"./weekdayRange":1654652887030}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887019, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = dateRange;

/**
 * If only a single value is specified (from each category: day, month, year), the
 * function returns a true value only on days that match that specification. If
 * both values are specified, the result is true between those times, including
 * bounds.
 *
 * Even though the examples don't show, the "GMT" parameter can be specified
 * in any of the 9 different call profiles, always as the last parameter.
 *
 * Examples:
 *
 * ``` js
 * dateRange(1)
 * true on the first day of each month, local timezone.
 *
 * dateRange(1, "GMT")
 * true on the first day of each month, GMT timezone.
 *
 * dateRange(1, 15)
 * true on the first half of each month.
 *
 * dateRange(24, "DEC")
 * true on 24th of December each year.
 *
 * dateRange(24, "DEC", 1995)
 * true on 24th of December, 1995.
 *
 * dateRange("JAN", "MAR")
 * true on the first quarter of the year.
 *
 * dateRange(1, "JUN", 15, "AUG")
 * true from June 1st until August 15th, each year (including June 1st and August
 * 15th).
 *
 * dateRange(1, "JUN", 15, 1995, "AUG", 1995)
 * true from June 1st, 1995, until August 15th, same year.
 *
 * dateRange("OCT", 1995, "MAR", 1996)
 * true from October 1995 until March 1996 (including the entire month of October
 * 1995 and March 1996).
 *
 * dateRange(1995)
 * true during the entire year 1995.
 *
 * dateRange(1995, 1997)
 * true from beginning of year 1995 until the end of year 1997.
 * ```
 *
 * dateRange(day)
 * dateRange(day1, day2)
 * dateRange(mon)
 * dateRange(month1, month2)
 * dateRange(year)
 * dateRange(year1, year2)
 * dateRange(day1, month1, day2, month2)
 * dateRange(month1, year1, month2, year2)
 * dateRange(day1, month1, year1, day2, month2, year2)
 * dateRange(day1, month1, year1, day2, month2, year2, gmt)
 *
 * @param {String} day is the day of month between 1 and 31 (as an integer).
 * @param {String} month is one of the month strings: JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC
 * @param {String} year is the full year number, for example 1995 (but not 95). Integer.
 * @param {String} gmt is either the string "GMT", which makes time comparison occur in GMT timezone; if left unspecified, times are taken to be in the local timezone.
 * @return {Boolean}
 */

function dateRange () {
  // TODO: implement me!
  return false;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887020, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = dnsDomainIs;

/**
 * Returns true iff the domain of hostname matches.
 *
 * Examples:
 *
 * ``` js
 * dnsDomainIs("www.netscape.com", ".netscape.com")
 *   // is true.
 *
 * dnsDomainIs("www", ".netscape.com")
 *   // is false.
 *
 * dnsDomainIs("www.mcom.com", ".netscape.com")
 *   // is false.
 * ```
 *
 *
 * @param {String} host is the hostname from the URL.
 * @param {String} domain is the domain name to test the hostname against.
 * @return {Boolean} true iff the domain of the hostname matches.
 */

function dnsDomainIs (host, domain) {
  host = String(host);
  domain = String(domain);
  return host.substr(domain.length * -1) === domain;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887021, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = dnsDomainLevels;

/**
 * Returns the number (integer) of DNS domain levels (number of dots) in the
 * hostname.
 *
 * Examples:
 *
 * ``` js
 * dnsDomainLevels("www")
 *   // returns 0.
 * dnsDomainLevels("www.netscape.com")
 *   // returns 2.
 * ```
 *
 * @param {String} host is the hostname from the URL.
 * @return {Number} number of domain levels
 */

function dnsDomainLevels (host) {
  var match = String(host).match(/\./g);
  var levels = 0;
  if (match) {
    levels = match.length;
  }
  return levels;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887022, function(require, module, exports) {

/**
 * Module dependencies.
 */

var dns = require('dns');

/**
 * Module exports.
 */

module.exports = dnsResolve;

dnsResolve.async = true;

/**
 * Resolves the given DNS hostname into an IP address, and returns it in the dot
 * separated format as a string.
 *
 * Example:
 *
 * ``` js
 * dnsResolve("home.netscape.com")
 *   // returns the string "198.95.249.79".
 * ```
 *
 * @param {String} host hostname to resolve
 * @return {String} resolved IP address
 */

function dnsResolve (host, fn) {
  var family = 4;
  dns.lookup(host, family, function (err, ip) {
    if (err) return fn(err);
    fn(null, ip || '127.0.0.1');
  });
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887023, function(require, module, exports) {

/**
 * Module dependencies.
 */

var dns = require('dns');
var Netmask = require('netmask').Netmask;

/**
 * Module exports.
 */

module.exports = isInNet;

isInNet.async = true;

/**
 * True iff the IP address of the host matches the specified IP address pattern.
 *
 * Pattern and mask specification is done the same way as for SOCKS configuration.
 *
 * Examples:
 *
 * ``` js
 * isInNet(host, "198.95.249.79", "255.255.255.255")
 *   // is true iff the IP address of host matches exactly 198.95.249.79.
 *
 * isInNet(host, "198.95.0.0", "255.255.0.0")
 *   // is true iff the IP address of the host matches 198.95.*.*.
 * ```
 *
 * @param {String} host a DNS hostname, or IP address. If a hostname is passed,
 *   it will be resoved into an IP address by this function.
 * @param {String} pattern an IP address pattern in the dot-separated format mask.
 * @param {String} mask for the IP address pattern informing which parts of the
 *   IP address should be matched against. 0 means ignore, 255 means match.
 * @return {Boolean}
 */

function isInNet (host, pattern, mask, fn) {
  var family = 4;
  dns.lookup(host, family, function (err, ip) {
    if (err) return fn(err);
    if (!ip) ip = '127.0.0.1';
    var netmask = new Netmask(pattern, mask);
    fn(null, netmask.contains(ip));
  });
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887024, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = isPlainHostName;

/**
 * True iff there is no domain name in the hostname (no dots).
 *
 * Examples:
 *
 * ``` js
 * isPlainHostName("www")
 *   // is true.
 *
 * isPlainHostName("www.netscape.com")
 *   // is false.
 * ```
 *
 * @param {String} host The hostname from the URL (excluding port number).
 * @return {Boolean}
 */

function isPlainHostName (host) {
  return !(/\./.test(host));
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887025, function(require, module, exports) {

/**
 * Module dependencies.
 */

var dns = require('dns');

/**
 * Module exports.
 */

module.exports = isResolvable;

isResolvable.async = true;

/**
 * Tries to resolve the hostname. Returns true if succeeds.
 *
 * @param {String} host is the hostname from the URL.
 * @return {Boolean}
 */

function isResolvable (host, fn) {
  var family = 4;
  dns.lookup(host, family, function (err, ip) {
    fn(null, !err);
  });
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887026, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = localHostOrDomainIs;

/**
 * Is true if the hostname matches exactly the specified hostname, or if there is
 * no domain name part in the hostname, but the unqualified hostname matches.
 *
 * Examples:
 *
 * ``` js
 * localHostOrDomainIs("www.netscape.com", "www.netscape.com")
 *   // is true (exact match).
 *
 * localHostOrDomainIs("www", "www.netscape.com")
 *   // is true (hostname match, domain not specified).
 *
 * localHostOrDomainIs("www.mcom.com", "www.netscape.com")
 *   // is false (domain name mismatch).
 *
 * localHostOrDomainIs("home.netscape.com", "www.netscape.com")
 *   // is false (hostname mismatch).
 * ```
 *
 * @param {String} host the hostname from the URL.
 * @param {String} hostdom fully qualified hostname to match against.
 * @return {Boolean}
 */

function localHostOrDomainIs (host, hostdom) {
  var parts = String(host).split('.');
  var domparts = String(hostdom).split('.');
  var matches = true;

  for (var i = 0; i < parts.length; i++) {
    if (parts[i] !== domparts[i]) {
      matches = false;
      break;
    }
  }

  return matches;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887027, function(require, module, exports) {

/**
 * Module dependencies.
 */

var net = require('net');
var ip = require('ip');

/**
 * Module exports.
 */

module.exports = myIpAddress;

myIpAddress.async = true;

/**
 * Returns the IP address of the host that the Navigator is running on, as
 * a string in the dot-separated integer format.
 *
 * Example:
 *
 * ``` js
 * myIpAddress()
 *   // would return the string "198.95.249.79" if you were running the
 *   // Navigator on that host.
 * ```
 *
 * @return {String} external IP address
 */

function myIpAddress (fn) {
  // 8.8.8.8:53 is "Google Public DNS":
  // https://developers.google.com/speed/public-dns/
  var socket = net.connect({ host: '8.8.8.8', port: 53 });
  socket.once('error', function(err) {
    // if we fail to access Google DNS (as in firewall blocks access), 
    // fallback to querying IP locally
    fn(null, ip.address());
  });
  socket.once('connect', function () {
    socket.removeListener('error', fn);
    var ip = socket.address().address;
    socket.destroy();
    fn(null, ip);
  });
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887028, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = shExpMatch;

/**
 * Returns true if the string matches the specified shell
 * expression.
 *
 * Actually, currently the patterns are shell expressions,
 * not regular expressions.
 *
 * Examples:
 *
 * ``` js
 * shExpMatch("http://home.netscape.com/people/ari/index.html", "*\/ari/*")
 *   // is true.
 *
 * shExpMatch("http://home.netscape.com/people/montulli/index.html", "*\/ari/*")
 *   // is false.
 * ```
 *
 * @param {String} str is any string to compare (e.g. the URL, or the hostname).
 * @param {String} shexp is a shell expression to compare against.
 * @return {Boolean} true if the string matches the shell expression.
 */

function shExpMatch (str, shexp) {
  var re = toRegExp(shexp);
  return re.test(str);
}

/**
 * Converts a "shell expression" to a JavaScript RegExp.
 *
 * @api private
 */

function toRegExp (str) {
  str = String(str)
    .replace(/\?/g, '.')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + str + '$');
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887029, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = timeRange;

/**
 * True during (or between) the specified time(s).
 *
 * Even though the examples don't show it, this parameter may be present in
 * each of the different parameter profiles, always as the last parameter.
 *
 *
 * Examples:
 *
 * ``` js
 * timerange(12)
 * true from noon to 1pm.
 *
 * timerange(12, 13)
 * same as above.
 *
 * timerange(12, "GMT")
 * true from noon to 1pm, in GMT timezone.
 *
 * timerange(9, 17)
 * true from 9am to 5pm.
 *
 * timerange(8, 30, 17, 00)
 * true from 8:30am to 5:00pm.
 *
 * timerange(0, 0, 0, 0, 0, 30)
 * true between midnight and 30 seconds past midnight.
 * ```
 *
 * timeRange(hour)
 * timeRange(hour1, hour2)
 * timeRange(hour1, min1, hour2, min2)
 * timeRange(hour1, min1, sec1, hour2, min2, sec2)
 * timeRange(hour1, min1, sec1, hour2, min2, sec2, gmt)
 *
 * @param {String} hour is the hour from 0 to 23. (0 is midnight, 23 is 11 pm.)
 * @param {String} min minutes from 0 to 59.
 * @param {String} sec seconds from 0 to 59.
 * @param {String} gmt either the string "GMT" for GMT timezone, or not specified, for local timezone.
 * @return {Boolean}
 */

function timeRange () {
  var args        = Array.prototype.slice.call(arguments),
      lastArg     = args.pop(),
      useGMTzone  = (lastArg == "GMT"),
      currentDate = new Date();

  if (!useGMTzone) { args.push(lastArg); }

  var noOfArgs    = args.length,
      result      = false,
      numericArgs = args.map(function(n) { return parseInt(n) });

  // timeRange(hour)
  if (noOfArgs == 1) {
    result = getCurrentHour(useGMTzone, currentDate) == numericArgs[0];

  // timeRange(hour1, hour2)
  } else if (noOfArgs == 2) {
    var currentHour = getCurrentHour(useGMTzone, currentDate);
    result = (numericArgs[0] <= currentHour) && (currentHour < numericArgs[1]);

  // timeRange(hour1, min1, hour2, min2)
  } else if (noOfArgs == 4) {
    result =
      valueInRange(
        secondsElapsedToday(numericArgs[0], numericArgs[1], 0),
        secondsElapsedToday(getCurrentHour(useGMTzone, currentDate), getCurrentMinute(useGMTzone, currentDate), 0),
        secondsElapsedToday(numericArgs[2], numericArgs[3], 59)
      );

  // timeRange(hour1, min1, sec1, hour2, min2, sec2)
  } else if (noOfArgs == 6) {
    result =
      valueInRange(
        secondsElapsedToday(numericArgs[0], numericArgs[1], numericArgs[2]),
        secondsElapsedToday(
          getCurrentHour(useGMTzone, currentDate),
          getCurrentMinute(useGMTzone, currentDate),
          getCurrentSecond(useGMTzone, currentDate)
        ),
        secondsElapsedToday(numericArgs[3], numericArgs[4], numericArgs[5])
      );
  }

  return result;
}

function secondsElapsedToday (hh, mm, ss) {
  return ((hh*3600) + (mm*60) + ss);
}

function getCurrentHour (gmt, currentDate) {
  return (gmt ? currentDate.getUTCHours() : currentDate.getHours());
}

function getCurrentMinute (gmt, currentDate) {
  return (gmt ? currentDate.getUTCMinutes() : currentDate.getMinutes());
}

function getCurrentSecond (gmt, currentDate) {
  return (gmt ? currentDate.getUTCSeconds() : currentDate.getSeconds());
}

// start <= value <= finish
function valueInRange (start, value, finish) {
  return (start <= value) && (value <= finish);
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1654652887030, function(require, module, exports) {

/**
 * Module exports.
 */

module.exports = weekdayRange;

/**
 * Only the first parameter is mandatory. Either the second, the third, or both
 * may be left out.
 *
 * If only one parameter is present, the function yeilds a true value on the
 * weekday that the parameter represents. If the string "GMT" is specified as
 * a second parameter, times are taken to be in GMT, otherwise in local timezone.
 *
 * If both wd1 and wd1 are defined, the condition is true if the current weekday
 * is in between those two weekdays. Bounds are inclusive. If the "GMT" parameter
 * is specified, times are taken to be in GMT, otherwise the local timezone is
 * used.
 *
 * Valid "weekday strings" are:
 *
 *     SUN MON TUE WED THU FRI SAT
 *
 * Examples:
 *
 * ``` js
 * weekdayRange("MON", "FRI")
 * true Monday trhough Friday (local timezone).
 *
 * weekdayRange("MON", "FRI", "GMT")
 * same as above, but GMT timezone.
 *
 * weekdayRange("SAT")
 * true on Saturdays local time.
 *
 * weekdayRange("SAT", "GMT")
 * true on Saturdays GMT time.
 *
 * weekdayRange("FRI", "MON")
 * true Friday through Monday (note, order does matter!).
 * ```
 *
 * 
 * @param {String} wd1 one of the weekday strings.
 * @param {String} wd2 one of the weekday strings.
 * @param {String} gmt is either the string: GMT or is left out.
 * @return {Boolean}
 */

const dayOrder = { "SUN": 0, "MON": 1, "TUE": 2, "WED": 3, "THU": 4, "FRI": 5, "SAT": 6 };

function weekdayRange (wd1, wd2, gmt) {

  var useGMTzone = (wd2 == "GMT" || gmt == "GMT"),
      todaysDay  = getTodaysDay(useGMTzone),
      wd1Index   = dayOrder[wd1] || -1,
      wd2Index   = dayOrder[wd2] || -1,
      result     = false;

  if (wd2Index < 0) {
    result = (todaysDay == wd1Index);
  } else {
    if (wd1Index <= wd2Index) {
      result = valueInRange(wd1Index, todaysDay, wd2Index);
    } else {
      result = valueInRange(wd1Index, todaysDay, 6) || valueInRange(0, todaysDay, wd2Index);
    }
  }
  return result;
}

function getTodaysDay (gmt) {
  return (gmt ? (new Date()).getUTCDay() : (new Date()).getDay());
}

// start <= value <= finish
function valueInRange (start, value, finish) {
  return (start <= value) && (value <= finish);
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1654652887018);
})()
//miniprogram-npm-outsideDeps=["co","vm","url","thunkify","degenerator","dns","netmask","net","ip"]
//# sourceMappingURL=index.js.map