'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const Filesystem = core.registerPlugin('FileServer', {
    web: () => Promise.resolve().then(function () { return web; }).then(m => new m.FilesystemWeb()),
});

class FilesystemWeb extends core.WebPlugin {
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FilesystemWeb: FilesystemWeb
});

exports.Filesystem = Filesystem;
//# sourceMappingURL=plugin.cjs.js.map
