import type { Span, AttributeValue } from "@opentelemetry/api";
export declare function setParams(params: any, span?: Span): void;
export declare function setSessionData(sessionData: any, span?: Span): void;
export declare function setCustomData(customData: any, span?: Span): void;
export declare function setTag(tag: string, value: AttributeValue, span?: Span): void;
export declare function setHeader(header: string, value: AttributeValue, span?: Span): void;
export declare function setName(name: string, span?: Span): void;
export declare function setCategory(category: string, span?: Span): void;
export declare function setBody(body: string, span?: Span): void;
export declare function setNamespace(namespace: string, span?: Span): void;
export declare function setRootName(name: string, span?: Span): void;
export declare function setError(error: Error, span?: Span): void;
export declare function sendError(error: Error, fn?: () => void): void;
/**
 * @deprecated This function is no longer required for manual instrumentation.
 */
export declare function instrumentationsLoaded(): Promise<void>;
