"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const url = require("url");
const mime = require("mime");
const errors_1 = require("./errors");
const virtual_path_1 = require("./virtual-path");
const stream_1 = require("stream");
const maishu_chitu_service_1 = require("maishu-chitu-service");
var maishu_chitu_service_2 = require("maishu-chitu-service");
exports.StatusCode = maishu_chitu_service_2.StatusCode;
var version = require("../package.json")["version"];
// export enum StatusCode {
//     NotFound = 404,
//     OK = 200,
//     Redirect = 301,
//     BadRequest = 400,
//     Forbidden = 403,
// }
let errorPages = {
    NotFound: "Not Found",
    Forbidden: "Forbidden",
    BadRequest: "Bad Request"
};
class Server {
    constructor(root, options) {
        if (!root)
            throw errors_1.errors.argumentNull("root");
        this.options = options = options || {};
        if (typeof root == "string")
            this.rootDir = new virtual_path_1.VirtualDirectory(root);
        else
            this.rootDir = root;
        this.options.headers = this.options.headers || {};
        this.options.indexFile = this.options.indexFile || "index.html";
        this.options.headers = Object.assign({
            server: 'node-static/' + version
        }, this.options.headers);
    }
    serve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var pathname;
            let r;
            try {
                pathname = decodeURI(url.parse(req.url).pathname);
            }
            catch (e) {
                r = { statusCode: maishu_chitu_service_1.StatusCode.BadRequest, fileStream: this.createReadble(errorPages.BadRequest) };
            }
            if (pathname)
                r = yield this.servePath(pathname);
            //======================================
            let headers = {
                "Date": new Date().toUTCString(),
            };
            if (r.physicalPath) {
                let stat = fs.statSync(r.physicalPath);
                let mtime = stat.mtime.valueOf();
                Object.assign(headers, {
                    "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
                    "Last-Modified": stat.mtime.toDateString(),
                    "Content-Type": req.headers["Content-Type"] || mime.getType(r.physicalPath),
                    "Content-Length": stat.size,
                    "Physical-Path": r.physicalPath,
                });
            }
            res.writeHead(r.statusCode, headers);
            r.fileStream.pipe(res);
        });
    }
    serveDir(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            let htmlIndex = dir.getFile(this.options.indexFile);
            if (!fs.existsSync(htmlIndex)) {
                return { statusCode: maishu_chitu_service_1.StatusCode.NotFound, fileStream: this.createReadble(errorPages.NotFound) };
            }
            let stream = fs.createReadStream(htmlIndex);
            return { statusCode: maishu_chitu_service_1.StatusCode.OK, fileStream: stream, physicalPath: htmlIndex };
        });
    }
    createReadble(text) {
        let r = new stream_1.Readable();
        r.push(Buffer.from(text));
        r.push(null);
        return r;
    }
    servePath(pathname) {
        return __awaiter(this, void 0, void 0, function* () {
            let physicalPath = this.resolve(pathname);
            if (!physicalPath) {
                return { statusCode: maishu_chitu_service_1.StatusCode.Forbidden, fileStream: this.createReadble(errorPages.NotFound) };
            }
            if (typeof physicalPath == "string") {
                if (!fs.existsSync(physicalPath))
                    return { statusCode: maishu_chitu_service_1.StatusCode.NotFound, fileStream: this.createReadble(errorPages.NotFound) };
                let stream = fs.createReadStream(physicalPath);
                return { statusCode: maishu_chitu_service_1.StatusCode.OK, fileStream: stream, physicalPath };
            }
            return this.serveDir(physicalPath);
        });
    }
    /** 将路径转化为物理路径 */
    resolve(pathname) {
        pathname = pathname.trim();
        if (pathname[0] == "/")
            pathname = pathname.substr(1);
        if (pathname[pathname.length - 1] == "/")
            pathname = pathname.substr(0, pathname.length - 1);
        if (pathname == "")
            return this.rootDir;
        let physicalPath = this.rootDir.getFile(pathname);
        if (physicalPath) {
            return physicalPath;
        }
        let childDir = this.rootDir.getDirectory(pathname);
        return childDir;
    }
}
exports.Server = Server;
//# sourceMappingURL=node-static.js.map