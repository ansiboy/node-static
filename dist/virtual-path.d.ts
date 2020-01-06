export declare class VirtualDirectory {
    private physicalPaths;
    private childDirs;
    private childFiles;
    constructor(...physicalPaths: string[]);
    getChildDirectories(): {
        [name: string]: VirtualDirectory;
    };
    /**
     * 添加虚拟文件夹对应的物理文件夹，一个虚拟文件夹，可以对应多个物理文件夹
     * @param dirPath 物理路径
     */
    private addPhysicalDirectory;
    /** 该文件夹下文件的物理路径 */
    getChildFiles(): {
        [name: string]: string;
    };
    /**
     * 获取当前文件夹的子文件夹
     * @param dirName 文件夹名称
     */
    private getChildDirectory;
    /**
     * 通过路径获取文件夹
     * @param virtualPath 文件夹的虚拟路径
     */
    getDirectory(virtualPath: string): VirtualDirectory;
    /**
     * 通过路径获取文件
     * @param virtualPath 文件的虚拟路径
     */
    getFile(virtualPath: string): string;
    private static checkVirtualPath;
    /** 添加子虚拟文件夹 */
    addVirtualDirectory(virtualPath: string, physicalPath: string, operationExists: "replace" | "merge"): void;
    private addEmptyVirtualDirectory;
    /** 添加子虚拟文件 */
    addVirtualFile(virtualPath: string, physicalPath: string): void;
}
