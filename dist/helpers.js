"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instrumentationsLoaded = exports.sendError = exports.setError = exports.setRootName = exports.setNamespace = exports.setBody = exports.setCategory = exports.setName = exports.setHeader = exports.setTag = exports.setCustomData = exports.setSessionData = exports.setParams = void 0;
const api_1 = require("@opentelemetry/api");
const client_1 = require("./client");
function setAttribute(attribute, value, span) {
    const activeSpan = span !== null && span !== void 0 ? span : api_1.trace.getActiveSpan();
    if (activeSpan) {
        activeSpan.setAttribute(attribute, value);
    }
    else {
        const splitAttributes = attribute.split(".");
        const attributeSuffix = splitAttributes[splitAttributes.length - 1];
        client_1.Client.integrationLogger.debug(`There is no active span, cannot set \`${attributeSuffix}\``);
    }
}
function circularReplacer() {
    const seenValue = [];
    const seenKey = [];
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            const i = seenValue.indexOf(value);
            if (i !== -1) {
                return `[cyclic value: ${seenKey[i] || "root object"}]`;
            }
            else {
                seenValue.push(value);
                seenKey.push(key);
            }
        }
        return value;
    };
}
function setSerialisedAttribute(attribute, value, span) {
    const serialisedValue = JSON.stringify(value, circularReplacer());
    if (serialisedValue) {
        setAttribute(attribute, serialisedValue, span);
    }
}
function setPrefixedAttribute(prefix, suffix, value, span) {
    if (suffix) {
        setAttribute(`${prefix}.${suffix}`, value, span);
    }
}
function setParams(params, span) {
    setSerialisedAttribute("appsignal.request.parameters", params, span);
}
exports.setParams = setParams;
function setSessionData(sessionData, span) {
    setSerialisedAttribute("appsignal.request.session_data", sessionData, span);
}
exports.setSessionData = setSessionData;
function setCustomData(customData, span) {
    setSerialisedAttribute("appsignal.custom_data", customData, span);
}
exports.setCustomData = setCustomData;
function setTag(tag, value, span) {
    setPrefixedAttribute("appsignal.tag", tag, value, span);
}
exports.setTag = setTag;
function setHeader(header, value, span) {
    setPrefixedAttribute("appsignal.request.headers", header, value, span);
}
exports.setHeader = setHeader;
function setName(name, span) {
    setAttribute("appsignal.name", name, span);
}
exports.setName = setName;
function setCategory(category, span) {
    setAttribute("appsignal.category", category, span);
}
exports.setCategory = setCategory;
function setBody(body, span) {
    setAttribute("appsignal.body", body, span);
}
exports.setBody = setBody;
function setNamespace(namespace, span) {
    setAttribute("appsignal.namespace", namespace, span);
}
exports.setNamespace = setNamespace;
function setRootName(name, span) {
    setAttribute("appsignal.root_name", name, span);
}
exports.setRootName = setRootName;
function setError(error, span) {
    if (error && error.name && error.message) {
        const activeSpan = span !== null && span !== void 0 ? span : api_1.trace.getActiveSpan();
        if (activeSpan) {
            activeSpan.recordException(error);
            activeSpan.setStatus({
                code: api_1.SpanStatusCode.ERROR,
                message: error.message
            });
        }
        else {
            client_1.Client.integrationLogger.debug(`There is no active span, cannot set \`${error.name}\``);
        }
    }
    else {
        client_1.Client.integrationLogger.debug("Cannot set error, it is not an `Error`-like object");
    }
}
exports.setError = setError;
function sendError(error, fn = () => { }) {
    if (error && error.name && error.message) {
        api_1.trace
            .getTracer("Appsignal.sendError")
            .startActiveSpan(error.name, { root: true }, span => {
            setError(error);
            fn();
            span.end();
        });
    }
    else {
        client_1.Client.integrationLogger.debug("Cannot send error, it is not an `Error`-like object");
    }
}
exports.sendError = sendError;
/**
 * @deprecated This function is no longer required for manual instrumentation.
 */
function instrumentationsLoaded() {
    client_1.Client.integrationLogger.warn("instrumentationsLoaded() is deprecated, please remove it from your code as it'll be deleted in the next major release.");
    return Promise.resolve();
}
exports.instrumentationsLoaded = instrumentationsLoaded;
