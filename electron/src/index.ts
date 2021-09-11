import {
    appendFile,
    copyFile,
    mkdir,
    mkdirSync,
    readdir,
    readdirSync,
    readFile,
    rename,
    rmdir,
    stat,
    unlink,
    writeFile,
} from 'fs';
import { homedir, platform } from 'os';
import { dirname, join, sep } from 'path';

import type {
    AppendFileOptions,
    CopyOptions,
    DeleteFileOptions,
    FilesystemPlugin,
    GetUriOptions,
    GetUriResult,
    MkdirOptions,
    ReaddirOptions,
    ReaddirResult,
    ReadFileOptions,
    ReadFileResult,
    RenameOptions,
    RmdirOptions,
    StatOptions,
    StatResult,
    WriteFileOptions,
    WriteFileResult,
} from '../../src/definitions';

export class Filesystem implements FilesystemPlugin {

    fileLocations: { [key: string]: string } = null;

    constructor() {

        this.fileLocations = { DRIVE_ROOT: '', DOCUMENTS: '' };

        if (platform() == "win32") {
            this.fileLocations["DRIVE_ROOT"] = process.cwd().split(sep)[0];
        } else {
            this.fileLocations["DRIVE_ROOT"] = '/';
        }
        this.fileLocations['DOCUMENTS'] = join(homedir(), `Documents`) + sep;
    }

    readFile(options: ReadFileOptions): Promise<ReadFileResult> {
        return new Promise<ReadFileResult>((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            readFile(lookupPath, options.encoding || 'binary', (err: any, data: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({ data: options.encoding ? data : Buffer.from(data, 'binary').toString('base64') });
            });
        });
    }

    writeFile(options: WriteFileOptions): Promise<WriteFileResult> {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            let data: (Buffer | string) = options.data;
            if (!options.encoding) {
                const base64Data = options.data.indexOf(',') >= 0 ? options.data.split(',')[1] : options.data;
                data = Buffer.from(base64Data, 'base64');
            }
            const dstDirectory = dirname(lookupPath);
            stat(dstDirectory, (err: any) => {
                if (err) {
                    const doRecursive = options.recursive;
                    if (doRecursive) {
                        mkdirSync(dstDirectory, { recursive: doRecursive });
                    }
                }
                writeFile(lookupPath, data, options.encoding || 'binary', (err: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ uri: lookupPath });
                });
            });
        });
    }

    appendFile(options: AppendFileOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            let data: (Buffer | string) = options.data;
            if (!options.encoding) {
                const base64Data = options.data.indexOf(',') >= 0 ? options.data.split(',')[1] : options.data;
                data = Buffer.from(base64Data, 'base64');
            }
            appendFile(lookupPath, data, options.encoding || 'binary', (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    deleteFile(options: DeleteFileOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} directory is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            unlink(lookupPath, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    mkdir(options: MkdirOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            const doRecursive = options.recursive;
            mkdir(lookupPath, { recursive: doRecursive }, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    rmdir(options: RmdirOptions): Promise<void> {
        let { path, directory, recursive } = options;

        if (Object.keys(this.fileLocations).indexOf(directory) === -1)
            return Promise.reject(`${directory} is currently not supported in the Electron implementation.`);

        return this.stat({ path, directory })
            .then((stat) => {
                if (stat.type === 'directory') {
                    return this.readdir({ path, directory })
                        .then((readDirResult) => {
                            if (readDirResult.files.length !== 0 && !recursive) {
                                return Promise.reject(`${path} is not empty.`);
                            }

                            if (!readDirResult.files.length) {
                                return new Promise((resolve, reject) => {
                                    let lookupPath = this.fileLocations[directory] + path;

                                    rmdir(lookupPath, (err: any) => {
                                        if (err) {
                                            reject(err);
                                            return;
                                        }

                                        resolve();
                                    });
                                });
                            } else {
                                return Promise.all(readDirResult.files.map((f) => {
                                    return this.rmdir({ path: join(path, f), directory, recursive });
                                }))
                                    .then(() => {
                                        return this.rmdir({ path, directory, recursive });
                                    });
                            }
                        });
                } else {
                    return this.deleteFile({ path, directory });
                }
            });
    }

    readdir(options: ReaddirOptions): Promise<ReaddirResult> {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            readdir(lookupPath, (err: any, files: string[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({ files });
            })
        });
    }

    getUri(options: GetUriOptions): Promise<GetUriResult> {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} directory is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            resolve({ uri: lookupPath });
        });
    };

    stat(options: StatOptions): Promise<StatResult> {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            stat(lookupPath, (err: any, stats: any) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                    type: (stats.isDirectory() ? 'directory' : (stats.isFile() ? 'file' : 'Not available')),
                    size: stats.size,
                    ctime: stats.ctimeMs,
                    mtime: stats.mtimeMs,
                    uri: lookupPath
                });
            });
        });
    }

    private _copy(options: CopyOptions, doRename: boolean = false): Promise<void> {
        const copyRecursively = (src: string, dst: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                stat(src, (err: any, stats: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (stats.isDirectory()) {
                        mkdir(dst, (err: any) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            const files = readdirSync(src);
                            Promise.all(
                                files.map(
                                    (file: string) =>
                                        copyRecursively(src + sep + file, dst + sep + file)
                                )
                            )
                                .then(() => resolve())
                                .catch(reject);
                            return;
                        });

                        return;
                    }

                    const dstParent = dirname(dst).split(sep).pop();
                    stat(dstParent, (err: any) => {
                        if (err) {
                            mkdirSync(dstParent);
                        }

                        copyFile(src, dst, (err: any) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve();
                        });
                    });
                });
            });
        };

        return new Promise((resolve, reject) => {
            if (!options.from || !options.to) {
                reject('Both to and from must be supplied');
                return;
            }

            if (!options.toDirectory) {
                options.toDirectory = options.directory;
            }

            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1) {
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
                return;
            }

            if (Object.keys(this.fileLocations).indexOf(options.toDirectory) === -1) {
                reject(`${options.toDirectory} is currently not supported in the Electron implementation.`);
                return;
            }

            const fromPath = this.fileLocations[options.directory] + options.from;
            const toPath = this.fileLocations[options.toDirectory] + options.to;

            if (doRename) {
                rename(fromPath, toPath, (err: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            } else {
                copyRecursively(fromPath, toPath)
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    }

    copy(options: CopyOptions): Promise<void> {
        return this._copy(options, false);
    }

    rename(options: RenameOptions): Promise<void> {
        return this._copy(options, true);
    }

    async checkPermissions(): Promise<any> {
        return null;
    }

    async requestPermissions(): Promise<any> {
        return null;
    }
}
