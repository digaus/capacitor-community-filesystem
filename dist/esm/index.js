import { registerPlugin } from '@capacitor/core';
const Filesystem = registerPlugin('Filesystem', {
    electron: () => window.CapacitorCustomPlatform.plugins.Filesystem,
});
export * from './definitions';
export { Filesystem };
//# sourceMappingURL=index.js.map