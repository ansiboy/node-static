/// <reference types="node" />
import http = require('http');
import { VirtualDirectory } from './virtual-path';
import { Readable } from "stream";
interface ServerOptions {
    headers?: HttpHeaders;
    indexFile?: string;
    serverInfo?: string;
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
declare type ServeResult = {
    statusCode: StatusCode;
    fileStream: Readable;
    physicalPath?: string;
};
export declare class Server {
    private options;
    private rootDir;
    constructor(root: string | VirtualDirectory, options?: ServerOptions);
    serve(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
    private serveDir;
    private createReadble;
    protected servePath(pathname: string): Promise<ServeResult>;
    /** 将路径转化为物理路径 */
    private resolve;
}
export {};
