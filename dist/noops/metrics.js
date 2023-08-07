"use strict";
var _NoopMetrics_probes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoopMetrics = void 0;
const tslib_1 = require("tslib");
const metrics_1 = require("../metrics");
const probes_1 = require("../probes");
class NoopMetrics extends metrics_1.Metrics {
    constructor() {
        super(...arguments);
        _NoopMetrics_probes.set(this, new probes_1.Probes({ run: false }));
    }
    setGauge(_key, _value, _tags) {
        return this;
    }
    addDistributionValue(_key, _value, _tags) {
        return this;
    }
    incrementCounter(_key, _value, _tags) {
        return this;
    }
    probes() {
        return tslib_1.__classPrivateFieldGet(this, _NoopMetrics_probes, "f");
    }
}
exports.NoopMetrics = NoopMetrics;
_NoopMetrics_probes = new WeakMap();
