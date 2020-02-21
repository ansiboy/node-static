export declare let errors: {
    vitualPathRequirePhysicalPath(virtualPath: string, physicalPath: string): Error;
    notPhysicalPath(physicalPath: string): Error;
    argumentNull(argumentName: string): Error;
    argumentTypeIncorrect(argumentName: string, expectedType: string): Error;
    arrayEmpty(argumentName: string): Error;
    virtualPathStartsWithSlash(path: string): Error;
    virtualPathEndsWithSlash(path: string): Error;
    directoryNotExists(path: string): Error;
    directoryExists(path: string): Error;
    physicalPathNotExists(physicalPath: string): Error;
    filePahtExists(path: string): Error;
    pathNotDirectory(path: string): Error;
    pathNotFile(path: string): Error;
    physicalPathExists(physicalPath: string, dirName: string): Error;
};
