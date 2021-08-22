var capacitorDevice = (function (exports, core) {
    'use strict';

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

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}, capacitorExports));
//# sourceMappingURL=plugin.js.map
