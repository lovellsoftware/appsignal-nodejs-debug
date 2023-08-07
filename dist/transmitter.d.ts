/// <reference types="node" />
/// <reference types="node" />
import http from "http";
import { URLSearchParams } from "url";
declare const REDIRECT_COUNT: unique symbol;
type TransmitterRequestOptions = {
    method: string;
    params?: URLSearchParams;
    callback: ((stream: http.IncomingMessage) => void) & {
        [REDIRECT_COUNT]?: number;
    };
    onError: (error: Error) => void;
};
export declare class Transmitter {
    #private;
    constructor(url: string, body?: string);
    downloadStream(): Promise<http.IncomingMessage>;
    transmit(): Promise<{
        status: number;
        body: any;
    }>;
    request(requestOptions: TransmitterRequestOptions): void;
    private handleRedirectsCallback;
    private getLocationHeader;
    private configParams;
    private requestModule;
    private writeRequest;
    private urlRequestOptions;
    private paramsRequestOptions;
    private bodyRequestOptions;
    private caRequestOptions;
}
export {};
