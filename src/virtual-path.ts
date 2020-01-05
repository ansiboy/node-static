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
        if (physicalPaths.length == 0) throw errors.arrayEmpty("physicalPaths");

        for (let i = 0; i < physicalPaths.length; i++) {
            let physicalPath = physicalPaths[i];
            if (!fs.existsSync(physicalPath))
                throw errors.physicalPathNotExists(physicalPath);
        }

        physicalPaths.forEach(physicalPath => {
            this.addPhysicalPath(physicalPath);
        })
    }

    get name() {
        return this._name;
    }

    get childDirectories() {
        return this._childDirectories;
    }

    addPhysicalPath(physicalPath: string) {

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
     * @param virtualPath 文件的路径
     */
    childDirectory(virtualPath: string): VirtualDirectory {
        if (!virtualPath) throw errors.argumentNull("path");
        this.checkVirtualPath(virtualPath);

        let names = virtualPath.split("/").filter(o => o);
        let dir: VirtualDirectory = this;
        for (let i = 0; i < names.length; i++) {
            dir = dir._childDirectories[names[i]];
            if (dir == null)
                break;
        }

        return dir;
    }

    private checkVirtualPath(virtualPath: string) {
        console.assert(virtualPath != null);
        if (virtualPath[0] == "/")
            throw errors.virtualPathStartsWithSlash(virtualPath);

        if (virtualPath[virtualPath.length - 1] == "/")
            throw errors.virtualPathEndsWithSlash(virtualPath);
    }

    /** 添加虚拟文件夹 */
    addvirtualDirectory(virtualPath: string, physicalPath: string, operationExists: "replace" | "merge") {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        this.checkVirtualPath(virtualPath);

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
                childDir.addPhysicalPath(physicalPath);
            }
            return;
        }

        parentDir._childDirectories[dirName] = new VirtualDirectory(physicalPath);
    }

    /** 添加虚拟文件夹 */
    addvirtualFile(virtualPath: string, physicalPath: string) {
        if (!virtualPath) throw errors.argumentNull("virtualPath");
        this.checkVirtualPath(virtualPath);

        if (!physicalPath) throw errors.argumentNull("physicalPath");

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