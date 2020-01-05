"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const path = require("path");
const fs = require("fs");
class VirtualDirectory {
    constructor(...physicalPaths) {
        this.physicalPaths = [];
        this._childDirectories = {};
        this._name = "";
        this._childFiles = {};
        if (!physicalPaths)
            throw errors_1.errors.argumentNull("physicalPaths");
        if (!Array.isArray(physicalPaths))
            throw errors_1.errors.argumentTypeIncorrect("physicalPaths", "Array");
        if (physicalPaths.length == 0)
            throw errors_1.errors.arrayEmpty("physicalPaths");
        for (let i = 0; i < physicalPaths.length; i++) {
            let physicalPath = physicalPaths[i];
            if (!fs.existsSync(physicalPath))
                throw errors_1.errors.physicalPathNotExists(physicalPath);
        }
        physicalPaths.forEach(physicalPath => {
            this.addPhysicalPath(physicalPath);
        });
    }
    get name() {
        return this._name;
    }
    get childDirectories() {
        return this._childDirectories;
    }
    addPhysicalPath(physicalPath) {
        this.physicalPaths.push(physicalPath);
        let names = fs.readdirSync(physicalPath);
        names.forEach(name => {
            let childPhysicalPath = path.join(physicalPath, name);
            if (!fs.statSync(childPhysicalPath).isDirectory()) {
                return;
            }
            if (this._childDirectories[name]) {
                // this._childDirectories[name].physicalPaths.push(childPhysicalPath);
                this._childDirectories[name].addPhysicalPath(childPhysicalPath);
            }
            else {
                this._childDirectories[name] = new VirtualDirectory(childPhysicalPath);
            }
        });
    }
    /** 该文件夹下文件的物理路径 */
    filePhysicalPaths() {
        let childFilePhysicalPaths = {};
        this.physicalPaths.forEach(parentPhysicalPath => {
            if (!fs.existsSync(parentPhysicalPath))
                throw errors_1.errors.physicalPathNotExists(parentPhysicalPath);
            let names = fs.readdirSync(parentPhysicalPath);
            names.forEach(name => {
                let childPhysicalPath = path.join(parentPhysicalPath, name);
                if (fs.statSync(childPhysicalPath).isFile()) {
                    childFilePhysicalPaths[name] = childPhysicalPath;
                }
            });
        });
        Object.assign(childFilePhysicalPaths, this._childFiles);
        return childFilePhysicalPaths;
    }
    /**
     * 通过路径获取文件夹
     * @param virtualPath 文件的路径
     */
    childDirectory(virtualPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("path");
        this.checkVirtualPath(virtualPath);
        let names = virtualPath.split("/").filter(o => o);
        let dir = this;
        for (let i = 0; i < names.length; i++) {
            dir = dir._childDirectories[names[i]];
            if (dir == null)
                break;
        }
        return dir;
    }
    checkVirtualPath(virtualPath) {
        console.assert(virtualPath != null);
        if (virtualPath[0] == "/")
            throw errors_1.errors.virtualPathStartsWithSlash(virtualPath);
        if (virtualPath[virtualPath.length - 1] == "/")
            throw errors_1.errors.virtualPathEndsWithSlash(virtualPath);
    }
    /** 添加虚拟文件夹 */
    addvirtualDirectory(virtualPath, physicalPath, operationExists) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("virtualPath");
        this.checkVirtualPath(virtualPath);
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPath");
        if (!operationExists)
            throw errors_1.errors.argumentNull("operationExists");
        let names = virtualPath.split("/").filter(o => o);
        let parentDir = this;
        if (names.length > 1) {
            for (let i = 0; i < names.length - 1; i++) {
                let name = names[i];
                parentDir = parentDir._childDirectories[name];
                if (parentDir == null) {
                    parentDir = new VirtualDirectory();
                    this._childDirectories[name] = parentDir;
                }
            }
        }
        let dirName = names[names.length - 1];
        let childDir = parentDir._childDirectories[dirName];
        if (childDir) {
            if (operationExists == "replace") {
                childDir = new VirtualDirectory(physicalPath);
                parentDir._childDirectories[dirName] = childDir;
            }
            else {
                console.assert(operationExists == "merge");
                childDir.addPhysicalPath(physicalPath);
            }
            return;
        }
        parentDir._childDirectories[dirName] = new VirtualDirectory(physicalPath);
    }
    /** 添加虚拟文件夹 */
    addvirtualFile(virtualPath, physicalPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("virtualPath");
        this.checkVirtualPath(virtualPath);
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPath");
        let names = virtualPath.split("/").filter(o => o);
        let parentDir = this;
        if (names.length > 1) {
            for (let i = 0; i < names.length - 1; i++) {
                let name = names[i];
                parentDir = parentDir._childDirectories[name];
                if (parentDir == null) {
                    parentDir = new VirtualDirectory();
                    this._childDirectories[name] = parentDir;
                }
            }
        }
        let fileName = names[names.length - 1];
        this._childFiles[fileName] = physicalPath;
    }
}
exports.VirtualDirectory = VirtualDirectory;
//# sourceMappingURL=virtual-path.js.map