'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@capacitor/core');

const Filesystem = core.registerPlugin('Filesystem', {
    electron: () => window.CapacitorCustomPlatform.plugins.Filesystem,
});

exports.Filesystem = Filesystem;
//# sourceMappingURL=plugin.cjs.js.map
