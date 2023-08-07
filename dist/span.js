"use strict";
var _Span_ref;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Span = void 0;
const tslib_1 = require("tslib");
const extension_wrapper_1 = require("./extension_wrapper");
const data_1 = require("./internal/data");
class Span {
    constructor(ref) {
        _Span_ref.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _Span_ref, ref, "f");
    }
    close() {
        extension_wrapper_1.span.closeSpan(tslib_1.__classPrivateFieldGet(this, _Span_ref, "f"));
        return this;
    }
    setError(name, message, stackdata) {
        const parsedStackdata = data_1.Data.generate(stackdata.split("\n"));
        extension_wrapper_1.span.addSpanError(tslib_1.__classPrivateFieldGet(this, _Span_ref, "f"), name, message, parsedStackdata);
        return this;
    }
    /**
     * Returns a SpanData object representing the internal Span in the extension.
     *
     * @private
     */
    toObject() {
        const json = extension_wrapper_1.span.spanToJSON(tslib_1.__classPrivateFieldGet(this, _Span_ref, "f"));
        // If the span JSON is empty, the span has been closed.
        if (json.trim() === "") {
            return { closed: true };
        }
        return JSON.parse(json);
    }
}
exports.Span = Span;
_Span_ref = new WeakMap();
