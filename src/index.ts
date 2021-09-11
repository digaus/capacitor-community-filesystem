import { registerPlugin } from '@capacitor/core';
import type { FilesystemPlugin } from './definitions';

const Filesystem: FilesystemPlugin = registerPlugin<FilesystemPlugin>('Filesystem', {
    electron: () => (window as any).CapacitorCustomPlatform.plugins.Filesystem,
});
export * from './definitions';

export { Filesystem };