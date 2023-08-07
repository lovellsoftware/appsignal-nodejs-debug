"use strict";
var _Probes_probes, _Probes_running, _BaseProbeRunner_timers;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Probes = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
/**
 * The Minutely probes object.
 */
class Probes {
    constructor({ run = true } = {}) {
        _Probes_probes.set(this, void 0);
        _Probes_running.set(this, true);
        tslib_1.__classPrivateFieldSet(this, _Probes_probes, new BaseProbeRunner(), "f");
        if (!run)
            this.stop();
    }
    stop() {
        tslib_1.__classPrivateFieldGet(this, _Probes_probes, "f").clear();
        tslib_1.__classPrivateFieldSet(this, _Probes_probes, new NoopProbeRunner(), "f");
        tslib_1.__classPrivateFieldSet(this, _Probes_running, false, "f");
        return this;
    }
    get isRunning() {
        return tslib_1.__classPrivateFieldGet(this, _Probes_running, "f");
    }
    get count() {
        return tslib_1.__classPrivateFieldGet(this, _Probes_probes, "f").count;
    }
    register(name, fn) {
        tslib_1.__classPrivateFieldGet(this, _Probes_probes, "f").register(name, fn);
        return this;
    }
    unregister(name) {
        tslib_1.__classPrivateFieldGet(this, _Probes_probes, "f").unregister(name);
        return this;
    }
    clear() {
        tslib_1.__classPrivateFieldGet(this, _Probes_probes, "f").clear();
        return this;
    }
}
exports.Probes = Probes;
_Probes_probes = new WeakMap(), _Probes_running = new WeakMap();
class BaseProbeRunner extends events_1.EventEmitter {
    constructor() {
        super();
        _BaseProbeRunner_timers.set(this, new Map());
    }
    /**
     * Number of probes that are registered.
     */
    get count() {
        return tslib_1.__classPrivateFieldGet(this, _BaseProbeRunner_timers, "f").size;
    }
    /**
     * Registers a new minutely probe. Using a probe `name` that has already been set
     * will overwrite the current probe.
     */
    register(name, fn) {
        tslib_1.__classPrivateFieldGet(this, _BaseProbeRunner_timers, "f").set(name, setInterval(() => this.emit(name), 60 * 1000));
        this.removeAllListeners(name);
        this.on(name, fn);
    }
    unregister(name) {
        const timer = tslib_1.__classPrivateFieldGet(this, _BaseProbeRunner_timers, "f").get(name);
        if (typeof timer !== "undefined") {
            clearInterval(timer);
            tslib_1.__classPrivateFieldGet(this, _BaseProbeRunner_timers, "f").delete(name);
            this.removeAllListeners(name);
        }
    }
    /**
     * Unregisters all probes and clears the timers.
     */
    clear() {
        tslib_1.__classPrivateFieldGet(this, _BaseProbeRunner_timers, "f").forEach(t => clearInterval(t));
        tslib_1.__classPrivateFieldSet(this, _BaseProbeRunner_timers, new Map(), "f");
        this.removeAllListeners();
    }
}
_BaseProbeRunner_timers = new WeakMap();
class NoopProbeRunner {
    constructor() {
        this.count = 0;
    }
    register(_name, _fn) {
        return;
    }
    unregister(_name) {
        return;
    }
    clear() {
        return;
    }
}
