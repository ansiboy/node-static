export declare class VirtualDirectory {
    private physicalPaths;
    private childDirs;
    private childFiles;
    private name;
    private virtualPath;
    private parent;
    constructor(...physicalPaths: string[]);
    getName(): string;
    getParent(): VirtualDirectory;
    /** 获取虚拟文件夹所有的物理路径 */
    getPhysicalPaths(): string[];
    /** 获取虚拟文件夹的虚拟路径 */
    getVirtualPath(): string;
    getChildDirectories(): {
        [name: string]: VirtualDirectory;
    };
    /**
     * 创建子文件夹，如果子文件夹已经存在，则覆盖原来的子文件夹
     * @param parent 父文件夹
     * @param name 文件夹名称
     * @param physicalPaths 文件夹对应的物理文件路径
     */
    private createChild;
    /**
     * 添加虚拟文件夹对应的物理文件夹，一个虚拟文件夹，可以对应多个物理文件夹
     * @param dirPath 物理路径
     * @param index 物理路径索引，默认添加到最后
     */
    private addPhysicalDirectory;
    private checkPhysicalPath;
    /** 该文件夹下文件的物理路径 */
    getChildFiles(): {
        [name: string]: string;
    };
    /** 查找虚拟文件夹下的子文件 */
    findChildFile(fileName: string): string;
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
    /**
     * 添加空白虚拟目录，是指虚拟目录对应的目录路径为空
     * @param virtualPath 虚拟目录
     */
    private addEmptyDirectoryIfNotExists;
    /** 添加子虚拟文件 */
    addVirtualFile(virtualPath: string, physicalPath: string): void;
}
