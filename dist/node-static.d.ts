/// <reference types="node" />
import http = require('http');
import { VirtualDirectory } from './virtual-path';
import { Readable } from "stream";
interface ServerOptions {
    headers?: HttpHeaders;
    indexFile?: string;
    serverInfo?: string;
    externalPaths?: string[];
    virtualPaths?: {
        [virtualPath: string]: string;
    };
}
declare type HttpHeaders = {
    [key: string]: string;
};
export declare enum StatusCode {
    NotFound = 404,
    OK = 200,
    Redirect = 301,
    BadRequest = 400,
    Forbidden = 403
}
export declare class Server {
    private options;
    private defaultHeaders;
    private serverInfo;
    private rootDir;
    constructor(root: string | VirtualDirectory, options?: ServerOptions);
    serve(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
    private serveDir;
    private createReadble;
    private finish;
    protected servePath(pathname: string): Promise<{
        statusCode: StatusCode;
        fileStream: Readable;
    }>;
    /** 将路径转化为物理路径 */
    private resolve;
    private respondNoGzip;
    private stream;
    parseByteRange(req: any, stat: any): {
        from: number;
        to: number;
        valid: boolean;
    };
}
export {};
