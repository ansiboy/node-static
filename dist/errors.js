"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = {
    vitualPathRequirePhysicalPath(virtualPath, physicalPath) {
        let msg = `The physical path '${physicalPath}' of virtual path '${virtualPath}' is not a physical path.`;
        let error = new Error(msg);
        let name = "vitualPathRequirePhysicalPath";
        error.name = name;
        return error;
    },
    notPhysicalPath(physicalPath) {
        let msg = `Path '${physicalPath}' is not a physical path.`;
        let error = new Error(msg);
        let name = "notPhysicalPath";
        error.name = name;
        return error;
    },
    argumentNull(argumentName) {
        let error = new Error(`Argument ${argumentName} cannt be null or emtpy.`);
        let name = "argumentNull";
        error.name = name;
        return error;
    },
    argumentTypeIncorrect(argumentName, expectedType) {
        let msg = `Argument ${argumentName} type error, expected type is ${expectedType}.`;
        let error = new Error(msg);
        let name = "argumentTypeIncorrect";
        error.name = name;
        return error;
    },
    arrayEmpty(argumentName) {
        let error = new Error(`Array ${argumentName} can not be emtpy.`);
        let name = "arrayEmpty";
        error.name = name;
        return error;
    },
    virtualPathStartsWithSlash(path) {
        let error = new Error(`Child directory path can not starts with slash, path is ${path}.`);
        let name = "virtualPathStartsWithSlash";
        error.name = name;
        return error;
    },
    virtualPathEndsWithSlash(path) {
        let error = new Error(`Child directory path can not ends with slash, path is ${path}.`);
        let name = "virtualPathEndsWithSlash";
        error.name = name;
        return error;
    },
    directoryNotExists(path) {
        let error = new Error(`Directory ${path} is not exists.`);
        let name = "directoryNotExists";
        error.name = name;
        return error;
    },
    directoryExists(path) {
        let error = new Error(`Directory ${path} is exists.`);
        let name = "directoryExists";
        error.name = name;
        return error;
    },
    physicalPathNotExists(physicalPath) {
        let error = new Error(`Directory ${physicalPath} is not exists.`);
        let name = "physicalPathNotExists";
        error.name = name;
        return error;
    },
    filePahtExists(path) {
        let error = new Error(`File path '${path}' is exists.`);
        let name = "filePahtExists";
        error.name = name;
        return error;
    },
    pathNotDirectory(path) {
        let error = new Error(`Path '${path}' is not a directory.`);
        let name = "pathNotDirectory";
        error.name = name;
        return error;
    },
    pathNotFile(path) {
        let error = new Error(`Path '${path}' is not a file.`);
        let name = "pathNotFile";
        error.name = name;
        return error;
    },
    physicalPathExists(physicalPath, dirName) {
        let error = new Error(`Physical path '${physicalPath}' is exists in directory '${dirName}'.`);
        let name = "physicalPathExists";
        error.name = name;
        return error;
    }
};
//# sourceMappingURL=errors.js.map