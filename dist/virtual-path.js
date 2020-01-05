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
        // if (physicalPaths.length == 0)
        //     throw errors.arrayEmpty("physicalPaths");
        for (let i = 0; i < physicalPaths.length; i++) {
            let physicalPath = physicalPaths[i];
            if (!fs.existsSync(physicalPath))
                throw errors_1.errors.physicalPathNotExists(physicalPath);
            if (!fs.statSync(physicalPath).isDirectory())
                throw errors_1.errors.pathNotDirectory(physicalPath);
        }
        physicalPaths.forEach(physicalPath => {
            this.addPhysicalDirectory(physicalPath);
        });
    }
    get name() {
        return this._name;
    }
    get childDirectories() {
        return this._childDirectories;
    }
    /**
     * 添加虚拟文件夹对应的物理文件夹，一个虚拟文件夹，可以对应多个物理文件夹
     * @param dirPath 物理路径
     */
    addPhysicalDirectory(dirPath) {
        if (!path.isAbsolute(dirPath))
            throw errors_1.errors.notPhysicalPath(dirPath);
        if (!fs.existsSync(dirPath))
            throw errors_1.errors.physicalPathNotExists(dirPath);
        if (!fs.statSync(dirPath).isDirectory())
            throw errors_1.errors.pathNotDirectory(dirPath);
        this.physicalPaths.push(dirPath);
        let names = fs.readdirSync(dirPath);
        names.forEach(name => {
            let childPhysicalPath = path.join(dirPath, name);
            if (!fs.statSync(childPhysicalPath).isDirectory()) {
                return;
            }
            if (this._childDirectories[name]) {
                console.assert(fs.statSync(childPhysicalPath).isDirectory());
                this._childDirectories[name].addPhysicalDirectory(childPhysicalPath);
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
     * @param virtualPath 文件夹的虚拟路径
     */
    childDirectory(virtualPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("path");
        VirtualDirectory.checkVirtualPath(virtualPath);
        let names = virtualPath.split("/").filter(o => o);
        if (names.length < 1)
            return this;
        let dir = this;
        for (let i = 0; i < names.length; i++) {
            dir = dir._childDirectories[names[i]];
            if (dir == null)
                break;
        }
        return dir;
    }
    /**
     * 通过路径获取文件
     * @param virtualPath 文件的虚拟路径
     */
    childFile(virtualPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("path");
        VirtualDirectory.checkVirtualPath(virtualPath);
        let names = virtualPath.split("/").filter(o => o);
        if (names.length < 1)
            return null;
        let dir;
        let fileName;
        if (names.length == 1) {
            dir = this;
            fileName = names[0];
        }
        else {
            fileName = names[names.length - 1];
            names = names.slice(0, names.length - 1);
            let dirPath = names.join("/");
            dir = this.childDirectory(dirPath);
        }
        if (dir == null)
            return null;
        if (dir._childFiles[fileName])
            return dir._childFiles[fileName];
        //===================================================
        // 从物理文件夹中找出对应的文件，优先从后面的文件夹找
        for (let i = dir.physicalPaths.length - 1; i >= 0; i--) {
            let filePhysicalPath = path.join(dir.physicalPaths[i], fileName);
            if (fs.existsSync(filePhysicalPath))
                return filePhysicalPath;
        }
        return null;
    }
    static checkVirtualPath(virtualPath) {
        console.assert(virtualPath != null);
        if (virtualPath[0] == "/")
            throw errors_1.errors.virtualPathStartsWithSlash(virtualPath);
        if (virtualPath[virtualPath.length - 1] == "/")
            throw errors_1.errors.virtualPathEndsWithSlash(virtualPath);
    }
    /** 添加子虚拟文件夹 */
    addvirtualDirectory(virtualPath, physicalPath, operationExists) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("virtualPath");
        VirtualDirectory.checkVirtualPath(virtualPath);
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
                childDir.addPhysicalDirectory(physicalPath);
            }
            return;
        }
        parentDir._childDirectories[dirName] = new VirtualDirectory(physicalPath);
    }
    /** 添加子虚拟文件 */
    addvirtualFile(virtualPath, physicalPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("virtualPath");
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPath");
        if (!fs.statSync(physicalPath).isFile())
            throw errors_1.errors.pathNotFile(physicalPath);
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