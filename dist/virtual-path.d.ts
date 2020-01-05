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
    /**
     * 添加虚拟文件夹对应的物理文件夹，一个虚拟文件夹，可以对应多个物理文件夹
     * @param dirPath 物理路径
     */
    addPhysicalDirectory(dirPath: string): void;
    /** 该文件夹下文件的物理路径 */
    filePhysicalPaths(): {
        [name: string]: string;
    };
    /**
     * 通过路径获取文件夹
     * @param virtualPath 文件夹的虚拟路径
     */
    childDirectory(virtualPath: string): VirtualDirectory;
    /**
     * 通过路径获取文件
     * @param virtualPath 文件的虚拟路径
     */
    childFile(virtualPath: string): string;
    private static checkVirtualPath;
    /** 添加子虚拟文件夹 */
    addvirtualDirectory(virtualPath: string, physicalPath: string, operationExists: "replace" | "merge"): void;
    /** 添加子虚拟文件 */
    addvirtualFile(virtualPath: string, physicalPath: string): void;
}
