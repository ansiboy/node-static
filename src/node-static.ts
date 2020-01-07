import fs = require('fs')
import url = require('url')
import http = require('http')
import mime = require('mime')
import { errors } from './errors';
import { VirtualDirectory } from './virtual-path'
import { Readable } from "stream";

interface ServerOptions {
    headers?: HttpHeaders
    indexFile?: string
    serverInfo?: string
}

type HttpHeaders = { [key: string]: string }
var version = require("../package.json")["version"];

export enum StatusCode {
    NotFound = 404,
    OK = 200,
    Redirect = 301,
    BadRequest = 400,
    Forbidden = 403,
}

let errorPages = {
    NotFound: "Not Found",
    Forbidden: "Forbidden",
    BadRequest: "Bad Request"
}

type ServeResult = { statusCode: StatusCode, fileStream: Readable, physicalPath?: string };

export class Server {
    private options: ServerOptions
    private rootDir: VirtualDirectory;

    constructor(root: string | VirtualDirectory, options?: ServerOptions) {
        if (!root) throw errors.argumentNull("root");

        this.options = options = options || {};
        if (typeof root == "string")
            this.rootDir = new VirtualDirectory(root);
        else
            this.rootDir = root;

        this.options.headers = this.options.headers || {};
        this.options.indexFile = this.options.indexFile || "index.html";

        this.options.headers = Object.assign({
            server: 'node-static/' + version
        }, this.options.headers)
    }

    async serve(req: http.IncomingMessage, res: http.ServerResponse) {

        var pathname: string;
        let r: ServeResult;
        try {
            pathname = decodeURI(url.parse(req.url).pathname);
        }
        catch (e) {
            r = { statusCode: StatusCode.BadRequest, fileStream: this.createReadble(errorPages.BadRequest) }
        }

        if (pathname)
            r = await this.servePath(pathname);

        //======================================
        let headers: http.OutgoingHttpHeaders = {
            "Date": new Date().toUTCString(),
        };

        let stat = fs.statSync(r.physicalPath);
        let mtime: number = stat.mtime.valueOf();
        Object.assign(headers, {
            "Etag": JSON.stringify([stat.ino, stat.size, mtime].join('-')),
            "Last-Modified": stat.mtime.toDateString(),
            "Content-Type": req.headers["Content-Type"] || mime.getType(r.physicalPath),
            "Content-Length": stat.size
        })

        if (r.physicalPath) {
            headers["Physical-Path"] = r.physicalPath;
        }

        res.writeHead(r.statusCode, headers);
        r.fileStream.pipe(res);
    }


    private async serveDir(dir: VirtualDirectory): Promise<ServeResult> {

        let htmlIndex = dir.getFile(this.options.indexFile);

        if (!fs.existsSync(htmlIndex)) {
            return { statusCode: StatusCode.NotFound, fileStream: this.createReadble(errorPages.NotFound) };
        }

        let stream = fs.createReadStream(htmlIndex);

        return { statusCode: StatusCode.OK, fileStream: stream, physicalPath: htmlIndex };
    }

    private createReadble(text: string) {
        let r = new Readable();
        r.push(Buffer.from(text));
        r.push(null);
        return r;
    }

    protected async servePath(pathname: string): Promise<ServeResult> {

        let physicalPath = this.resolve(pathname);
        if (!physicalPath) {
            return { statusCode: StatusCode.Forbidden, fileStream: this.createReadble(errorPages.NotFound) };
        }

        if (typeof physicalPath == "string") {
            if (!fs.existsSync(physicalPath))
                return { statusCode: StatusCode.NotFound, fileStream: this.createReadble(errorPages.NotFound) };

            let stream = fs.createReadStream(physicalPath);
            return { statusCode: StatusCode.OK, fileStream: stream, physicalPath }
        }

        return this.serveDir(physicalPath);
    }

    /** 将路径转化为物理路径 */
    private resolve(pathname: string): string | VirtualDirectory {
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