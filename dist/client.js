"use strict";
var _Client_metrics, _Client_sdk;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const tslib_1 = require("tslib");
const extension_1 = require("./extension");
const config_1 = require("./config");
const metrics_1 = require("./metrics");
const gcProbe = tslib_1.__importStar(require("./probes/v8"));
const integration_logger_1 = require("./integration_logger");
const noops_1 = require("./noops");
const demo_1 = require("./demo");
const version_1 = require("./version");
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
const instrumentation_express_1 = require("@opentelemetry/instrumentation-express");
const instrumentation_fastify_1 = require("@opentelemetry/instrumentation-fastify");
const instrumentation_graphql_1 = require("@opentelemetry/instrumentation-graphql");
const instrumentation_http_1 = require("@opentelemetry/instrumentation-http");
const instrumentation_ioredis_1 = require("@opentelemetry/instrumentation-ioredis");
const instrumentation_knex_1 = require("@opentelemetry/instrumentation-knex");
const instrumentation_koa_1 = require("@opentelemetry/instrumentation-koa");
const instrumentation_mongodb_1 = require("@opentelemetry/instrumentation-mongodb");
const instrumentation_mongoose_1 = require("@opentelemetry/instrumentation-mongoose");
const instrumentation_mysql2_1 = require("@opentelemetry/instrumentation-mysql2");
const instrumentation_mysql_1 = require("@opentelemetry/instrumentation-mysql");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const instrumentation_nestjs_core_1 = require("@opentelemetry/instrumentation-nestjs-core");
const instrumentation_pg_1 = require("@opentelemetry/instrumentation-pg");
const instrumentation_1 = require("@prisma/instrumentation");
const serializer_1 = require("./instrumentation/redis/serializer");
const instrumentation_redis_4_1 = require("@opentelemetry/instrumentation-redis-4");
const instrumentation_redis_1 = require("@opentelemetry/instrumentation-redis");
const instrumentation_restify_1 = require("@opentelemetry/instrumentation-restify");
const span_processor_1 = require("./span_processor");
const DefaultInstrumentations = {
    "@opentelemetry/instrumentation-express": instrumentation_express_1.ExpressInstrumentation,
    "@opentelemetry/instrumentation-fastify": instrumentation_fastify_1.FastifyInstrumentation,
    "@opentelemetry/instrumentation-graphql": instrumentation_graphql_1.GraphQLInstrumentation,
    "@opentelemetry/instrumentation-http": instrumentation_http_1.HttpInstrumentation,
    "@opentelemetry/instrumentation-ioredis": instrumentation_ioredis_1.IORedisInstrumentation,
    "@opentelemetry/instrumentation-knex": instrumentation_knex_1.KnexInstrumentation,
    "@opentelemetry/instrumentation-koa": instrumentation_koa_1.KoaInstrumentation,
    "@opentelemetry/instrumentation-mongodb": instrumentation_mongodb_1.MongoDBInstrumentation,
    "@opentelemetry/instrumentation-mongoose": instrumentation_mongoose_1.MongooseInstrumentation,
    "@opentelemetry/instrumentation-mysql2": instrumentation_mysql2_1.MySQL2Instrumentation,
    "@opentelemetry/instrumentation-mysql": instrumentation_mysql_1.MySQLInstrumentation,
    "@opentelemetry/instrumentation-nestjs-core": instrumentation_nestjs_core_1.NestInstrumentation,
    "@opentelemetry/instrumentation-pg": instrumentation_pg_1.PgInstrumentation,
    "@opentelemetry/instrumentation-redis": instrumentation_redis_1.RedisInstrumentation,
    "@opentelemetry/instrumentation-redis-4": instrumentation_redis_4_1.RedisInstrumentation,
    "@opentelemetry/instrumentation-restify": instrumentation_restify_1.RestifyInstrumentation,
    "@prisma/instrumentation": instrumentation_1.PrismaInstrumentation
};

console.log('Client is imported');
/**
 * AppSignal for Node.js's main class.
 *
 * Provides methods to control the AppSignal instrumentation and the system
 * agent.
 *
 * @class
 */
class Client {
    /**
     * Global accessors for the AppSignal client
     */
    static get client() {
        console.log('Client client accessed');
        return global.__APPSIGNAL__;
    }
    /**
     * Global accessors for the AppSignal Config
     */
    static get config() {
        var _a;
        console.log('Client config accessed');
        return (_a = this.client) === null || _a === void 0 ? void 0 : _a.config;
    }
    /**
     * Global accessors for the AppSignal integration Logger
     */
    static get integrationLogger() {
        console.log('integratoin logger accessed');
        if (this.client) {
            return this.client.integrationLogger;
        }
        else {
            return noops_1.noopIntegrationLogger;
        }
    }
    /**
     * Global accessors for the AppSignal Logger API
     */
    static logger(group, level = "info", format = "plaintext") {
        if (this.client) {
            return this.client.logger(group, level, format);
        }
        else {
            return noops_1.noopLogger;
        }
    }
    /**
     * Creates a new instance of the `Appsignal` object
     */
    constructor(options = {}) {
        console.log('New appSignal object is being created');
        this.VERSION = version_1.VERSION;
        console.log('Client version is set');
        _Client_metrics.set(this, void 0);
        _Client_sdk.set(this, void 0);
        this.config = new config_1.Configuration(options);
        console.log('Client config is set');
        console.log('-------------', this.config);
        this.extension = new extension_1.Extension();
        console.log('extension is set');
        this.integrationLogger = this.setUpIntegrationLogger();
        console.log('integration logger is set');
        console.oog('------------------------isActive:', isActive);
        this.storeInGlobal();
        if (this.isActive) {
            if (process.env._APPSIGNAL_DIAGNOSE === "true") {
                console.warn('Diagnose mode is enabled, not starting extension, SDK, or probes');
                Client.integrationLogger.info("Diagnose mode is enabled, not starting extension, SDK and probes");
                tslib_1.__classPrivateFieldSet(this, _Client_metrics, new noops_1.NoopMetrics(), "f");
            }
            else {
                console.log('Starting AppSignal Client');
                this.start();
                console.log('AppSignal Client Started');
                tslib_1.__classPrivateFieldSet(this, _Client_metrics, new metrics_1.Metrics(), "f");
                console.log('AppSignal Metrics instrumentation started');
                tslib_1.__classPrivateFieldSet(this, _Client_sdk, this.initOpenTelemetry(options.additionalInstrumentations || []), "f");
                console.log('AppSignal openTelemetry started');
            }
        }
        else {
            tslib_1.__classPrivateFieldSet(this, _Client_metrics, new noops_1.NoopMetrics(), "f");
            console.error("AppSignal not starting, no valid configuration found");
        }
        this.initCoreProbes();
    }
    /**
     * Returns `true` if the extension is loaded and configuration is valid
     */
    get isActive() {
        var _a;
        return (extension_1.Extension.isLoaded &&
            this.config.isValid &&
            ((_a = this.config.data.active) !== null && _a !== void 0 ? _a : false));
    }
    set isActive(arg) {
        console.warn("Cannot set isActive property");
    }
    /**
     * Starts AppSignal with the given configuration. If no configuration is set
     * yet it will try to automatically load the configuration using the
     * environment loaded from environment variables and the current working
     * directory.
     */
    start() {
        if (this.config.isValid) {
            this.extension.start();
        }
        else {
            console.error("Not starting, no valid AppSignal configuration found");
        }
    }
    /**
     * Stops the AppSignal agent.
     *
     * Call this before the end of your program to make sure the
     * agent is stopped as well.
     */
    stop(calledBy) {
        var _a;
        if (calledBy) {
            console.log(`Stopping AppSignal (${calledBy})`);
        }
        else {
            console.log("Stopping AppSignal");
        }
        (_a = tslib_1.__classPrivateFieldGet(this, _Client_sdk, "f")) === null || _a === void 0 ? void 0 : _a.shutdown();
        this.metrics().probes().stop();
        this.extension.stop();
    }
    /**
     * Internal private function used by the demo CLI.
     *
     * https://docs.appsignal.com/nodejs/command-line/demo.html
     *
     * @private
     */
    demo() {
        (0, demo_1.demo)(this);
    }
    /**
     * Returns the current `Metrics` object.
     *
     * To track application-wide metrics, you can send custom metrics to AppSignal.
     * These metrics enable you to track anything in your application, from newly
     * registered users to database disk usage. These are not replacements for custom
     * instrumentation, but provide an additional way to make certain data in your
     * code more accessible and measurable over time.
     *
     * With different types of metrics (gauges, counters and measurements)
     * you can track any kind of data from your apps and tag them with metadata
     * to easily spot the differences between contexts.
     */
    metrics() {
        console.log('Getting metrics:', _Client_metrics);
        return tslib_1.__classPrivateFieldGet(this, _Client_metrics, "f");
    }
    logger(group, level = "info", format = "plaintext") {
        if (this.isActive) {
            return new logger_1.BaseLogger(this, group, level, format);
        }
        else {
            return noops_1.noopLogger;
        }
    }
    /**
     * Initialises all the available probes to attach automatically at runtime.
     */
    initCoreProbes() {
        console.log('Enabling probes');
        const probes = [gcProbe];
        // load probes
        probes.forEach(({ PROBE_NAME, init }) => tslib_1.__classPrivateFieldGet(this, _Client_metrics, "f").probes().register(PROBE_NAME, init(tslib_1.__classPrivateFieldGet(this, _Client_metrics, "f"))));
        console.log('Probes enabled', probes);
    }
    defaultInstrumentationsConfig() {
        const sendParams = this.config.data.sendParams;
        const sendSessionData = this.config.data.sendSessionData;
        const requestHeaders = this.config.data.requestHeaders;
        return {
            "@opentelemetry/instrumentation-express": {
                requestHook: function (_span, info) {
                    console.log('Checking for AppSignal Express Type');
                    if (info.layerType === instrumentation_express_1.ExpressLayerType.REQUEST_HANDLER) {
                        console.log('AppSignal Express iinstrumentation enabled');
                        if (sendParams) {
                            const queryParams = info.request.query;
                            const requestBody = info.request.body;
                            const params = { ...queryParams, ...requestBody };
                            (0, helpers_1.setParams)(params);
                        }
                        if (sendSessionData) {
                            (0, helpers_1.setSessionData)(info.request.cookies);
                        }
                    }
                }
            },
            "@opentelemetry/instrumentation-fastify": {
                requestHook: function (_span, info) {
                    const queryParams = info.request.query;
                    const requestBody = info.request.body;
                    const params = { ...queryParams, ...requestBody };
                    (0, helpers_1.setParams)(params);
                }
            },
            "@opentelemetry/instrumentation-http": {
                headersToSpanAttributes: {
                    server: { requestHeaders }
                }
            },
            "@opentelemetry/instrumentation-ioredis": {
                dbStatementSerializer: serializer_1.RedisDbStatementSerializer
            },
            "@opentelemetry/instrumentation-koa": {
                requestHook: function (span, info) {
                    if (sendParams && info.layerType === instrumentation_koa_1.KoaLayerType.ROUTER) {
                        const queryParams = info.context.request.query;
                        (0, helpers_1.setParams)(queryParams, span);
                    }
                }
            },
            "@opentelemetry/instrumentation-redis": {
                dbStatementSerializer: serializer_1.RedisDbStatementSerializer
            },
            "@opentelemetry/instrumentation-redis-4": {
                dbStatementSerializer: serializer_1.RedisDbStatementSerializer
            },
            "@opentelemetry/instrumentation-restify": {
                requestHook: (span, info) => {
                    if (sendParams &&
                        info.layerType === instrumentation_restify_1.LayerType.REQUEST_HANDLER) {
                        const request = info.request;
                        const params = Object.assign(request.params || {}, request.query || {});
                        (0, helpers_1.setParams)(params, span);
                    }
                }
            },
            "@prisma/instrumentation": {
                middleware: true
            }
        };
    }
    defaultInstrumentations() {
        const disabledInstrumentations = this.config.data.disableDefaultInstrumentations;
        console.log('Are instrumentations Disabled?', disabledInstrumentations);
        if (disabledInstrumentations === true) {
            return [];
        }
        const instrumentationConfigs = this.defaultInstrumentationsConfig();
        console.log('AppSignal Instrumentation config', instrumentationConfigs);
        return Object.entries(DefaultInstrumentations)
            .filter(([name, _constructor]) => !(disabledInstrumentations || []).includes(name))
            .map(([name, constructor]) => new constructor(instrumentationConfigs[name] || {}));
    }
    /**
     * Initialises OpenTelemetry instrumentation
     */
    initOpenTelemetry(additionalInstrumentations) {
        const instrumentations = additionalInstrumentations.concat(this.defaultInstrumentations());
        const testMode = process.env["_APPSIGNAL_TEST_MODE"];
        const testModeFilePath = process.env["_APPSIGNAL_TEST_MODE_FILE_PATH"];
        let spanProcessor;
        if (testMode && testModeFilePath) {
            spanProcessor = new span_processor_1.TestModeSpanProcessor(testModeFilePath);
        }
        else {
            spanProcessor = new span_processor_1.SpanProcessor(this);
        }
        const sdk = new sdk_node_1.NodeSDK({
            instrumentations,
            spanProcessor
        });
        sdk.start();
        return sdk;
    }
    /**
     * Sets up the AppSignal logger with the output based on the `log` config option. If
     * the log file is not accessible, stdout will be the output.
     */
    setUpIntegrationLogger() {
        const logFilePath = this.config.logFilePath;
        const logLevel = String(this.config.data["logLevel"]);
        const logType = String(this.config.data["log"]);
        let logger;
        if (logType == "file" && logFilePath) {
            logger = new integration_logger_1.BaseIntegrationLogger(logType, logLevel, logFilePath);
        }
        else {
            logger = new integration_logger_1.BaseIntegrationLogger(logType, logLevel);
        }
        return logger;
    }
    /**
     * Stores the client in global object after initializing
     */
    storeInGlobal() {
        global.__APPSIGNAL__ = this;
    }
    get tracer() {
        console.error("The `appsignal.tracer()` function was called, but it has been removed in AppSignal for Node.js package version 3.x. Please read our migration guide to upgrade to this new version of our package: https://docs.appsignal.com/nodejs/3.x/migration-guide.html. It is also possible to downgrade to version 2.x, after which this code will work again.");
        return () => { };
    }
}
exports.Client = Client;
_Client_metrics = new WeakMap(), _Client_sdk = new WeakMap();
