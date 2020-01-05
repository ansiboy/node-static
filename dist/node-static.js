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
const path = require("path");
const fs = require("fs");
const url = require("url");
const http = require("http");
const errors_1 = require("./errors");
const virtual_path_1 = require("./virtual-path");
const stream_1 = require("stream");
// Current version
var version = [0, 7, 9];
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["NotFound"] = 404] = "NotFound";
    StatusCode[StatusCode["OK"] = 200] = "OK";
    StatusCode[StatusCode["Redirect"] = 301] = "Redirect";
    StatusCode[StatusCode["BadRequest"] = 400] = "BadRequest";
    StatusCode[StatusCode["Forbidden"] = 403] = "Forbidden";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
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
        if (options.virtualPaths) {
            for (let key in options.virtualPaths) {
                let virtualPath = key;
                let physicalPath = options.virtualPaths[key];
                if (fs.statSync(physicalPath).isDirectory()) {
                    this.rootDir.addvirtualDirectory(virtualPath, physicalPath, "merge");
                }
                else {
                    this.rootDir.addvirtualFile(virtualPath, physicalPath);
                }
            }
        }
        this.defaultHeaders = {};
        this.options.headers = this.options.headers || {};
        this.options.indexFile = this.options.indexFile || "index.html";
        if ('serverInfo' in this.options) {
            this.serverInfo = this.options.serverInfo.toString();
        }
        else {
            this.serverInfo = 'node-static/' + version.join('.');
        }
        this.defaultHeaders['server'] = this.serverInfo;
        for (var k in this.defaultHeaders) {
            this.options.headers[k] = this.options.headers[k] ||
                this.defaultHeaders[k];
        }
    }
    serve(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var pathname;
            let r;
            try {
                pathname = decodeURI(url.parse(req.url).pathname);
            }
            catch (e) {
                r = { statusCode: StatusCode.BadRequest, fileStream: this.createReadble(errorPages.BadRequest) };
            }
            if (pathname)
                r = yield this.servePath(pathname);
            //======================================
            // TODO:headers
            let headers = {};
            res.writeHead(r.statusCode, headers);
            r.fileStream.pipe(res);
        });
    }
    serveDir(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            let htmlIndex = dir.childFile(this.options.indexFile); //path.join(pathname, this.options.indexFile),
            if (!fs.existsSync(htmlIndex)) {
                return { statusCode: StatusCode.NotFound, fileStream: this.createReadble(errorPages.NotFound) };
            }
            let stream = fs.createReadStream(htmlIndex);
            return { statusCode: StatusCode.OK, fileStream: stream };
        });
    }
    createReadble(text) {
        let r = new stream_1.Readable();
        r.push(Buffer.from(text));
        r.push(null);
        return r;
    }
    finish(status, headers, req, res, promise, callback) {
        var result = {
            status: status,
            headers: headers,
            message: http.STATUS_CODES[status]
        };
        headers['server'] = this.serverInfo;
        if (!status || status >= 400) {
            if (callback) {
                callback(result);
            }
            else {
                if (promise.listeners('error').length > 0) {
                    promise.emit('error', result);
                }
                else {
                    res.writeHead(status, headers);
                    res.end();
                }
            }
        }
        else {
            // Don't end the request here, if we're streaming;
            // it's taken care of in `prototype.stream`.
            if (status !== 200 || req.method !== 'GET') {
                res.writeHead(status, headers);
                res.end();
            }
            callback && callback(null, result);
            promise.emit('success', result);
        }
    }
    servePath(pathname) {
        return __awaiter(this, void 0, void 0, function* () {
            let physicalPath = this.resolve(pathname);
            if (!physicalPath) {
                return { statusCode: StatusCode.Forbidden, fileStream: this.createReadble(errorPages.NotFound) };
            }
            if (typeof physicalPath == "string") {
                if (!fs.existsSync(physicalPath))
                    return { statusCode: StatusCode.NotFound, fileStream: this.createReadble(errorPages.NotFound) };
                let stream = fs.createReadStream(physicalPath);
                return { statusCode: StatusCode.OK, fileStream: stream };
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
        let physicalPath = this.rootDir.childFile(pathname);
        if (physicalPath) {
            return physicalPath;
        }
        let childDir = this.rootDir.childDirectory(pathname);
        return childDir;
    }
    respondNoGzip(pathname, status, contentType, _headers, files, stat, req, res, finish) {
        let mtime = typeof stat.mtime == "string" ? Date.parse(stat.mtime) : stat.mtime.valueOf(), key = pathname || files[0], headers = {}, clientETag = req.headers['if-none-match'], clientMTime = Date.parse(req.headers['if-modified-since']), startByte = 0, length = stat.size, byteRange = this.parseByteRange(req, stat);
        /* Handle byte ranges */
        if (files.length == 1 && byteRange.valid) {
            if (byteRange.to < length) {
                // Note: HTTP Range param is inclusive
                startByte = byteRange.from;
                length = byteRange.to - byteRange.from + 1;
                status = 206;
                // Set Content-Range response header (we advertise initial resource size on server here (stat.size))
                headers['Content-Range'] = 'bytes ' + byteRange.from + '-' + byteRange.to + '/' + stat.size;
            }
            else {
                byteRange.valid = false;
                console.warn("Range request exceeds file boundaries, goes until byte no", byteRange.to, "against file size of", length, "bytes");
            }
        }
        /* In any case, check for unhandled byte range headers */
        if (!byteRange.valid && req.headers['range']) {
            console.error(new Error("Range request present but invalid, might serve whole file instead"));
        }
        // Copy default headers
        for (var k in this.options.headers) {
            headers[k] = this.options.headers[k];
        }
        // Copy custom headers
        for (var k in _headers) {
            headers[k] = _headers[k];
        }
        headers['Etag'] = JSON.stringify([stat.ino, stat.size, mtime].join('-'));
        headers['Date'] = new (Date)().toUTCString();
        headers['Last-Modified'] = new (Date)(stat.mtime).toUTCString();
        headers['Content-Type'] = contentType;
        headers['Content-Length'] = length;
        for (var k in _headers) {
            headers[k] = _headers[k];
        }
        // Conditional GET
        // If the "If-Modified-Since" or "If-None-Match" headers
        // match the conditions, send a 304 Not Modified.
        if ((clientMTime || clientETag) &&
            (!clientETag || clientETag === headers['Etag']) &&
            (!clientMTime || clientMTime >= mtime)) {
            // 304 response should not contain entity headers
            ['Content-Encoding',
                'Content-Language',
                'Content-Length',
                'Content-Location',
                'Content-MD5',
                'Content-Range',
                'Content-Type',
                'Expires',
                'Last-Modified'].forEach(function (entityHeader) {
                delete headers[entityHeader];
            });
            finish(304, headers);
        }
        else {
            res.writeHead(status, headers);
            this.stream(key, files, length, startByte, res, function (e) {
                if (e) {
                    return finish(500, {});
                }
                finish(status, headers);
            });
        }
    }
    stream(pathname, files, length, startByte, res, callback) {
        (function streamFile(files, offset) {
            var file = files.shift();
            if (file) {
                file = path.resolve(file) === path.normalize(file) ? file : path.join(pathname || '.', file);
                // Stream the file to the client
                fs.createReadStream(file, {
                    flags: 'r',
                    mode: 438,
                    start: startByte,
                    end: startByte + (length ? length - 1 : 0)
                }).on('data', function (chunk) {
                    // Bounds check the incoming chunk and offset, as copying
                    // a buffer from an invalid offset will throw an error and crash
                    if (chunk.length && offset < length && offset >= 0) {
                        offset += chunk.length;
                    }
                }).on('close', function () {
                    streamFile(files, offset);
                }).on('error', function (err) {
                    callback(err);
                    console.error(err);
                }).pipe(res, { end: false });
            }
            else {
                res.end();
                callback(null, offset);
            }
        })(files.slice(0), 0);
    }
    parseByteRange(req, stat) {
        var byteRange = {
            from: 0,
            to: 0,
            valid: false
        };
        var rangeHeader = req.headers['range'];
        var flavor = 'bytes=';
        if (rangeHeader) {
            if (rangeHeader.indexOf(flavor) == 0 && rangeHeader.indexOf(',') == -1) {
                /* Parse */
                rangeHeader = rangeHeader.substr(flavor.length).split('-');
                byteRange.from = parseInt(rangeHeader[0]);
                byteRange.to = parseInt(rangeHeader[1]);
                /* Replace empty fields of differential requests by absolute values */
                if (isNaN(byteRange.from) && !isNaN(byteRange.to)) {
                    byteRange.from = stat.size - byteRange.to;
                    byteRange.to = stat.size ? stat.size - 1 : 0;
                }
                else if (!isNaN(byteRange.from) && isNaN(byteRange.to)) {
                    byteRange.to = stat.size ? stat.size - 1 : 0;
                }
                /* General byte range validation */
                if (!isNaN(byteRange.from) && !!byteRange.to && 0 <= byteRange.from && byteRange.from < byteRange.to) {
                    byteRange.valid = true;
                }
                else {
                    console.warn("Request contains invalid range header: ", rangeHeader);
                }
            }
            else {
                console.warn("Request contains unsupported range header: ", rangeHeader);
            }
        }
        return byteRange;
    }
}
exports.Server = Server;
//# sourceMappingURL=node-static.js.map