import { AppsignalOptions } from "./config/options";
import { Extension } from "./extension";
import { Configuration } from "./config";
import { Metrics } from "./metrics";
import { IntegrationLogger } from "./integration_logger";
import { Logger, LoggerFormat, LoggerLevel } from "./logger";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { FastifyInstrumentation } from "@opentelemetry/instrumentation-fastify";
import { GraphQLInstrumentation } from "@opentelemetry/instrumentation-graphql";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { IORedisInstrumentation } from "@opentelemetry/instrumentation-ioredis";
import { KnexInstrumentation } from "@opentelemetry/instrumentation-knex";
import { KoaInstrumentation } from "@opentelemetry/instrumentation-koa";
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb";
import { MongooseInstrumentation } from "@opentelemetry/instrumentation-mongoose";
import { MySQL2Instrumentation } from "@opentelemetry/instrumentation-mysql2";
import { MySQLInstrumentation } from "@opentelemetry/instrumentation-mysql";
import { NodeSDKConfiguration } from "@opentelemetry/sdk-node";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { RedisInstrumentation as Redis4Instrumentation } from "@opentelemetry/instrumentation-redis-4";
import { RedisInstrumentation } from "@opentelemetry/instrumentation-redis";
import { RestifyInstrumentation } from "@opentelemetry/instrumentation-restify";
declare const DefaultInstrumentations: {
    "@opentelemetry/instrumentation-express": typeof ExpressInstrumentation;
    "@opentelemetry/instrumentation-fastify": typeof FastifyInstrumentation;
    "@opentelemetry/instrumentation-graphql": typeof GraphQLInstrumentation;
    "@opentelemetry/instrumentation-http": typeof HttpInstrumentation;
    "@opentelemetry/instrumentation-ioredis": typeof IORedisInstrumentation;
    "@opentelemetry/instrumentation-knex": typeof KnexInstrumentation;
    "@opentelemetry/instrumentation-koa": typeof KoaInstrumentation;
    "@opentelemetry/instrumentation-mongodb": typeof MongoDBInstrumentation;
    "@opentelemetry/instrumentation-mongoose": typeof MongooseInstrumentation;
    "@opentelemetry/instrumentation-mysql2": typeof MySQL2Instrumentation;
    "@opentelemetry/instrumentation-mysql": typeof MySQLInstrumentation;
    "@opentelemetry/instrumentation-nestjs-core": typeof NestInstrumentation;
    "@opentelemetry/instrumentation-pg": typeof PgInstrumentation;
    "@opentelemetry/instrumentation-redis": typeof RedisInstrumentation;
    "@opentelemetry/instrumentation-redis-4": typeof Redis4Instrumentation;
    "@opentelemetry/instrumentation-restify": typeof RestifyInstrumentation;
    "@prisma/instrumentation": typeof PrismaInstrumentation;
};
export type DefaultInstrumentationName = keyof typeof DefaultInstrumentations;
type AdditionalInstrumentationsOption = NodeSDKConfiguration["instrumentations"];
export type Options = AppsignalOptions & {
    additionalInstrumentations: AdditionalInstrumentationsOption;
};
/**
 * AppSignal for Node.js's main class.
 *
 * Provides methods to control the AppSignal instrumentation and the system
 * agent.
 *
 * @class
 */
export declare class Client {
    #private;
    readonly VERSION: any;
    config: Configuration;
    readonly integrationLogger: IntegrationLogger;
    extension: Extension;
    /**
     * Global accessors for the AppSignal client
     */
    static get client(): Client;
    /**
     * Global accessors for the AppSignal Config
     */
    static get config(): Configuration;
    /**
     * Global accessors for the AppSignal integration Logger
     */
    static get integrationLogger(): IntegrationLogger;
    /**
     * Global accessors for the AppSignal Logger API
     */
    static logger(group: string, level?: LoggerLevel, format?: LoggerFormat): Logger;
    /**
     * Creates a new instance of the `Appsignal` object
     */
    constructor(options?: Partial<Options>);
    /**
     * Returns `true` if the extension is loaded and configuration is valid
     */
    get isActive(): boolean;
    set isActive(arg: boolean);
    /**
     * Starts AppSignal with the given configuration. If no configuration is set
     * yet it will try to automatically load the configuration using the
     * environment loaded from environment variables and the current working
     * directory.
     */
    start(): void;
    /**
     * Stops the AppSignal agent.
     *
     * Call this before the end of your program to make sure the
     * agent is stopped as well.
     */
    stop(calledBy?: string): void;
    /**
     * Internal private function used by the demo CLI.
     *
     * https://docs.appsignal.com/nodejs/command-line/demo.html
     *
     * @private
     */
    demo(): void;
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
    metrics(): Metrics;
    logger(group: string, level?: LoggerLevel, format?: LoggerFormat): Logger;
    /**
     * Initialises all the available probes to attach automatically at runtime.
     */
    private initCoreProbes;
    private defaultInstrumentationsConfig;
    private defaultInstrumentations;
    /**
     * Initialises OpenTelemetry instrumentation
     */
    private initOpenTelemetry;
    /**
     * Sets up the AppSignal logger with the output based on the `log` config option. If
     * the log file is not accessible, stdout will be the output.
     */
    private setUpIntegrationLogger;
    /**
     * Stores the client in global object after initializing
     */
    private storeInGlobal;
    get tracer(): any;
}
export {};
