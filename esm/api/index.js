import axios from 'axios';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { stringify as qsStringify } from 'query-string';
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
export const sendRequest = async (config) => {
    return await new Promise((resolve, reject) => {
        axios({
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
            if (isString(error)) {
                reject(new Error(error));
            }
            else if (isObject(error.response) && isObject(error.response.data)) {
                // like { error: 'err_invalid_signature' }
                reject(new Error(error.response.data.error));
            }
            else {
                reject(new Error(error));
            }
        });
    });
};
export const getEverpayInfo = async (apiHost) => {
    const url = `${apiHost}/info`;
    const result = await sendRequest({
        url,
        method: 'GET'
    });
    return result.data;
};
export const getEverpayBalance = async (apiHost, { account, tokenTag }) => {
    const url = `${apiHost}/balance/${tokenTag}/${account}`;
    const result = await sendRequest({
        url,
        method: 'GET'
    });
    return result.data;
};
export const getEverpayBalances = async (apiHost, { account }) => {
    const url = `${apiHost}/balances/${account}`;
    const result = await sendRequest({
        url,
        method: 'GET'
    });
    return result.data;
};
export const getEverpayTransactions = async (apiHost, params) => {
    const { account, page, tokenTag, action, withoutAction } = params;
    const baseUrl = account !== undefined ? `${apiHost}/txs/${account}` : `${apiHost}/txs`;
    const queryString = qsStringify({ page, tokenTag, action, withoutAction }, { skipNull: true });
    const result = await sendRequest({
        ...rConfig,
        url: `${baseUrl}${queryString !== '' ? `?${queryString}` : ''}`,
        method: 'GET'
    });
    return result.data;
};
export const getEverpayTransaction = async (apiHost, everHash) => {
    const url = `${apiHost}/tx/${everHash}`;
    const result = await sendRequest({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.tx;
};
export const getMintdEverpayTransactionByChainTxHash = async (apiHost, chainTxHash) => {
    const url = `${apiHost}/minted/${chainTxHash}`;
    const result = await sendRequest({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.tx;
};
export const getFees = async (apiHost) => {
    const url = `${apiHost}/fees`;
    const result = await sendRequest({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.fees;
};
export const getFee = async (apiHost, tokenTag) => {
    const url = `${apiHost}/fee/${tokenTag}`;
    const result = await sendRequest({
        ...rConfig,
        url,
        method: 'GET'
    });
    return result.data.fee;
};
export const postTx = async (apiHost, params) => {
    const url = `${apiHost}/tx`;
    const result = await sendRequest({
        url,
        method: 'POST',
        data: params
    });
    return result.data;
};
export const getExpressInfo = async (apiHost) => {
    const url = `${apiHost}/withdraw/info`;
    const result = await sendRequest({
        url,
        method: 'GET'
    });
    return result.data;
};
