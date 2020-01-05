export declare class VirtualDirectory {
    private physicalPaths;
    private _childDirectories;
    private _name;
    private _childFiles;
    constructor(...physicalPaths: string[]);
    get name(): string;
    get childDirectories(): {
        [name: string]: VirtualDirectory;
    };
    addPhysicalPath(physicalPath: string): void;
    /** 该文件夹下文件的物理路径 */
    filePhysicalPaths(): {
        [name: string]: string;
    };
    /**
     * 通过路径获取文件夹
     * @param virtualPath 文件的路径
     */
    childDirectory(virtualPath: string): VirtualDirectory;
    private checkVirtualPath;
    /** 添加虚拟文件夹 */
    addvirtualDirectory(virtualPath: string, physicalPath: string, operationExists: "replace" | "merge"): void;
    /** 添加虚拟文件夹 */
    addvirtualFile(virtualPath: string, physicalPath: string): void;
}
