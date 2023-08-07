"use strict";
var _BaseLogger_client, _BaseLogger_group;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLogger = exports.LOGGER_FORMAT = exports.LOGGER_LEVEL_SEVERITY = void 0;
const tslib_1 = require("tslib");
exports.LOGGER_LEVEL_SEVERITY = {
    trace: 1,
    debug: 2,
    info: 3,
    log: 4,
    warn: 5,
    error: 6
};
const UNKNOWN_SEVERITY = 0;
function severity(level) {
    var _a;
    return (_a = exports.LOGGER_LEVEL_SEVERITY[level]) !== null && _a !== void 0 ? _a : UNKNOWN_SEVERITY;
}
exports.LOGGER_FORMAT = {
    plaintext: 0,
    logfmt: 1,
    json: 2
};
const UNKNOWN_FORMAT = -1;
function get_format(format) {
    var _a;
    return (_a = exports.LOGGER_FORMAT[format]) !== null && _a !== void 0 ? _a : UNKNOWN_FORMAT;
}
class BaseLogger {
    constructor(client, group, level = "info", format = "plaintext") {
        _BaseLogger_client.set(this, void 0);
        _BaseLogger_group.set(this, void 0);
        if (typeof group != "string") {
            throw new TypeError(`Logger group name must be a string; ${typeof group} given`);
        }
        tslib_1.__classPrivateFieldSet(this, _BaseLogger_client, client, "f");
        tslib_1.__classPrivateFieldSet(this, _BaseLogger_group, group, "f");
        this.severityThreshold = severity(level);
        this.format = get_format(format);
        if (this.severityThreshold == UNKNOWN_SEVERITY) {
            tslib_1.__classPrivateFieldGet(this, _BaseLogger_client, "f").integrationLogger.warn(`Logger level must be "trace", "debug", "info", "log", "warn" or "error", ` +
                `but "${level}" was given. Logger level set to "info".`);
            this.severityThreshold = severity("info");
        }
        if (this.format == UNKNOWN_FORMAT) {
            tslib_1.__classPrivateFieldGet(this, _BaseLogger_client, "f").integrationLogger.warn(`Logger format must be "plaintext", "logfmt", or "json", ` +
                `but "${format}" was given. Logger format set to "plaintext".`);
            this.format = 0;
        }
    }
    trace(message, attributes) {
        this.sendLog(severity("trace"), message, attributes);
    }
    debug(message, attributes) {
        this.sendLog(severity("debug"), message, attributes);
    }
    info(message, attributes) {
        this.sendLog(severity("info"), message, attributes);
    }
    log(message, attributes) {
        this.sendLog(severity("log"), message, attributes);
    }
    warn(message, attributes) {
        this.sendLog(severity("warn"), message, attributes);
    }
    error(message, attributes) {
        this.sendLog(severity("error"), message, attributes);
    }
    sendLog(severity, message, attributes = {}) {
        if (severity < this.severityThreshold) {
            return;
        }
        tslib_1.__classPrivateFieldGet(this, _BaseLogger_client, "f").extension.log(tslib_1.__classPrivateFieldGet(this, _BaseLogger_group, "f"), severity, this.format, String(message), attributes);
    }
}
exports.BaseLogger = BaseLogger;
_BaseLogger_client = new WeakMap(), _BaseLogger_group = new WeakMap();
