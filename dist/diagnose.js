"use strict";
var _DiagnoseTool_config, _DiagnoseTool_extension;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiagnoseTool = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const url_1 = require("url");
const utils_1 = require("./utils");
const extension_1 = require("./extension");
const config_1 = require("./config");
const client_1 = require("./client");
const version_1 = require("./version");
const configmap_1 = require("./config/configmap");
const transmitter_1 = require("./transmitter");
class DiagnoseTool {
    constructor() {
        _DiagnoseTool_config.set(this, void 0);
        _DiagnoseTool_extension.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _DiagnoseTool_config, this.getConfigObject(), "f");
        tslib_1.__classPrivateFieldSet(this, _DiagnoseTool_extension, new extension_1.Extension(), "f");
    }
    /**
     * Reports are serialized to JSON and send to an endpoint that expects
     * snake_case keys, thus the keys in the report on this side must be snake cased also.
     */
    async generate() {
        let pushApiKeyValidation;
        await this.validatePushApiKey()
            .then(result => (pushApiKeyValidation = result))
            .catch(result => (pushApiKeyValidation = result));
        return {
            library: this.getLibraryData(),
            installation: this.getInstallationReport(),
            host: this.getHostData(),
            agent: tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_extension, "f").diagnose(),
            config: {
                options: tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_config, "f").data,
                sources: tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_config, "f").sources
            },
            validation: { push_api_key: pushApiKeyValidation },
            process: {
                uid: (0, utils_1.processGetuid)()
            },
            paths: this.getPathsData()
        };
    }
    getLibraryData() {
        return {
            language: "nodejs",
            package_version: version_1.VERSION,
            agent_version: version_1.AGENT_VERSION,
            extension_loaded: extension_1.Extension.isLoaded
        };
    }
    getHostData() {
        const heroku = !!process.env["DYNO"];
        return {
            architecture: process.arch,
            os: process.platform,
            os_distribution: this.getOsDistribution(),
            language_version: process.versions.node,
            heroku,
            root: (0, utils_1.processGetuid)() === 0,
            running_in_container: tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_extension, "f").runningInContainer()
        };
    }
    getOsDistribution() {
        const path = "/etc/os-release";
        if (fs_1.default.existsSync(path)) {
            try {
                return fs_1.default.readFileSync(path, "utf8");
            }
            catch (error) {
                return `Error reading ${path}: ${error}`;
            }
        }
        else {
            return "";
        }
    }
    getInstallationReport() {
        let rawReport;
        try {
            rawReport = fs_1.default.readFileSync((0, utils_1.installReportPath)(), "utf8");
            return JSON.parse(rawReport);
        }
        catch (error) {
            const report = {
                parsing_error: {
                    error: `${error.name}: ${error.message}`,
                    backtrace: error.stack.split("\n")
                }
            };
            if (rawReport) {
                report.parsing_error.raw = rawReport;
            }
            return report;
        }
    }
    async validatePushApiKey() {
        const config = tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_config, "f").data;
        const url = new url_1.URL(`/1/auth`, config["endpoint"]);
        const transmitter = new transmitter_1.Transmitter(url.toString());
        let response = {};
        await transmitter
            .transmit()
            .then(responseData => {
            response = responseData;
        })
            .catch(responseData => {
            response = responseData;
        });
        if (response["status"] == 200) {
            return Promise.resolve("valid");
        }
        else if (response["status"] == 401) {
            return Promise.reject("invalid");
        }
        else {
            return Promise.reject(`Failed to validate: ${response["error"] || response["body"]}`);
        }
    }
    getPathsData() {
        const paths = {};
        const logFilePath = tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_config, "f").logFilePath;
        const pathsToCheck = {
            working_dir: {
                path: process.cwd()
            },
            log_dir_path: {
                path: logFilePath ? path_1.default.dirname(logFilePath) : ""
            },
            "appsignal.cjs": {
                path: this.clientFilePath() || ""
            },
            "appsignal.log": {
                path: logFilePath || "",
                content: logFilePath
                    ? safeReadFromPath(logFilePath).trimEnd().split("\n")
                    : []
            }
        };
        Object.entries(pathsToCheck).forEach(([key, data]) => {
            const { path } = data;
            if (fs_1.default.existsSync(path)) {
                try {
                    const stats = fs_1.default.statSync(path);
                    const { mode, gid, uid } = stats;
                    paths[key] = {
                        ...data,
                        exists: true,
                        mode: mode.toString(8),
                        ownership: {
                            gid,
                            uid
                        },
                        type: getPathType(stats),
                        writable: (0, utils_1.isWritable)(path)
                    };
                }
                catch (_) {
                    paths[key] = {
                        ...data,
                        exists: true
                    };
                }
            }
            else {
                paths[key] = {
                    ...data,
                    exists: false
                };
            }
        });
        return paths;
    }
    /**
     * Reads all configuration and re-maps it to keys with
     * snake_case names.
     */
    getConfigData() {
        return this.optionsObject(tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_config, "f").data);
    }
    /**
     * If it can load the client from the `appsignal.cjs` file, get the config
     * object from the initialized client. Otherwise, return a default config object.
     */
    getConfigObject() {
        var _a;
        const clientFilePath = this.clientFilePath();
        // The file is required to execute the client initialization
        // that stores the config object on the global object, making
        // it available calling `Client.config` later.
        if (clientFilePath) {
            process.env._APPSIGNAL_DIAGNOSE = "true";
            try {
                require(clientFilePath);
            }
            catch (e) {
                console.error(`Error loading AppSignal client file ${e.message}`);
            }
            delete process.env._APPSIGNAL_DIAGNOSE;
        }
        else {
            console.warn("Could not find AppSignal client file at " +
                `[${config_1.Configuration.clientFilePaths().join(",")}]. ` +
                "Configuration in report may be incomplete.");
        }
        return (_a = client_1.Client.config) !== null && _a !== void 0 ? _a : new config_1.Configuration({});
    }
    clientFilePath() {
        return this.getCustomClientFilePath() || config_1.Configuration.clientFilePath;
    }
    /**
     * Converts an AppsignalOptions object into a plain JS object,
     * re-mapping its keys to snake_case names as they appear
     * in our API.
     */
    optionsObject(options) {
        const config = {};
        Object.keys(options).forEach(key => {
            const newKey = configmap_1.JS_TO_RUBY_MAPPING[key];
            if (newKey) {
                config[newKey] = options[key];
            }
        });
        return config;
    }
    /**
     * Reads all configuration sources, remapping each source's
     * option keys with snake_case names.
     */
    getSources() {
        return Object.entries(tslib_1.__classPrivateFieldGet(this, _DiagnoseTool_config, "f").sources).reduce((sources, [name, options]) => {
            return { ...sources, [name]: this.optionsObject(options) };
        }, {});
    }
    getCustomClientFilePath() {
        const flagIndex = process.argv.indexOf("--config");
        if (flagIndex !== -1 && flagIndex + 1 < process.argv.length) {
            const filePath = process.argv[flagIndex + 1];
            return path_1.default.resolve(filePath);
        }
    }
    async sendReport(data) {
        data.config.options = this.getConfigData();
        data.config.sources = this.getSources();
        const json = JSON.stringify({ diagnose: data });
        const diagnoseEndpoint = process.env.APPSIGNAL_DIAGNOSE_ENDPOINT || "https://appsignal.com/diag";
        const transmitter = new transmitter_1.Transmitter(diagnoseEndpoint, json);
        await transmitter
            .transmit()
            .then(responseData => {
            if (responseData["status"] == 200) {
                const { token } = responseData["body"];
                console.log(`  Your support token:`, token);
                console.log(`  View this report:   https://appsignal.com/diagnose/${token}`);
            }
            else {
                console.error("  Error: Something went wrong while submitting the report to AppSignal.");
                console.error(`  Response code: ${responseData["status"]}`);
                console.error(`  Response body:\n${JSON.stringify(responseData["body"])}`);
            }
        })
            .catch(responseData => {
            console.error(`  Error submitting the report: ${responseData["error"].message}`);
        });
    }
}
exports.DiagnoseTool = DiagnoseTool;
_DiagnoseTool_config = new WeakMap(), _DiagnoseTool_extension = new WeakMap();
function getPathType(stats) {
    if (stats.isDirectory()) {
        return "directory";
    }
    else if (stats.isFile()) {
        return "file";
    }
    else {
        return "unknown";
    }
}
const BYTES_TO_READ_FOR_FILES = 2 * 1024 * 1024; // 2 Mebibytes
/**
 * Attempts to read a UTF-8 from `path`, and either returns the result
 * as a string, or an empty string on error
 */
function safeReadFromPath(path) {
    try {
        return readBytesFromPath(path, BYTES_TO_READ_FOR_FILES);
    }
    catch (_) {
        return "";
    }
}
function readBytesFromPath(path, bytesToRead) {
    let fd;
    try {
        const { readLength, startPosition } = readFileOptions(path, bytesToRead);
        fd = fs_1.default.openSync(path, "r");
        const buffer = Buffer.alloc(readLength);
        fs_1.default.readSync(fd, buffer, 0, readLength, startPosition);
        return buffer.toString("utf8");
    }
    finally {
        if (fd) {
            fs_1.default.closeSync(fd);
        }
    }
}
function readFileOptions(path, bytesToRead) {
    const stats = fs_1.default.statSync(path);
    const fileSize = stats.size;
    if (fileSize < bytesToRead) {
        return {
            readLength: fileSize,
            startPosition: 0
        };
    }
    else {
        const startPosition = fileSize - bytesToRead;
        return {
            readLength: bytesToRead,
            startPosition
        };
    }
}
