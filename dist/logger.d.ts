import { Client } from "./client";
export type LoggerLevel = "trace" | "debug" | "info" | "log" | "warn" | "error";
export type LoggerAttributes = Record<string, string | number | boolean>;
export declare const LOGGER_LEVEL_SEVERITY: Record<LoggerLevel, number>;
export type LoggerFormat = "plaintext" | "logfmt" | "json";
export declare const LOGGER_FORMAT: Record<LoggerFormat, number>;
export interface Logger {
    trace(message: string, attributes?: LoggerAttributes): void;
    debug(message: string, attributes?: LoggerAttributes): void;
    info(message: string, attributes?: LoggerAttributes): void;
    log(message: string, attributes?: LoggerAttributes): void;
    warn(message: string, attributes?: LoggerAttributes): void;
    error(message: string, attributes?: LoggerAttributes): void;
}
export declare class BaseLogger implements Logger {
    #private;
    severityThreshold: number;
    format: number;
    constructor(client: Client, group: string, level?: LoggerLevel, format?: LoggerFormat);
    trace(message: string, attributes?: LoggerAttributes): void;
    debug(message: string, attributes?: LoggerAttributes): void;
    info(message: string, attributes?: LoggerAttributes): void;
    log(message: string, attributes?: LoggerAttributes): void;
    warn(message: string, attributes?: LoggerAttributes): void;
    error(message: string, attributes?: LoggerAttributes): void;
    private sendLog;
}
