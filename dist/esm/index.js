import { registerPlugin } from '@capacitor/core';
const Filesystem = registerPlugin('FileServer', {
    web: () => import('./web').then(m => new m.FilesystemWeb()),
});
export { Filesystem };
//# sourceMappingURL=index.js.map