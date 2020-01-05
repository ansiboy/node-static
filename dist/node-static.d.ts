/// <reference types="node" />
import http = require('http');
import events = require('events');
interface ServerOptions {
    headers?: HttpHeaders;
    indexFile?: string;
    cache?: number;
    serverInfo?: string;
    gzip?: boolean | RegExp;
    externalPaths?: string[];
    virtualPaths?: {
        [virtualPath: string]: string;
    };
}
declare type HttpHeaders = {
    [key: string]: string;
};
export declare class Server {
    private root;
    private externalPaths;
    private options;
    private cache;
    private defaultHeaders;
    private serverInfo;
    private virtualPaths;
    constructor(root: string, options?: ServerOptions);
    private serveDir;
    private serveFile;
    private finish;
    private servePath;
    private respond;
    /** 将路径转化为物理路径 */
    private resolve;
    serve(req: http.IncomingMessage, res: http.ServerResponse, callback?: Function): void | events.EventEmitter;
    private gzipOk;
    private respondGzip;
    private respondNoGzip;
    private stream;
    parseByteRange(req: any, stat: any): {
        from: number;
        to: number;
        valid: boolean;
    };
}
export {};
