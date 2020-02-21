/// <reference types="node" />
import http = require('http');
import { VirtualDirectory } from './virtual-path';
import { Readable } from "stream";
import { StatusCode } from "maishu-chitu-service";
export { StatusCode } from "maishu-chitu-service";
interface ServerOptions {
    headers?: HttpHeaders;
    indexFile?: string;
    serverInfo?: string;
}
declare type HttpHeaders = {
    [key: string]: string;
};
declare type ServeResult = {
    statusCode: StatusCode;
    fileStream: Readable;
    physicalPath?: string | null;
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
