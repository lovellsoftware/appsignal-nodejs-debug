"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const os_1 = tslib_1.__importDefault(require("os"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const version_1 = require("./version");
const utils_1 = require("./utils");
const configmap_1 = require("./config/configmap");
/**
 * The AppSignal configuration object.
 *
 * Manages configuration loaded at runtime, and from other sources.
 * Writes environment variables used to configure the agent.
 *
 * @class
 */
class Configuration {
    constructor(options) {
        this.sources = {
            default: this._defaultValues(),
            system: this._systemValues(),
            env: this._loadFromEnvironment(),
            initial: options
        };
        this.data = Object.values(this.sources).reduce((data, options) => {
            return { ...data, ...options };
        }, {});
        this.writePrivateConfig(this.data);
    }
    /**
     * Returns `true` if the current configuration is valid.
     */
    get isValid() {
        return (this.data.pushApiKey || "").trim() !== "";
    }
    get logFilePath() {
        const filename = "appsignal.log";
        let logPath = this.data["logPath"];
        if (logPath && path_1.default.extname(logPath) != "") {
            console.warn("DEPRECATED: File names are no longer supported in the 'logPath' config option. Changing the filename to 'appsignal.log'");
            logPath = path_1.default.dirname(logPath);
        }
        if (logPath && (0, utils_1.isWritable)(logPath)) {
            return path_1.default.join(logPath, filename);
        }
        else {
            const tmpDir = this._tmpdir();
            if ((0, utils_1.isWritable)(tmpDir)) {
                if (logPath) {
                    console.warn(`Unable to log to '${logPath}'. Logging to '${tmpDir}' instead. Please check the permissions of the 'logPath' directory.`);
                }
                return path_1.default.join(tmpDir, filename);
            }
            else {
                let configuredPath = "";
                if (logPath) {
                    configuredPath = `'${logPath}' or `;
                }
                console.warn(`Unable to log to ${configuredPath}'${tmpDir}' fallback. Please check the permissions of these directories.`);
            }
        }
    }
    static get clientFilePath() {
        return this.clientFilePaths().find(fs_1.default.existsSync);
    }
    static clientFilePaths() {
        const filename = "appsignal.cjs";
        return [
            path_1.default.join(process.cwd(), filename),
            path_1.default.join(process.cwd(), "src", filename)
        ];
    }
    /**
     * Returns default OS tmp dir. Uses OS package for Windows. Linux and macOS
     * have `/tmp` hardcoded as a default
     *
     * @private
     */
    _tmpdir() {
        const isWindows = process.platform == "win32";
        if (isWindows) {
            return os_1.default.tmpdir();
        }
        else {
            return "/tmp";
        }
    }
    /**
     * Explicit default configuration values
     *
     * @private
     */
    _defaultValues() {
        return {
            active: false,
            caFilePath: path_1.default.join(__dirname, "../cert/cacert.pem"),
            disableDefaultInstrumentations: false,
            dnsServers: [],
            enableHostMetrics: true,
            enableMinutelyProbes: true,
            enableStatsd: false,
            enableNginxMetrics: false,
            endpoint: "https://push.appsignal.com",
            environment: process.env.NODE_ENV || "development",
            filesWorldAccessible: true,
            filterParameters: [],
            filterSessionData: [],
            ignoreActions: [],
            ignoreErrors: [],
            ignoreNamespaces: [],
            log: "file",
            loggingEndpoint: "https://appsignal-endpoint.net",
            requestHeaders: [
                "accept",
                "accept-charset",
                "accept-encoding",
                "accept-language",
                "cache-control",
                "connection",
                "content-length",
                "range"
            ],
            sendEnvironmentMetadata: true,
            sendParams: true,
            sendSessionData: true
        };
    }
    /**
     * Config options based on the host environment.
     *
     * @private
     */
    _systemValues() {
        const config = {};
        if (process.env.DYNO) {
            config["log"] = "stdout";
        }
        return config;
    }
    /**
     * Loads environment variables into a key-value structure.
     *
     * @private
     */
    _loadFromEnvironment() {
        const conf = {};
        Object.entries(configmap_1.ENV_TO_KEY_MAPPING).forEach(([k, v]) => {
            const current = process.env[k];
            if (current) {
                try {
                    // attempt to extract a value from a string
                    conf[v] = eval(current);
                }
                catch (e) {
                    conf[v] = current;
                }
            }
        });
        return conf;
    }
    /**
     * Writes environment variables from a key-value structure.
     *
     * @private
     */
    writePrivateConfig(config) {
        this.writePrivateConstants();
        const logFilePath = this.logFilePath;
        if (logFilePath) {
            process.env["_APPSIGNAL_LOG_FILE_PATH"] = logFilePath;
        }
        // write to a "private" environment variable if it exists in the
        // config structure
        Object.entries(configmap_1.PRIVATE_ENV_MAPPING).forEach(([k, v]) => {
            const current = config[v];
            if (current && Array.isArray(current)) {
                if (current.length === 0)
                    return;
                process.env[k] = current.join(",");
            }
            if (current)
                process.env[k] = String(current);
        });
    }
    /**
     * Writes private environment variables that are not user configured,
     * and static in the lifecycle of the agent.
     *
     * @function
     * @private
     */
    writePrivateConstants() {
        const priv = {
            _APPSIGNAL_AGENT_PATH: path_1.default.join(__dirname, "/../ext"),
            _APPSIGNAL_PROCESS_NAME: process.title,
            _APPSIGNAL_LANGUAGE_INTEGRATION_VERSION: `nodejs-${version_1.VERSION}`,
            _APPSIGNAL_APP_PATH: process.cwd()
        };
        Object.entries(priv).forEach(([k, v]) => (process.env[k] = v));
    }
}
exports.Configuration = Configuration;
