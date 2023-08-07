"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demo = void 0;
const crypto_1 = require("crypto");
const utils_1 = require("./utils");
/**
 * Sends a demonstration/test sample for a exception and a performance issue.
 *
 * Note that the agent must be active for at least 60 seconds in order for the payload
 * to be sent to AppSignal.
 */
function demo(client) {
    const { sec: startSec, nsec: startNsec } = (0, utils_1.hrTime)();
    const traceId = (0, crypto_1.randomBytes)(10).toString("base64");
    const rootSpanId = (0, crypto_1.randomBytes)(10).toString("base64");
    const childSpanId = (0, crypto_1.randomBytes)(10).toString("base64");
    // Performance sample
    const performanceRootSpan = client.extension.createOpenTelemetrySpan(rootSpanId, "", traceId, startSec, startNsec, startSec + 1, startNsec * 1.2, "GET /demo", { demo_sample: true }, "@opentelemetry/instrumentation-http");
    performanceRootSpan.close();
    const performanceChildSpan = client.extension.createOpenTelemetrySpan(childSpanId, rootSpanId, traceId, startSec, startNsec * 1.2, startSec + 1, startNsec, "request handler - /", { "express.type": "request_handler" }, "@opentelemetry/instrumentation-express");
    performanceChildSpan.close();
    // Error sample
    const errorTraceId = (0, crypto_1.randomBytes)(10).toString("base64");
    const errorRootSpanId = (0, crypto_1.randomBytes)(10).toString("base64");
    const errorRootSpan = client.extension.createOpenTelemetrySpan(errorRootSpanId, "", errorTraceId, startSec, startNsec, startSec + 1, startNsec + 200, "GET /demo", { demo_sample: true }, "@opentelemetry/instrumentation-http");
    try {
        throw new Error("Hello world! This is an error used for demonstration purposes.");
    }
    catch (error) {
        if (error instanceof Error) {
            errorRootSpan.setError(error.name, error.message, error.stack);
        }
    }
    errorRootSpan.close();
}
exports.demo = demo;
