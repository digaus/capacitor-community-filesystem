var capacitorFilesystem = (function (exports, core) {
    'use strict';

    const Filesystem = core.registerPlugin('Filesystem', {
        electron: () => window.CapacitorCustomPlatform.plugins.Filesystem,
    });

    exports.Filesystem = Filesystem;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}, capacitorExports));
//# sourceMappingURL=plugin.js.map
