"use strict";
var _TestModeSpanProcessor_filePath;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestModeSpanProcessor = exports.SpanProcessor = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const api_1 = require("@opentelemetry/api");
const core_1 = require("@opentelemetry/core");
class SpanProcessor {
    constructor(client) {
        this.client = client;
    }
    forceFlush() {
        return Promise.resolve();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onStart(_span, _parentContext) { }
    onEnd(span) {
        // Add OpenTelemetry kind enum value as a magic attribute
        const spanAttributes = {
            ...span.attributes,
            "appsignal.kind": api_1.SpanKind[span.kind]
        };
        const opentelemetrySpan = this.client.extension.createOpenTelemetrySpan(span.spanContext().spanId, span.parentSpanId || "", span.spanContext().traceId, span.startTime[0], span.startTime[1], span.endTime[0], span.endTime[1], span.name, spanAttributes, span.instrumentationLibrary.name);
        const errors = span.events.filter(event => event.name == "exception");
        errors.forEach(e => {
            const eventAttributes = e["attributes"];
            if (typeof eventAttributes["exception.type"] === "string" &&
                typeof eventAttributes["exception.message"] === "string" &&
                typeof eventAttributes["exception.stacktrace"] === "string") {
                opentelemetrySpan.setError(eventAttributes["exception.type"], eventAttributes["exception.message"], eventAttributes["exception.stacktrace"]);
            }
        });
        opentelemetrySpan.close();
    }
    shutdown() {
        return Promise.resolve();
    }
}
exports.SpanProcessor = SpanProcessor;
class TestModeSpanProcessor {
    constructor(testModeFilePath) {
        _TestModeSpanProcessor_filePath.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _TestModeSpanProcessor_filePath, testModeFilePath, "f");
    }
    forceFlush() {
        return Promise.resolve();
    }
    onStart(_span, _parentContext) {
        // Does nothing
    }
    onEnd(span) {
        // must grab specific attributes only because
        // the span is a circular object
        const serializableSpan = {
            attributes: span.attributes,
            events: span.events,
            status: span.status,
            name: span.name,
            spanId: span._spanContext.spanId,
            traceId: span._spanContext.traceId,
            parentSpanId: span.parentSpanId,
            instrumentationLibrary: span.instrumentationLibrary,
            startTime: span.startTime,
            endTime: span.endTime
        };
        // As `fs` is an automatically instrumented module by default, we supress tracing during
        // its usage here so it doesn't fail nor contaminate actual traces.
        api_1.context.with((0, core_1.suppressTracing)(api_1.context.active()), () => {
            // Re-open the file for every write, as the test process might have
            // truncated it in between writes.
            const file = fs.openSync(tslib_1.__classPrivateFieldGet(this, _TestModeSpanProcessor_filePath, "f"), "a");
            fs.appendFileSync(file, `${JSON.stringify(serializableSpan)}\n`);
            fs.closeSync(file);
        });
    }
    shutdown() {
        return Promise.resolve();
    }
}
exports.TestModeSpanProcessor = TestModeSpanProcessor;
_TestModeSpanProcessor_filePath = new WeakMap();
