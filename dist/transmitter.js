"use strict";
var _Transmitter_config, _Transmitter_url, _Transmitter_body;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transmitter = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const https_1 = tslib_1.__importDefault(require("https"));
const http_1 = tslib_1.__importDefault(require("http"));
const config_1 = require("./config");
const url_1 = require("url");
const REDIRECT_COUNT = Symbol("redirect-count");
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308];
const REDIRECT_GET_STATUS_CODES = [301, 302, 303];
const MAX_REDIRECTS = 20;
class MaxRedirectsError extends Error {
    constructor() {
        super("Maximum number of redirects reached");
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MaxRedirectsError);
        }
        this.name = "MaxRedirectsError";
    }
}
class Transmitter {
    constructor(url, body = "") {
        console.log('---------New Transmitter', { url, body });
        _Transmitter_config.set(this, void 0);
        _Transmitter_url.set(this, void 0);
        _Transmitter_body.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _Transmitter_config, new config_1.Configuration({}), "f");
        tslib_1.__classPrivateFieldSet(this, _Transmitter_url, url, "f");
        tslib_1.__classPrivateFieldSet(this, _Transmitter_body, body, "f");
    }
    downloadStream() {
        return new Promise((resolve, reject) => {
            this.request({
                method: "GET",
                callback(stream) {
                    var _a;
                    const statusCode = (_a = stream.statusCode) !== null && _a !== void 0 ? _a : 999;
                    if (statusCode >= 400) {
                        reject({ kind: "statusCode", statusCode });
                    }
                    else {
                        resolve(stream);
                    }
                },
                onError(error) {
                    reject({ kind: "requestError", error });
                }
            });
        });
    }
    async transmit() {
        return new Promise((resolve, reject) => {
            console.log('------------- New transmit:', { error });
            this.request({
                method: "POST",
                params: this.configParams(),
                callback(stream) {
                    var _a;
                    const responseStatus = (_a = stream.statusCode) !== null && _a !== void 0 ? _a : 999;
                    stream.setEncoding("utf8");
                    let responseBody = "";
                    stream
                        .on("data", (chunk) => {
                        responseBody += chunk;
                    })
                        .on("end", () => {
                        let parsedResponse;
                        try {
                            parsedResponse = JSON.parse(responseBody);
                        }
                        catch (_a) {
                            parsedResponse = {};
                        }
                        resolve({ status: responseStatus, body: parsedResponse });
                    });
                },
                onError(error) {
                    console.log('------------- Transmit error:', { error });
                    reject({ error: error });
                }
            });
        });
    }
    request(requestOptions) {
        console.log('------------- New Request');
        const { method, params = new url_1.URLSearchParams(), onError } = requestOptions;
        const initialOptions = {
            method,
            ...this.urlRequestOptions()
        };
        const { protocol, path } = initialOptions;
        const options = {
            ...initialOptions,
            ...this.paramsRequestOptions(path !== null && path !== void 0 ? path : "", params),
            ...this.bodyRequestOptions(method),
            ...this.caRequestOptions(protocol !== null && protocol !== void 0 ? protocol : "")
        };
        console.log('------------ Request options:', options);
        const module = this.requestModule(protocol !== null && protocol !== void 0 ? protocol : "");
        const callback = this.handleRedirectsCallback(requestOptions);
        const request = module.request(options, callback);
        request.on("error", onError);
        this.writeRequest(method, request);
        request.end();
    }
    handleRedirectsCallback({ method, params, callback, onError }) {
        return stream => {
            var _a, _b;
            const responseStatus = (_a = stream.statusCode) !== null && _a !== void 0 ? _a : 999;
            const isRedirect = REDIRECT_STATUS_CODES.indexOf(responseStatus) !== -1;
            const newURL = this.getLocationHeader(stream.rawHeaders || []);
            if (isRedirect && typeof newURL !== "undefined") {
                const redirectCount = (_b = callback[REDIRECT_COUNT]) !== null && _b !== void 0 ? _b : 0;
                if (redirectCount >= MAX_REDIRECTS) {
                    onError(new MaxRedirectsError());
                }
                else {
                    callback[REDIRECT_COUNT] = redirectCount + 1;
                    let newMethod = method;
                    const isGetRedirect = REDIRECT_GET_STATUS_CODES.indexOf(responseStatus) !== -1;
                    if (isGetRedirect) {
                        newMethod = "GET";
                    }
                    const newTransmitter = new Transmitter(newURL, tslib_1.__classPrivateFieldGet(this, _Transmitter_body, "f"));
                    newTransmitter.request({
                        method: newMethod,
                        params,
                        callback,
                        onError
                    });
                }
            }
            else {
                callback(stream);
            }
        };
    }
    // Temporary fix to deal with the header setter removal in Node.js 19
    // https://github.com/nodejs/node/issues/45510
    getLocationHeader(rawHeaders) {
        let location;
        rawHeaders.forEach((element, index) => {
            // Skip odd indices as rawHeaders are represented as an array of pairs (key, value)
            if (Math.abs(index % 2) == 1)
                return;
            if (element == "Location") {
                location = rawHeaders[index + 1];
            }
        });
        return location;
    }
    configParams() {
        const config_data = tslib_1.__classPrivateFieldGet(this, _Transmitter_config, "f").data;
        return new url_1.URLSearchParams({
            api_key: config_data["pushApiKey"] || "",
            name: config_data["name"] || "",
            environment: config_data["environment"] || "",
            hostname: config_data["hostname"] || ""
        });
    }
    requestModule(protocol) {
        return protocol == "http:" ? http_1.default : https_1.default;
    }
    writeRequest(method, request) {
        if (method == "POST") {
            request.write(tslib_1.__classPrivateFieldGet(this, _Transmitter_body, "f"));
        }
    }
    urlRequestOptions() {
        const requestUrl = new url_1.URL(tslib_1.__classPrivateFieldGet(this, _Transmitter_url, "f"));
        return {
            protocol: requestUrl.protocol,
            host: requestUrl.hostname,
            port: requestUrl.port,
            path: requestUrl.pathname + requestUrl.search
        };
    }
    paramsRequestOptions(path, params) {
        let paramsString = params.toString();
        if (paramsString != "") {
            paramsString = `?${paramsString}`;
        }
        return {
            path: `${path}${paramsString}`
        };
    }
    bodyRequestOptions(method) {
        if (method != "POST")
            return {};
        return {
            headers: {
                "Content-Type": "application/json",
                "Content-Length": tslib_1.__classPrivateFieldGet(this, _Transmitter_body, "f").length
            }
        };
    }
    caRequestOptions(protocol) {
        if (protocol != "https:")
            return {};
        const configData = tslib_1.__classPrivateFieldGet(this, _Transmitter_config, "f").data;
        const caFilePathFromConfig = configData["caFilePath"] || "";
        try {
            fs_1.default.accessSync(caFilePathFromConfig, fs_1.default.constants.R_OK);
            return {
                ca: fs_1.default.readFileSync(caFilePathFromConfig, "utf-8").toString()
            };
        }
        catch (_a) {
            console.warn(`Provided caFilePath: '${caFilePathFromConfig}' is not readable.`);
            return {};
        }
    }
}
exports.Transmitter = Transmitter;
_Transmitter_config = new WeakMap(), _Transmitter_url = new WeakMap(), _Transmitter_body = new WeakMap();
