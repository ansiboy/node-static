"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = {
    notPhysicalPath(virtualPath, physicalPath) {
        let msg = `The physical path '${physicalPath}' of virtual path '${virtualPath}' is not a physical path.`;
        let error = new Error(msg);
        return error;
    }
};
//# sourceMappingURL=errors.js.map