export let errors = {
    vitualPathRequirePhysicalPath(virtualPath: string, physicalPath: string) {
        let msg = `The physical path '${physicalPath}' of virtual path '${virtualPath}' is not a physical path.`
        let error = new Error(msg);
        let name: keyof typeof errors = "vitualPathRequirePhysicalPath";
        error.name = name;
        return error
    },
    notPhysicalPath(physicalPath: string) {
        let msg = `Path '${physicalPath}' is not a physical path.`
        let error = new Error(msg);
        let name: keyof typeof errors = "notPhysicalPath";
        error.name = name;
        return error
    },
    argumentNull(argumentName: string) {
        let error = new Error(`Argument ${argumentName} cannt be null or emtpy.`);
        let name: keyof typeof errors = "argumentNull";
        error.name = name;
        return error;
    },
    argumentTypeIncorrect(argumentName: string, expectedType: string) {
        let msg = `Argument ${argumentName} type error, expected type is ${expectedType}.`;
        let error = new Error(msg);
        let name: keyof typeof errors = "argumentTypeIncorrect";
        error.name = name;
        return error;
    },
    arrayEmpty(argumentName: string) {
        let error = new Error(`Array ${argumentName} can not be emtpy.`);
        let name: keyof typeof errors = "arrayEmpty";
        error.name = name;
        return error;
    },
    virtualPathStartsWithSlash(path: string) {
        let error = new Error(`Child directory path can not starts with slash, path is ${path}.`);
        let name: keyof typeof errors = "virtualPathStartsWithSlash";
        error.name = name;
        return error;
    },
    virtualPathEndsWithSlash(path: string) {
        let error = new Error(`Child directory path can not ends with slash, path is ${path}.`);
        let name: keyof typeof errors = "virtualPathEndsWithSlash";
        error.name = name;
        return error;
    },
    directoryNotExists(path: string) {
        let error = new Error(`Directory ${path} is not exists.`);
        let name: keyof typeof errors = "directoryNotExists";
        error.name = name;
        return error;
    },
    directoryExists(path: string) {
        let error = new Error(`Directory ${path} is exists.`);
        let name: keyof typeof errors = "directoryExists";
        error.name = name;
        return error;
    },
    physicalPathNotExists(physicalPath: string) {
        let error = new Error(`Directory ${physicalPath} is not exists.`);
        let name: keyof typeof errors = "physicalPathNotExists";
        error.name = name;
        return error;
    },
    pathExists(path: string) {
        let error = new Error(`Path '${path}' is exists.`);
        let name: keyof typeof errors = "pathExists";
        error.name = name;
        return error;
    },
    pathNotDirectory(path: string) {
        let error = new Error(`Path '${path}' is not a directory.`);
        let name: keyof typeof errors = "pathNotDirectory";
        error.name = name;
        return error;
    },
    pathNotFile(path: string) {
        let error = new Error(`Path '${path}' is not a file.`);
        let name: keyof typeof errors = "pathNotFile";
        error.name = name;
        return error;
    },
    physicalPathExists(physicalPath: string, dirName: string) {
        let error = new Error(`Physical path '${physicalPath}' is exists in directory '${dirName}'.`);
        let name: keyof typeof errors = "physicalPathExists";
        error.name = name;
        return error;
    },
    invalidVirtualPath(virtualPath: string) {
        let error = new Error(`Path '${virtualPath}' is a invalid path.`);
        let name: keyof typeof errors = "invalidVirtualPath";
        error.name = name;
        return error;
    },
    fileNotFound(virtualPath: string, searchIn: string[]) {
        let error = new Error(`File '${virtualPath}' not found in the directories ${searchIn.join(",")}.`);
        let name: keyof typeof errors = "fileNotFound";
        error.name = name;
        return error;
    },
    directoryNotFound(virtualPath: string, searchIn: string[]) {
        let error = new Error(`File '${virtualPath}' not found in the directories ${searchIn.join(",")}.`);
        let name: keyof typeof errors = "directoryNotExists";
        error.name = name;
        return error;
    },
}