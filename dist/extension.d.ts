import { Span } from "./span";
/**
 * The public interface for the extension.
 *
 * @class
 */
export declare class Extension {
    static isLoaded: boolean;
    constructor(options?: {
        active: boolean;
    });
    /**
     * Starts the extension.
     */
    start(): void;
    /**
     * Stops the extension.
     */
    stop(): void;
    createOpenTelemetrySpan(spanId: string, parentSpanId: string, traceId: string, startTimeSec: number, startTimeNsec: number, endTimeSec: number, endTimeNsec: number, name: string, attributes: Record<string, any>, instrumentationLibraryName: string): Span;
    diagnose(): object;
    log(group: string, severity: number, format: number, message: string, attributes: any): void;
    /**
     * Determines if the app is running inside a container
     */
    runningInContainer(): boolean;
}
