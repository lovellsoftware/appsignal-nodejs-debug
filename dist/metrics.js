"use strict";
var _Metrics_probes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metrics = void 0;
const tslib_1 = require("tslib");
const probes_1 = require("./probes");
const extension_wrapper_1 = require("./extension_wrapper");
const data_1 = require("./internal/data");
/**
 * The metrics object.
 *
 * @class
 */
class Metrics {
    constructor() {
        console.info('App Signal metrics probe being set');
        _Metrics_probes.set(this, void 0);
        const enableMinutelyProbes = global.__APPSIGNAL__.config.data.enableMinutelyProbes;
        tslib_1.__classPrivateFieldSet(this, _Metrics_probes, new probes_1.Probes({ run: enableMinutelyProbes }), "f");
        console.info('App Signal minutelyProbes enabled:', enableMinutelyProbes);
    }
    /**
     * A gauge is a metric value at a specific time. If you set more
     * than one gauge with the same key, the latest value for that
     * moment in time is persisted.
     *
     * Gauges are used for things like tracking sizes of databases, disks,
     * or other absolute values like CPU usage, a numbers of items (users,
     * accounts, etc.). Currently all AppSignal host metrics are stored
     * as gauges.
     */
    setGauge(key, value, tags) {
        if (!key || typeof value !== "number")
            return this;
        extension_wrapper_1.metrics.setGauge(key, value, data_1.Data.generate(tags || {}));
        return this;
    }
    /**
     * Measurements are used for things like response times. We allow you to
     * track a metric with wildly varying values over time and create graphs
     * based on their average value or call count during that time.
     *
     * By tracking a measurement, the average and count will be persisted for
     * the metric. A measurement metric creates several metric fields:
     *
     * - `COUNT`, which counts how many times the helper was called
     * - `MEAN`, the average metric value for the point in time.
     * - `P90`, the 90th percentile of the metric value for the point in time.
     * - `P95`, the 95th percentile of the metric value for the point in time.
     */
    addDistributionValue(key, value, tags) {
        if (!key || typeof value !== "number")
            return this;
        extension_wrapper_1.metrics.addDistributionValue(key, value, data_1.Data.generate(tags || {}));
        return this;
    }
    /**
     * The counter metric type stores a number value for a given time frame. These
     * counter values are combined into a total count value for the display time
     * frame resolution. This means that when viewing a graph with a minutely
     * resolution it will combine the values of the given minute, and for the
     * hourly resolution combines the values of per hour.
     *
     * Counters are good to use to track events. With a gauge you can track how
     * many of something (users, comments, etc.) there is at a certain time, but
     * with events you can track how many events occurred at a specific time
     * (users signing in, comments being made, etc.).
     *
     * When this method is called multiple times, the total/sum of all calls is persisted.
     */
    incrementCounter(key, value, tags) {
        if (!key || typeof value !== "number")
            return this;
        extension_wrapper_1.metrics.incrementCounter(key, value, data_1.Data.generate(tags || {}));
        return this;
    }
    /**
     * Minutely probes allow the AppSignal module to collect custom metrics
     * for integrations and app-specific metrics by calling a user-defined function
     * every minute.
     */
    probes() {
        console.info('We have a metrics probe');
        return tslib_1.__classPrivateFieldGet(this, _Metrics_probes, "f");
    }
}
exports.Metrics = Metrics;
_Metrics_probes = new WeakMap();
