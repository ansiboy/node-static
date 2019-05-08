/// <reference types="node" />
import http = require('http');
import events = require('events');
interface ServerOptions {
    headers?: HttpHeaders;
    indexFile?: string;
    cache?: number;
    serverInfo?: string;
    gzip?: boolean | RegExp;
}
declare type HttpHeaders = {
    [key: string]: string;
};
export declare class Server {
    private root;
    private options;
    private cache;
    private defaultHeaders;
    private serverInfo;
    constructor(root: string, options?: ServerOptions);
    serveDir(pathname: any, req: http.IncomingMessage, res: http.ServerResponse, finish: any): void;
    serveFile(pathname: string, status: number, headers: HttpHeaders, req: http.IncomingMessage, res: http.ServerResponse): events.EventEmitter;
    finish(status: any, headers: any, req: any, res: any, promise: any, callback?: Function): void;
    servePath(pathname: any, status: any, headers: any, req: any, res: any, finish: any): events.EventEmitter;
    respond(pathname: any, status: any, _headers: any, files: any, stat: any, req: any, res: any, finish: any): void;
    resolve(pathname: string): string;
    serve(req: http.IncomingMessage, res: http.ServerResponse, callback?: Function): void | events.EventEmitter;
    gzipOk(req: any, contentType: any): boolean;
    respondGzip(pathname: string, status: number, contentType: string, _headers: Headers, files: any, stat: any, req: any, res: any, finish: any): void;
    respondNoGzip(pathname: any, status: any, contentType: any, _headers: any, files: any, stat: any, req: any, res: any, finish: any): void;
    stream(pathname: any, files: any, length: any, startByte: any, res: any, callback: any): void;
    parseByteRange(req: any, stat: any): {
        from: number;
        to: number;
        valid: boolean;
    };
}
export {};
