import Transport, { TransportStreamOptions } from "winston-transport";
export type WinstonTransportOptions = {
    group: string;
} & TransportStreamOptions;
export declare class WinstonTransport extends Transport {
    #private;
    constructor({ group, ...opts }: WinstonTransportOptions);
    log(info: any, callback: () => void): void;
    private parseInfo;
}
