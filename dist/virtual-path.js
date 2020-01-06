"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const path = require("path");
const fs = require("fs");
class VirtualDirectory {
    constructor(...physicalPaths) {
        this.physicalPaths = [];
        this.childDirs = {};
        this.childFiles = {};
        if (!physicalPaths)
            throw errors_1.errors.argumentNull("physicalPaths");
        if (!Array.isArray(physicalPaths))
            throw errors_1.errors.argumentTypeIncorrect("physicalPaths", "Array");
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
    getChildDirectories() {
        for (let i = 0; i < this.physicalPaths.length; i++) {
            let dirPhysicalPath = this.physicalPaths[i];
            let names = fs.readdirSync(dirPhysicalPath);
            names.map(name => {
                let childPhysicalPath = path.join(dirPhysicalPath, name);
                if (!fs.statSync(childPhysicalPath).isDirectory())
                    return;
                this.childDirs[name] = this.childDirs[name] || new VirtualDirectory(childPhysicalPath);
            });
        }
        return this.childDirs;
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
    }
    /** 该文件夹下文件的物理路径 */
    getChildFiles() {
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
        Object.assign(childFilePhysicalPaths, this.childFiles);
        return childFilePhysicalPaths;
    }
    /**
     * 获取当前文件夹的子文件夹
     * @param dirName 文件夹名称
     */
    getChildDirectory(dirName) {
        if (this.childDirs[dirName])
            return this.childDirs[dirName];
        let childPhyPaths = this.physicalPaths.map(p => path.join(p, dirName))
            .filter(o => fs.existsSync(o));
        if (childPhyPaths.length == 0)
            return null;
        this.childDirs[dirName] = new VirtualDirectory(...childPhyPaths);
        return this.childDirs[dirName];
    }
    /**
     * 通过路径获取文件夹
     * @param virtualPath 文件夹的虚拟路径
     */
    getDirectory(virtualPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("path");
        VirtualDirectory.checkVirtualPath(virtualPath);
        let names = virtualPath.split("/").filter(o => o);
        let dirName = names[names.length - 1];
        let parentPath = names.splice(0, names.length - 1).join("/");
        if (!parentPath) {
            return this.getChildDirectory(dirName);
        }
        let parentDir = this.getDirectory(parentPath);
        if (parentDir == null)
            return null;
        return parentDir.getChildDirectory(dirName);
    }
    /**
     * 通过路径获取文件
     * @param virtualPath 文件的虚拟路径
     */
    getFile(virtualPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("path");
        VirtualDirectory.checkVirtualPath(virtualPath);
        let names = virtualPath.split("/").filter(o => o);
        let fileName = names[names.length - 1];
        let dirPath = names.splice(0, names.length - 1).join("/");
        let dir = dirPath ? this.getDirectory(dirPath) : this;
        if (dir == null)
            return null;
        if (dir.childFiles[fileName])
            return dir.childFiles[fileName];
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
    addVirtualDirectory(virtualPath, physicalPath, operationExists) {
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
                parentDir = parentDir.childDirs[name];
                if (parentDir == null) {
                    parentDir = new VirtualDirectory();
                    this.childDirs[name] = parentDir;
                }
            }
        }
        let dirName = names[names.length - 1];
        let childDir = parentDir.childDirs[dirName];
        if (childDir) {
            if (operationExists == "replace") {
                childDir = new VirtualDirectory(physicalPath);
                parentDir.childDirs[dirName] = childDir;
            }
            else {
                console.assert(operationExists == "merge");
                childDir.addPhysicalDirectory(physicalPath);
            }
            return;
        }
        parentDir.childDirs[dirName] = new VirtualDirectory(physicalPath);
    }
    addEmptyVirtualDirectory(virtualPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("virtualPath");
        VirtualDirectory.checkVirtualPath(virtualPath);
        let names = virtualPath.split("/").filter(o => o);
        let parentDir = this;
        if (names.length > 1) {
            for (let i = 0; i < names.length - 1; i++) {
                let name = names[i];
                parentDir = parentDir.childDirs[name];
                if (parentDir == null) {
                    parentDir = new VirtualDirectory();
                    this.childDirs[name] = parentDir;
                }
            }
        }
        let dirName = names[names.length - 1];
        let childDir = parentDir.childDirs[dirName];
        if (childDir) {
            throw errors_1.errors.directoryExists(virtualPath);
        }
        parentDir.childDirs[dirName] = new VirtualDirectory();
        return parentDir.childDirs[dirName];
    }
    /** 添加子虚拟文件 */
    addVirtualFile(virtualPath, physicalPath) {
        if (!virtualPath)
            throw errors_1.errors.argumentNull("virtualPath");
        if (!physicalPath)
            throw errors_1.errors.argumentNull("physicalPath");
        let names = virtualPath.split("/").filter(o => o);
        let fileName = names[names.length - 1];
        let dirPath = names.splice(0, names.length - 1).join("/");
        let parentDir = dirPath == "" ? this : this.getDirectory(dirPath);
        if (parentDir == null) {
            parentDir = this.addEmptyVirtualDirectory(dirPath);
        }
        parentDir.childFiles[fileName] = physicalPath;
    }
}
exports.VirtualDirectory = VirtualDirectory;
//# sourceMappingURL=virtual-path.js.map