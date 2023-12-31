"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.PROBE_NAME = void 0;
const tslib_1 = require("tslib");
const v8_1 = tslib_1.__importDefault(require("v8"));
const os_1 = tslib_1.__importDefault(require("os"));
const client_1 = require("../../client");
exports.PROBE_NAME = "v8_stats";
function init(meter) {
    console.log('----------------Init is called on v8');

    (() => {
        const { total_heap_size, total_heap_size_executable, total_physical_size, used_heap_size, malloced_memory, number_of_native_contexts, number_of_detached_contexts } = v8_1.default.getHeapStatistics();
        console.log('*************', {
        total_heap_size, total_heap_size_executable, total_physical_size, used_heap_size, malloced_memory, number_of_native_contexts, number_of_detached_contexts
    })})();
    setInterval(() => {
        console.log('-----------------Firing Heap Collection');
        const { total_heap_size, total_heap_size_executable, total_physical_size, used_heap_size, malloced_memory, number_of_native_contexts, number_of_detached_contexts } = v8_1.default.getHeapStatistics();
        console.log('*************', {
            total_heap_size, total_heap_size_executable, total_physical_size, used_heap_size, malloced_memory, number_of_native_contexts, number_of_detached_contexts
        });
    }, 30000);
    function setGauge(key, value) {
        const hostname = client_1.Client.config.data.hostname || os_1.default.hostname();
        console.log('-------------------', { key, value, hostname });
        meter.setGauge(key, value, { hostname });
    }
    return function () {
        console.log('------------------Getting data from v8');
        const { total_heap_size, total_heap_size_executable, total_physical_size, used_heap_size, malloced_memory, number_of_native_contexts, number_of_detached_contexts } = v8_1.default.getHeapStatistics();
        console.log('----------v8 data retrieved', { total_heap_size, total_heap_size_executable, total_physical_size, used_heap_size, malloced_memory, number_of_native_contexts, number_of_detached_contexts });
        setGauge("nodejs_total_heap_size", total_heap_size);
        setGauge("nodejs_total_heap_size_executable", total_heap_size_executable);
        setGauge("nodejs_total_physical_size", total_physical_size);
        setGauge("nodejs_used_heap_size", used_heap_size);
        setGauge("nodejs_malloced_memory", malloced_memory);
        setGauge("nodejs_number_of_native_contexts", number_of_native_contexts);
        setGauge("nodejs_number_of_detached_contexts", number_of_detached_contexts);
    };
}
exports.init = init;
