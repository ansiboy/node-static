import { errors } from "./errors";
import path = require("path");
import fs = require("fs");
import os = require("os");

export class VirtualDirectory {
    private physicalPaths: string[] = [];
    private childDirs: { [name: string]: VirtualDirectory } = {};
    private childFiles: { [name: string]: string } = {};
    private name: string = "";
    private virtualPath: string;
    private parent: VirtualDirectory | null;

    constructor(...physicalPaths: string[]) {

        if (!physicalPaths) throw errors.argumentNull("physicalPaths");
        if (!Array.isArray(physicalPaths)) throw errors.argumentTypeIncorrect("physicalPaths", "Array");

        for (let i = 0; i < physicalPaths.length; i++) {
            let physicalPath = physicalPaths[i];
            if (!fs.existsSync(physicalPath))
                throw errors.physicalPathNotExists(physicalPath);

            if (!fs.statSync(physicalPath).isDirectory())
                throw errors.pathNotDirectory(physicalPath);
        }

        physicalPaths.forEach(physicalPath => {
            this.checkPhysicalPath(physicalPath);
        })
        this.physicalPaths = physicalPaths;
    }

    getName() {
        return this.name;
    }

    getParent(): VirtualDirectory {
        return this.parent;
    }

    getPhysicalPaths() {
        return this.physicalPaths;
    }

    getVirtualPath(): string {
        if (this.virtualPath)
            return this.virtualPath;

        this.virtualPath = this.name;
        let p: VirtualDirectory = this.parent;
        while (p != null) {
            this.virtualPath = path.join(p.name, this.virtualPath);
            p = p.parent;
        }

        if (os.platform() == "win32") {
            this.virtualPath = this.virtualPath.replace(/\\/g, "/")
        }
        return this.virtualPath;
    }

    getChildDirectories() {
        for (let i = 0; i < this.physicalPaths.length; i++) {
            let dirPhysicalPath = this.physicalPaths[i];
            let names = fs.readdirSync(dirPhysicalPath);
            names.map(name => {
                let childPhysicalPath = path.join(dirPhysicalPath, name);
                if (!fs.statSync(childPhysicalPath).isDirectory())
                    return;

                // this.childDirs[name] = this.childDirs[name] || new VirtualDirectory(childPhysicalPath);
                if (this.childDirs[name] == null) {
                    this.createChild(this, name, [childPhysicalPath]);
                }
                else if (this.childDirs[name].physicalPaths.indexOf(childPhysicalPath) < 0) {
                    this.childDirs[name].addPhysicalDirectory(childPhysicalPath);
                }
            })
        }

        return this.childDirs;
    }

    /**
     * 创建子文件夹，如果子文件夹已经存在，则覆盖原来的子文件夹
     * @param parent 父文件夹
     * @param name 文件夹名称
     * @param physicalPaths 文件夹对应的物理文件路径
     */
    private createChild(parent: VirtualDirectory, name: string, physicalPaths: string[]) {
        if (parent == null) throw errors.argumentNull("parent");
        if (name == null) throw errors.argumentNull("name");

        let child = new VirtualDirectory(...physicalPaths);
        child.name = name;
        child.parent = parent;
        this.childDirs[name] = child;
        return child;
    }

    /**
     * 添加虚拟文件夹对应的物理文件夹，一个虚拟文件夹，可以对应多个物理文件夹
     * @param dirPath 物理路径
     * @param index 物理路径索引，默认添加到最后
     */
    private addPhysicalDirectory(dirPath: string, index?: number) {

        this.checkPhysicalPath(dirPath);

        if (this.physicalPaths.indexOf(dirPath) >= 0)
            throw errors.physicalPathExists(dirPath, this.getName() || "root");

        index = index == null ? this.physicalPaths.length : index;
        this.physicalPaths.splice(index, 0, dirPath);
        for (let name in this.childDirs) {
            let childPhysicalPath = path.join(dirPath, name);
            if (fs.existsSync(childPhysicalPath)) {
                this.childDirs[name].addPhysicalDirectory(childPhysicalPath, index);
            }
        }
    }

    private checkPhysicalPath(physicalPath: string) {
        if (!path.isAbsolute(physicalPath))
            throw errors.notPhysicalPath(physicalPath);

        if (!fs.existsSync(physicalPath))
            throw errors.physicalPathNotExists(physicalPath);

        if (!fs.statSync(physicalPath).isDirectory())
            throw errors.pathNotDirectory(physicalPath);

    }

    /** 该文件夹下文件的物理路径 */
    getChildFiles() {
        let childFilePhysicalPaths: { [name: string]: string } = {};
        this.physicalPaths.forEach(parentPhysicalPath => {
            if (!fs.existsSync(parentPhysicalPath))
                throw errors.physicalPathNotExists(parentPhysicalPath);

            let names = fs.readdirSync(parentPhysicalPath);
            names.forEach(name => {
                let childPhysicalPath = path.join(parentPhysicalPath, name);
                if (fs.statSync(childPhysicalPath).isFile()) {
                    childFilePhysicalPaths[name] = childPhysicalPath;
                }
            })
        })

        Object.assign(childFilePhysicalPaths, this.childFiles);
        return childFilePhysicalPaths;
    }

    /**
     * 获取当前文件夹的子文件夹
     * @param dirName 文件夹名称
     */
    private getChildDirectory(dirName: string) {
        if (this.childDirs[dirName])
            return this.childDirs[dirName];

        let childPhyPaths = this.physicalPaths.map(p => path.join(p, dirName))
            .filter(o => fs.existsSync(o));

        if (childPhyPaths.length == 0)
            return null;

        return this.createChild(this, dirName, childPhyPaths);
    }

    /**
     * 通过路径获取文件夹
     * @param virtualPath 文件夹的虚拟路径
     */
    getDirectory(virtualPath: string): VirtualDirectory {
        if (!virtualPath) throw errors.argumentNull("path");
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
    getFile(virtualPath: string): string {
        if (!virtualPath) throw errors.argumentNull("path");
        VirtualDirectory.checkVirtualPath(virtualPath);

        let names = virtualPath.split("/").filter(o => o);

        let fileName: string = names[names.length - 1];
        let dirPath = names.splice(0, names.length - 1).join("/");
        let dir: VirtualDirectory = dirPath ? this.getDirectory(dirPath) : this;

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

    private static checkVirtualPath(virtualPath: string) {
        console.assert(virtualPath != null);
        if (virtualPath[0] == "/")
            throw errors.virtualPathStartsWithSlash(virtualPath);

        if (virtualPath[virtualPath.length - 1] == "/")
            throw errors.virtualPathEndsWithSlash(virtualPath);
    }

    /** 添加子虚拟文件夹 */
    addVirtualDirectory(virtualPath: string, physicalPath: string, operationExists: "replace" | "merge") {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        VirtualDirectory.checkVirtualPath(virtualPath);

        if (!physicalPath) throw errors.argumentNull("physicalPath");
        if (!operationExists) throw errors.argumentNull("operationExists");

        let names = virtualPath.split("/").filter(o => o);
        let parentDir: VirtualDirectory = this;
        if (names.length > 1) {
            for (let i = 0; i < names.length - 1; i++) {
                let name = names[i];
                parentDir = parentDir.childDirs[name] == null ?
                    this.createChild(parentDir, name, []) : parentDir.childDirs[name];
            }
        }

        let dirName = names[names.length - 1];
        let childDir = parentDir.childDirs[dirName];
        if (childDir != null && operationExists == "merge") {
            childDir.addPhysicalDirectory(physicalPath);
        }

        this.createChild(this, dirName, [physicalPath]);
    }

    /**
     * 添加空白虚拟目录，是指虚拟目录对应的目录路径为空
     * @param virtualPath 虚拟目录
     */
    private addEmptyDirectoryIfNotExists(virtualPath: string) {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        VirtualDirectory.checkVirtualPath(virtualPath);

        let names = virtualPath.split("/").filter(o => o);
        let parentDir: VirtualDirectory = this;
        if (names.length > 1) {
            for (let i = 0; i < names.length - 1; i++) {
                let name = names[i];
                parentDir = parentDir.childDirs[name] = null ?
                    this.createChild(parentDir, name, []) : parentDir.childDirs[name];
            }
        }

        let dirName = names[names.length - 1];
        let childDir = parentDir.childDirs[dirName];
        if (childDir) {
            throw errors.directoryExists(virtualPath)
        }

        return this.createChild(parentDir, dirName, []);
    }

    /** 添加子虚拟文件 */
    addVirtualFile(virtualPath: string, physicalPath: string) {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        if (!physicalPath) throw errors.argumentNull("physicalPath");

        let names = virtualPath.split("/").filter(o => o);
        let fileName = names[names.length - 1];
        let dirPath = names.splice(0, names.length - 1).join("/");
        let parentDir = dirPath == "" ? this : this.getDirectory(dirPath);
        if (parentDir == null) {
            parentDir = this.addEmptyDirectoryIfNotExists(dirPath);
        }

        parentDir.childFiles[fileName] = physicalPath;
    }
}