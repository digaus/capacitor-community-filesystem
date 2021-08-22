'use strict';

var require$$0$1 = require('tslib');
var require$$0 = require('@capacitor/filesystem');
var require$$1 = require('path');
var require$$2 = require('os');
var require$$3 = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default$1 = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);
var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);
var require$$1__default = /*#__PURE__*/_interopDefaultLegacy(require$$1);
var require$$2__default = /*#__PURE__*/_interopDefaultLegacy(require$$2);
var require$$3__default = /*#__PURE__*/_interopDefaultLegacy(require$$3);

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var src = {};

var plugin = {};

Object.defineProperty(plugin, "__esModule", { value: true });
const filesystem_1 = require$$0__default['default'];
class Filesystem {
    constructor() {
        this.NodeFS = null;
        this.fileLocations = null;
        this.Path = null;
        this.fileLocations = { DRIVE_ROOT: '', DOCUMENTS: '' };
        let path = require$$1__default['default'];
        let os = require$$2__default['default'];
        if (os.platform == "win32") {
            this.fileLocations["DRIVE_ROOT"] = process.cwd().split(path.sep)[0];
        }
        else {
            this.fileLocations["DRIVE_ROOT"] = '/';
        }
        this.fileLocations[filesystem_1.Directory.Documents] = path.join(os.homedir(), `Documents`) + path.sep;
        this.NodeFS = require$$3__default['default'];
        this.Path = path;
    }
    readFile(options) {
        return new Promise((resolve, reject) => {
            if (Object.keys(this.fileLocations).indexOf(options.directory) === -1)
                reject(`${options.directory} is currently not supported in the Electron implementation.`);
            let lookupPath = this.fileLocations[options.directory] + options.path;
            this.NodeFS.readFile(lookupPath, options.encoding || 'binary', (err, data) => {
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
            const dstDirectory = this.Path.dirname(lookupPath);
            this.NodeFS.stat(dstDirectory, (err) => {
                if (err) {
                    const doRecursive = options.recursive;
                    if (doRecursive) {
                        this.NodeFS.mkdirSync(dstDirectory, { recursive: doRecursive });
                    }
                }
                this.NodeFS.writeFile(lookupPath, data, options.encoding || 'binary', (err) => {
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
            this.NodeFS.appendFile(lookupPath, data, options.encoding || 'binary', (err) => {
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
            this.NodeFS.unlink(lookupPath, (err) => {
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
            this.NodeFS.mkdir(lookupPath, { recursive: doRecursive }, (err) => {
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
                            this.NodeFS.rmdir(lookupPath, (err) => {
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
                            return this.rmdir({ path: this.Path.join(path, f), directory, recursive });
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
            this.NodeFS.readdir(lookupPath, (err, files) => {
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
            this.NodeFS.stat(lookupPath, (err, stats) => {
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
                this.NodeFS.stat(src, (err, stats) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    if (stats.isDirectory()) {
                        this.NodeFS.mkdir(dst, (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            const files = this.NodeFS.readdirSync(src);
                            Promise.all(files.map((file) => copyRecursively(src + this.Path.sep + file, dst + this.Path.sep + file)))
                                .then(() => resolve())
                                .catch(reject);
                            return;
                        });
                        return;
                    }
                    const dstParent = this.Path.dirname(dst).split(this.Path.sep).pop();
                    this.NodeFS.stat(dstParent, (err) => {
                        if (err) {
                            this.NodeFS.mkdirSync(dstParent);
                        }
                        this.NodeFS.copyFile(src, dst, (err) => {
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
                this.NodeFS.rename(fromPath, toPath, (err) => {
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
plugin.Filesystem = Filesystem;

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require$$0__default$1['default'];
tslib_1.__exportStar(plugin, exports);

}(src));

var index = /*@__PURE__*/getDefaultExportFromCjs(src);

module.exports = index;
//# sourceMappingURL=plugin.js.map
