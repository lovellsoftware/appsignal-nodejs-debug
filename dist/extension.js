"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extension = void 0;
const extension_wrapper_1 = require("./extension_wrapper");
const span_1 = require("./span");
const data_1 = require("./internal/data");
/**
 * The public interface for the extension.
 *
 * @class
 */
class Extension {
    constructor(options) {
        if (options === null || options === void 0 ? void 0 : options.active)
            this.start();
    }
    /**
     * Starts the extension.
     */
    start() {
        extension_wrapper_1.extension.start();
    }
    /**
     * Stops the extension.
     */
    stop() {
        extension_wrapper_1.extension.stop();
    }
    createOpenTelemetrySpan(spanId, parentSpanId, traceId, startTimeSec, startTimeNsec, endTimeSec, endTimeNsec, name, attributes, instrumentationLibraryName) {
        const ref = extension_wrapper_1.extension.createOpenTelemetrySpan(spanId, parentSpanId, traceId, startTimeSec, startTimeNsec, endTimeSec, endTimeNsec, name, data_1.Data.generate(attributes), instrumentationLibraryName);
        return new span_1.Span(ref);
    }
    diagnose() {
        process.env._APPSIGNAL_DIAGNOSE = "true";
        const diagnostics_report_string = extension_wrapper_1.extension.diagnoseRaw();
        delete process.env._APPSIGNAL_DIAGNOSE;
        try {
            return JSON.parse(diagnostics_report_string);
        }
        catch (error) {
            return {
                error: error,
                output: (diagnostics_report_string || "").split("\n")
            };
        }
    }
    log(group, severity, format, message, attributes) {
        extension_wrapper_1.extension.log(group, severity, format, message, data_1.Data.generate(attributes));
    }
    /**
     * Determines if the app is running inside a container
     */
    runningInContainer() {
        return extension_wrapper_1.extension.runningInContainer();
    }
}
Extension.isLoaded = extension_wrapper_1.isLoaded;
exports.Extension = Extension;
