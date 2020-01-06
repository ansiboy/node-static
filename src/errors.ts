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
    filePahtExists(path: string) {
        let error = new Error(`File path '${path}' is exists.`);
        let name: keyof typeof errors = "filePahtExists";
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
    }
}