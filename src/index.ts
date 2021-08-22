import { registerPlugin } from '@capacitor/core';
import type { FilesystemPlugin } from './definitions';

const Filesystem: FilesystemPlugin = registerPlugin<FilesystemPlugin>('FileServer', {
    web: () => import('./web').then(m => new m.FilesystemWeb()),
});
export * from './definitions';

export { Filesystem };