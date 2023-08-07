"use strict";
var _WinstonTransport_group;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonTransport = void 0;
const tslib_1 = require("tslib");
const winston_transport_1 = tslib_1.__importDefault(require("winston-transport"));
const client_1 = require("./client");
const logger_1 = require("./logger");
const NPM_LOGGER_LEVEL_SEVERITY = {
    error: 6,
    warn: 5,
    info: 3,
    http: 3,
    verbose: 2,
    debug: 2,
    silly: 1
};
const SYSLOG_LOGGER_LEVEL_SEVERITY = {
    emerg: 9,
    alert: 8,
    crit: 7,
    error: 6,
    warning: 5,
    notice: 4,
    info: 3,
    debug: 2
};
const LOGGER_LEVEL_SEVERITY = {
    ...logger_1.LOGGER_LEVEL_SEVERITY,
    ...NPM_LOGGER_LEVEL_SEVERITY,
    ...SYSLOG_LOGGER_LEVEL_SEVERITY
};
const DEFAULT_SEVERITY = LOGGER_LEVEL_SEVERITY["info"];
function severity(level) {
    var _a;
    return (_a = LOGGER_LEVEL_SEVERITY[level]) !== null && _a !== void 0 ? _a : DEFAULT_SEVERITY;
}
class WinstonTransport extends winston_transport_1.default {
    constructor({ group, ...opts }) {
        super(opts);
        _WinstonTransport_group.set(this, void 0);
        if (typeof group != "string") {
            throw new TypeError(`Logger group name must be a string; ${typeof group} given`);
        }
        tslib_1.__classPrivateFieldSet(this, _WinstonTransport_group, group, "f");
    }
    log(info, callback) {
        setImmediate(() => {
            this.emit("logged", info);
        });
        const client = client_1.Client.client;
        if (!client || !client.isActive) {
            return;
        }
        const levelSeverity = severity(info[Symbol.for("level")]);
        const [message, attributes] = this.parseInfo(info);
        let group = undefined;
        if (typeof attributes["group"] == "string") {
            group = attributes["group"];
            delete attributes["group"];
        }
        client.extension.log(group || tslib_1.__classPrivateFieldGet(this, _WinstonTransport_group, "f"), levelSeverity, 0, message, attributes);
        callback();
    }
    parseInfo(info) {
        const splat = info[Symbol.for("splat")] || [];
        const extras = Object.fromEntries(Object.entries(info).filter(([key, _]) => typeof key != "symbol" &&
            key != "level" &&
            key != "message" &&
            // added by winston's `format.timestamp()`
            key != "timestamp" &&
            key.match(/^\d+$/) === null));
        const items = [info["message"], ...splat, extras];
        const stringItems = items.filter(item => {
            return (typeof item === "string" ||
                typeof item === "number" ||
                typeof item === "boolean" ||
                typeof item === "undefined" ||
                item === null);
        });
        const message = stringItems.map(item => String(item)).join(" ");
        const objectItems = items.filter(item => typeof item === "object" && !Array.isArray(item));
        const mergedObjectItems = objectItems.reduce((acc, x) => {
            return { ...acc, ...x };
        }, {});
        const attributes = Object.fromEntries(Object.entries(mergedObjectItems).filter(([_, value]) => typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"));
        return [message, attributes];
    }
}
exports.WinstonTransport = WinstonTransport;
_WinstonTransport_group = new WeakMap();
