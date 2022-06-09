module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1654652887126, function(require, module, exports) {

var os = require('os');
var semver = require('semver');

var nameMap = {
	'10.0': '10',
	'6.3': '8.1',
	'6.2': '8',
	'6.1': '7',
	'6.0': 'Vista',
	'5.1': 'XP',
	'5.0': '2000',
	'4.9': 'ME',
	'4.1': '98',
	'4.0': '95'
};

module.exports = function (release) {
	var verRe = /\d+\.\d+/;
	var version = verRe.exec(release || os.release());

	// workaround for Windows 10 on node < 3.1.0
	if (!release && process.platform === 'win32' &&
		semver.satisfies(process.version, '>=0.12.0 <3.1.0')) {
		try {
			version = verRe.exec(String(require('child_process').execSync('ver.exe', {timeout: 2000})));
		} catch (err) {}
	}

	if (release && !version) {
		throw new Error('`release` argument doesn\'t match `n.n`');
	}

	return nameMap[(version || [])[0]];
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1654652887126);
})()
//miniprogram-npm-outsideDeps=["os","semver","child_process"]
//# sourceMappingURL=index.js.map