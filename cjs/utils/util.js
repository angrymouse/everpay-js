"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genBundleData = exports.genExpressData = exports.matchTokenTag = exports.genTokenTag = exports.getTokenBurnFeeByChainType = exports.getChainDecimalByChainType = exports.getTokenAddrByChainType = exports.getAccountChainType = exports.isArweaveL2PSTTokenSymbol = exports.isArweaveChainPSTMode = exports.getTokenByTag = exports.getTimestamp = exports.fromDecimalToUnit = exports.fromDecimalToUnitBN = exports.fromUnitToDecimal = exports.fromUnitToDecimalBN = exports.toBN = void 0;
const address_1 = require("@ethersproject/address");
const isString_1 = __importDefault(require("lodash/isString"));
const uuid_1 = require("uuid");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const errors_1 = require("./errors");
const types_1 = require("../types");
const config_1 = require("../config");
bignumber_js_1.default.config({
    EXPONENTIAL_AT: 1000
});
const toBN = (x) => {
    if (isNaN(Number(x)))
        return new bignumber_js_1.default(0);
    if (x instanceof bignumber_js_1.default)
        return x;
    if (typeof x === 'string') {
        if (x.indexOf('0x') === 0 || x.indexOf('-0x') === 0) {
            return new bignumber_js_1.default((x).replace('0x', ''), 16);
        }
    }
    return new bignumber_js_1.default(x);
};
exports.toBN = toBN;
const fromUnitToDecimalBN = (x, decimals) => {
    return (0, exports.toBN)(x).times((0, exports.toBN)(10).pow(decimals));
};
exports.fromUnitToDecimalBN = fromUnitToDecimalBN;
const fromUnitToDecimal = (x, decimals) => {
    return (0, exports.fromUnitToDecimalBN)(x, decimals).toString();
};
exports.fromUnitToDecimal = fromUnitToDecimal;
const fromDecimalToUnitBN = (x, decimals) => {
    return (0, exports.toBN)(x).dividedBy((0, exports.toBN)(10).pow(decimals));
};
exports.fromDecimalToUnitBN = fromDecimalToUnitBN;
const fromDecimalToUnit = (x, decimals) => {
    return (0, exports.fromDecimalToUnitBN)(x, decimals).toString();
};
exports.fromDecimalToUnit = fromDecimalToUnit;
const getTimestamp = () => Math.round(Date.now() / 1000);
exports.getTimestamp = getTimestamp;
const getTokenByTag = (tag, tokenList) => {
    return tokenList === null || tokenList === void 0 ? void 0 : tokenList.find(t => (0, exports.matchTokenTag)((0, exports.genTokenTag)(t), tag));
};
exports.getTokenByTag = getTokenByTag;
const isEthereumAddress = address_1.isAddress;
const isArweaveAddress = (address) => {
    return (0, isString_1.default)(address) && address.length === 43 && address.search(/[a-z0-9A-Z_-]{43}/g) === 0;
};
const isArweaveChainPSTMode = (token) => {
    if (token == null)
        return false;
    return token.crossChainInfoList[types_1.ChainType.arweave] != null && token.symbol.toUpperCase() !== 'AR';
};
exports.isArweaveChainPSTMode = isArweaveChainPSTMode;
const isArweaveL2PSTTokenSymbol = (symbol) => {
    return (symbol === null || symbol === void 0 ? void 0 : symbol.toUpperCase()) === 'STAMP' || symbol.toUpperCase() === 'U';
};
exports.isArweaveL2PSTTokenSymbol = isArweaveL2PSTTokenSymbol;
const getAccountChainType = (from) => {
    if (isEthereumAddress(from)) {
        return types_1.ChainType.ethereum;
    }
    if (isArweaveAddress(from)) {
        return types_1.ChainType.arweave;
    }
    throw new Error(errors_1.ERRORS.INVALID_ACCOUNT_TYPE);
};
exports.getAccountChainType = getAccountChainType;
const getTokenAddrByChainType = (token, chainType) => {
    const crossChainInfo = token.crossChainInfoList[chainType];
    return crossChainInfo.targetTokenId;
};
exports.getTokenAddrByChainType = getTokenAddrByChainType;
const getChainDecimalByChainType = (token, chainType) => {
    const crossChainInfo = token.crossChainInfoList[chainType];
    return crossChainInfo.targetDecimals;
};
exports.getChainDecimalByChainType = getChainDecimalByChainType;
const getTokenBurnFeeByChainType = (token, feeItem, chainType) => {
    return feeItem.burnFeeMap[chainType];
};
exports.getTokenBurnFeeByChainType = getTokenBurnFeeByChainType;
const genTokenTag = (token) => {
    const { chainType, symbol, id } = token;
    const chainTypes = chainType.split(',');
    const tokenAddrs = id.split(',').map((addr, index) => {
        if ([
            types_1.ChainType.ethereum,
            types_1.ChainType.bsc,
            types_1.ChainType.conflux,
            types_1.ChainType.moon,
            types_1.ChainType.platon,
            'everpay'
        ].includes(chainTypes[index])) {
            return addr.toLowerCase();
        }
        return addr;
    });
    return `${chainType.toLowerCase()}-${symbol.toLowerCase()}-${tokenAddrs.join(',')}`;
};
exports.genTokenTag = genTokenTag;
const matchTokenTag = (tag1, tag2) => {
    return (tag1 === null || tag1 === void 0 ? void 0 : tag1.toLowerCase()) === (tag2 === null || tag2 === void 0 ? void 0 : tag2.toLowerCase());
};
exports.matchTokenTag = matchTokenTag;
const genExpressData = (params) => {
    const { chainType, to, fee } = params;
    return {
        appId: 'express',
        withdrawAction: 'pay',
        withdrawTo: to,
        withdrawChainType: chainType,
        withdrawFee: fee
    };
};
exports.genExpressData = genExpressData;
const genBundleData = (params) => {
    const items = params.items.map((item) => {
        const { tag, amount, from, to } = item;
        const token = (0, exports.getTokenByTag)(tag, params.tokenList);
        // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
        return {
            tag: (0, exports.genTokenTag)(token),
            chainID: token.chainID,
            from,
            to,
            amount: (0, exports.fromUnitToDecimal)(amount, token.decimals)
        };
    });
    const salt = (0, uuid_1.v4)();
    const version = config_1.bundleInternalTxVersion;
    return {
        // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
        items,
        expiration: params.expiration,
        salt,
        version
    };
};
exports.genBundleData = genBundleData;
