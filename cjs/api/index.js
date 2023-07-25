"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpressInfo = exports.postTx = exports.getFee = exports.getFees = exports.getMintdEverpayTransactionByChainTxHash = exports.getEverpayTransaction = exports.getEverpayTransactions = exports.getEverpayBalances = exports.getEverpayBalance = exports.getEverpayInfo = exports.sendRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const isObject_1 = __importDefault(require("lodash/isObject"));
const isString_1 = __importDefault(require("lodash/isString"));
const query_string_1 = require("query-string");
// `validateStatus` defines whether to resolve or reject the promise for a given
// HTTP response status code. If `validateStatus` returns `true` (or is set to `null`
// or `undefined`), the promise will be resolved; otherwise, the promise will be rejected.
const validateStatus = function (status) {
    return status >= 200 && status < 300; // default
};
const rConfig = {
    timeout: 5000,
    validateStatus,
    headers: {
        'Content-Type': 'application/json'
    }
};
const sendRequest = async (config) => {
    return await new Promise((resolve, reject) => {
        (0, axios_1.default)({
            ...rConfig,
            ...config
        }).then((res) => {
            var _a;
            if (res.data !== undefined) {
                resolve(res);
            }
            else {
                reject(new Error(`${(_a = config.url) !== null && _a !== void 0 ? _a : ''}: null response`));
            }
        }).catch(error => {
            if ((0, isString_1.default)(error)) {
                reject(new Error(error));
            }
            else if ((0, isObject_1.default)(error.response) && (0, isObject_1.default)(error.response.data)) {
                // like { error: 'err_invalid_signature' }
                reject(new Error(error.response.data.error));
            }
            else {
                reject(new Error(error));
            }
        });
    });
};
exports.sendRequest = sendRequest;
const getEverpayInfo = async (apiHost) => {
    const url = `${apiHost}/info`;
    const result = await (0, exports.sendRequest)({
        url,
        method: 'GET'
    });
    return result.data;
};
exports.getEverpayInfo = getEverpayInfo;
const getEverpayBalance = async (apiHost, { account, tokenTag }) => {
    const url = `${apiHost}/balance/${tokenTag}/${account}`;
    const result = await (0, exports.sendRequest)({
        url,
        method: 'GET'
    });
    return result.data;
};
exports.getEverpayBalance = getEverpayBalance;
const getEverpayBalances = async (apiHost, { account }) => {
    const url = `${apiHost}/balances/${account}`;
    const result = await (0, exports.sendRequest)({
        url,
        method: 'GET'
    });
    return result.data;
};
exports.getEverpayBalances = getEverpayBalances;
const getEverpayTransactions = async (apiHost, params) => {
    const { account, page, tokenTag, action, withoutAction } = params;
    const baseUrl = account !== undefined ? `${apiHost}/txs/${account}` : `${apiHost}/txs`;
    const queryString = (0, query_string_1.stringify)({ page, tokenTag, action, withoutAction }, { skipNull: true });
    const result = await (0, exports.sendRequest)({
        ...rConfig,
        url: `${baseUrl}${queryString !== '' ? `?${queryString}` : ''}`,
        method: 'GET'
    });
    return result.data;
};
exports.getEverpayTransactions = getEverpayTransactions;
const getEverpayTransaction = async (apiHost, everHash) => {
    const url = `${apiHost}/tx/${everHash}`;
    const result = await (0, exports.sendRequest)({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.tx;
};
exports.getEverpayTransaction = getEverpayTransaction;
const getMintdEverpayTransactionByChainTxHash = async (apiHost, chainTxHash) => {
    const url = `${apiHost}/minted/${chainTxHash}`;
    const result = await (0, exports.sendRequest)({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.tx;
};
exports.getMintdEverpayTransactionByChainTxHash = getMintdEverpayTransactionByChainTxHash;
const getFees = async (apiHost) => {
    const url = `${apiHost}/fees`;
    const result = await (0, exports.sendRequest)({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.fees;
};
exports.getFees = getFees;
const getFee = async (apiHost, tokenTag) => {
    const url = `${apiHost}/fee/${tokenTag}`;
    const result = await (0, exports.sendRequest)({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.fee;
};
exports.getFee = getFee;
const postTx = async (apiHost, params) => {
    const url = `${apiHost}/tx`;
    const result = await (0, exports.sendRequest)({
        url,
        method: 'POST',
        data: params
    });
    return result.data;
};
exports.postTx = postTx;
const getExpressInfo = async (apiHost) => {
    const url = `${apiHost}/withdraw/info`;
    const result = await (0, exports.sendRequest)({
        url,
        method: 'GET'
    });
    return result.data;
};
exports.getExpressInfo = getExpressInfo;
