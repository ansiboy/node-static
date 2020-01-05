import { errors } from "./errors";
import path = require("path");
import fs = require("fs");

export class VirtualDirectory {
    private physicalPaths: string[] = [];
    private _childDirectories: { [name: string]: VirtualDirectory } = {};
    private _name: string = "";
    private _childFiles: { [name: string]: string } = {};

    constructor(...physicalPaths: string[]) {

        if (!physicalPaths) throw errors.argumentNull("physicalPaths");
        if (!Array.isArray(physicalPaths)) throw errors.argumentTypeIncorrect("physicalPaths", "Array");
        // if (physicalPaths.length == 0)
        //     throw errors.arrayEmpty("physicalPaths");

        for (let i = 0; i < physicalPaths.length; i++) {
            let physicalPath = physicalPaths[i];
            if (!fs.existsSync(physicalPath))
                throw errors.physicalPathNotExists(physicalPath);

            if (!fs.statSync(physicalPath).isDirectory())
                throw errors.pathNotDirectory(physicalPath);
        }

        physicalPaths.forEach(physicalPath => {
            this.addPhysicalDirectory(physicalPath);
        })
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
    addPhysicalDirectory(dirPath: string) {
        
        if (!path.isAbsolute(dirPath))
            throw errors.notPhysicalPath(dirPath);

        if (!fs.existsSync(dirPath))
            throw errors.physicalPathNotExists(dirPath);

        if (!fs.statSync(dirPath).isDirectory())
            throw errors.pathNotDirectory(dirPath);

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
        })

    }

    /** 该文件夹下文件的物理路径 */
    filePhysicalPaths() {
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

        Object.assign(childFilePhysicalPaths, this._childFiles);
        return childFilePhysicalPaths;
    }

    /**
     * 通过路径获取文件夹
     * @param virtualPath 文件夹的虚拟路径
     */
    childDirectory(virtualPath: string): VirtualDirectory {
        if (!virtualPath) throw errors.argumentNull("path");
        VirtualDirectory.checkVirtualPath(virtualPath);

        let names = virtualPath.split("/").filter(o => o);
        if (names.length < 1)
            return this;

        let dir: VirtualDirectory = this;
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
    childFile(virtualPath: string): string {
        if (!virtualPath) throw errors.argumentNull("path");
        VirtualDirectory.checkVirtualPath(virtualPath);

        let names = virtualPath.split("/").filter(o => o);
        if (names.length < 1)
            return null;


        let dir: VirtualDirectory;
        let fileName: string;
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

    private static checkVirtualPath(virtualPath: string) {
        console.assert(virtualPath != null);
        if (virtualPath[0] == "/")
            throw errors.virtualPathStartsWithSlash(virtualPath);

        if (virtualPath[virtualPath.length - 1] == "/")
            throw errors.virtualPathEndsWithSlash(virtualPath);
    }

    /** 添加子虚拟文件夹 */
    addvirtualDirectory(virtualPath: string, physicalPath: string, operationExists: "replace" | "merge") {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        VirtualDirectory.checkVirtualPath(virtualPath);

        if (!physicalPath) throw errors.argumentNull("physicalPath");
        if (!operationExists) throw errors.argumentNull("operationExists");

        let names = virtualPath.split("/").filter(o => o);
        let parentDir: VirtualDirectory = this;
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
    addvirtualFile(virtualPath: string, physicalPath: string) {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        if (!physicalPath) throw errors.argumentNull("physicalPath");

        if (!fs.statSync(physicalPath).isFile())
            throw errors.pathNotFile(physicalPath);

        let names = virtualPath.split("/").filter(o => o);
        let parentDir: VirtualDirectory = this;
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