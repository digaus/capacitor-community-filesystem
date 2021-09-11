'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var require$$0 = require('fs');
var require$$1 = require('os');
var require$$2 = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);

var src = {};

Object.defineProperty(src, "__esModule", { value: true });
const fs_1 = require$$0__default['default'];
const os_1 = require$$1__default['default'];
const path_1 = require$$2__default['default'];
class Filesystem {
    constructor() {
        this.fileLocations = null;
        this.fileLocations = { DRIVE_ROOT: '', DOCUMENTS: '' };
        if (os_1.platform() == "win32") {
            this.fileLocations["DRIVE_ROOT"] = process.cwd().split(path_1.sep)[0];
        }
        else {
            this.fileLocations["DRIVE_ROOT"] = '/';
        }
        this.fileLocations['DOCUMENTS'] = path_1.join(os_1.homedir(), `Documents`) + path_1.sep;
    }
    readFile(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            fs_1.readFile(lookupPath, options.encoding || 'binary', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ data: options.encoding ? data : Buffer.from(data, 'binary').toString('base64') });
            });
        });
    }
    writeFile(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            let data = options.data;
            if (!options.encoding) {
                const base64Data = options.data.indexOf(',') >= 0 ? options.data.split(',')[1] : options.data;
                data = Buffer.from(base64Data, 'base64');
            }
            const dstDirectory = path_1.dirname(lookupPath);
            fs_1.stat(dstDirectory, (err) => {
                if (err) {
                    const doRecursive = options.recursive;
                    if (doRecursive) {
                        fs_1.mkdirSync(dstDirectory, { recursive: doRecursive });
                    }
                }
                fs_1.writeFile(lookupPath, data, options.encoding || 'binary', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve({ uri: lookupPath });
                });
            });
        });
    }
    appendFile(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            let data = options.data;
            if (!options.encoding) {
                const base64Data = options.data.indexOf(',') >= 0 ? options.data.split(',')[1] : options.data;
                data = Buffer.from(base64Data, 'base64');
            }
            fs_1.appendFile(lookupPath, data, options.encoding || 'binary', (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    deleteFile(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} directory is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            fs_1.unlink(lookupPath, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    mkdir(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            const doRecursive = options.recursive;
            fs_1.mkdir(lookupPath, { recursive: doRecursive }, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    rmdir(options) {
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
                            fs_1.rmdir(lookupPath, (err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve();
                            });
                        });
                    }
                    else {
                        return Promise.all(readDirResult.files.map((f) => {
                            return this.rmdir({ path: path_1.join(path, f), directory, recursive });
                        }))
                            .then(() => {
                            return this.rmdir({ path, directory, recursive });
                        });
                    }
                });
            }
            else {
                return this.deleteFile({ path, directory });
            }
        });
    }
    readdir(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            fs_1.readdir(lookupPath, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ files });
            });
        });
    }
    getUri(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} directory is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            resolve({ uri: lookupPath });
        });
    }
    ;
    stat(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            fs_1.stat(lookupPath, (err, stats) => {
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
    _copy(options, doRename = false) {
        const copyRecursively = (src, dst) => {
            return new Promise((resolve, reject) => {
                fs_1.stat(src, (err, stats) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (stats.isDirectory()) {
                        fs_1.mkdir(dst, (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            const files = fs_1.readdirSync(src);
                            Promise.all(files.map((file) => copyRecursively(src + path_1.sep + file, dst + path_1.sep + file)))
                                .then(() => resolve())
                                .catch(reject);
                            return;
                        });
                        return;
                    }
                    const dstParent = path_1.dirname(dst).split(path_1.sep).pop();
                    fs_1.stat(dstParent, (err) => {
                        if (err) {
                            fs_1.mkdirSync(dstParent);
                        }
                        fs_1.copyFile(src, dst, (err) => {
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
                fs_1.rename(fromPath, toPath, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            }
            else {
                copyRecursively(fromPath, toPath)
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    }
    copy(options) {
        return this._copy(options, false);
    }
    rename(options) {
        return this._copy(options, true);
    }
    async checkPermissions() {
        return null;
    }
    async requestPermissions() {
        return null;
    }
}
var Filesystem_1 = src.Filesystem = Filesystem;

exports.Filesystem = Filesystem_1;
exports['default'] = src;
//# sourceMappingURL=plugin.js.map
