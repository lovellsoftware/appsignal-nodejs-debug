"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressErrorHandler = void 0;
const helpers_1 = require("../../helpers");
function expressErrorHandler() {
    return function (err, req, res, next) {
        if (!err.status || err.status >= 500) {
            (0, helpers_1.setError)(err);
        }
        return next(err);
    };
}
exports.expressErrorHandler = expressErrorHandler;
