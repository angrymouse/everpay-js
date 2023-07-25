"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpressHost = exports.getEverpayHost = exports.bundleInternalTxVersion = exports.everpayTxVersion = void 0;
exports.everpayTxVersion = 'v1';
exports.bundleInternalTxVersion = 'v1';
const getEverpayHost = (debug) => {
    return debug === true ? 'https://api-dev.everpay.io' : 'https://api.everpay.io';
};
exports.getEverpayHost = getEverpayHost;
const getExpressHost = (debug) => {
    return debug === true ? 'https://express-dev.everpay.io' : 'https://express.everpay.io';
};
exports.getExpressHost = getExpressHost;
