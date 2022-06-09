module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1654652887011, function(require, module, exports) {

var os = require('os');

var nameMap = {
	'15': 'El Capitan',
	'14': 'Yosemite',
	'13': 'Mavericks',
	'12': 'Mountain Lion',
	'11': 'Lion',
	'10': 'Snow Leopard',
	'9': 'Leopard',
	'8': 'Tiger',
	'7': 'Panther',
	'6': 'Jaguar',
	'5': 'Puma'
};

module.exports = function (release) {
	release = (release || os.release()).split('.')[0];
	return {
		name: nameMap[release],
		version: '10.' + (Number(release) - 4)
	};
};

}, function(modId) {var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1654652887011);
})()
//miniprogram-npm-outsideDeps=["os"]
//# sourceMappingURL=index.js.map