export type SpanData = {
    closed?: boolean;
    name?: string;
    namespace?: string;
    parent_span_id?: string;
    span_id?: string;
    start_time_seconds?: number;
    start_time_nanoseconds?: number;
    trace_id?: string;
    error?: {
        name: string;
        message: string;
        backtrace_json: string;
        backtrace: string[];
    };
    attributes?: {
        [key: string]: string;
    };
};
export declare class Span {
    #private;
    constructor(ref: unknown);
    close(): this;
    setError(name: string, message: string, stackdata: string): this;
    /**
     * Returns a SpanData object representing the internal Span in the extension.
     *
     * @private
     */
    toObject(): SpanData;
}
