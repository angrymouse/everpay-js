"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferAsync = exports.verifySigAsync = exports.signMessageAsync = exports.getEverpayTxMessage = void 0;
const ethereum_1 = __importDefault(require("./ethereum"));
const arweave_1 = __importDefault(require("./arweave"));
const types_1 = require("../types");
const check_1 = require("../utils/check");
const errors_1 = require("../utils/errors");
const hashPersonalMessage_1 = __importDefault(require("./hashPersonalMessage"));
const util_1 = require("../utils/util");
const getDepositAddr = (info, accountChainType) => {
    if (accountChainType === types_1.ChainType.ethereum) {
        return info === null || info === void 0 ? void 0 : info.lockers.ethereum;
    }
    else if (accountChainType === types_1.ChainType.arweave) {
        // AR 大小写敏感
        return info === null || info === void 0 ? void 0 : info.lockers.arweave;
    }
    else if (accountChainType === types_1.ChainType.moon) {
        return info === null || info === void 0 ? void 0 : info.lockers.moon;
    }
    else if (accountChainType === types_1.ChainType.conflux) {
        return info === null || info === void 0 ? void 0 : info.lockers.conflux;
    }
    else if (accountChainType === types_1.ChainType.bsc) {
        return info === null || info === void 0 ? void 0 : info.lockers.bsc;
    }
    else if (accountChainType === types_1.ChainType.platon) {
        return info === null || info === void 0 ? void 0 : info.lockers.platon;
    }
    throw new Error(errors_1.ERRORS.INVALID_ACCOUNT_TYPE);
};
const getEverpayTxMessage = (everpayTxWithoutSig) => {
    const keys = [
        'tokenSymbol',
        'action',
        'from',
        'to',
        'amount',
        'fee',
        'feeRecipient',
        'nonce',
        'tokenID',
        'chainType',
        'chainID',
        'data',
        'version'
    ];
    return keys.map(key => `${key}:${everpayTxWithoutSig[key]}`).join('\n');
};
exports.getEverpayTxMessage = getEverpayTxMessage;
const signMessageAsync = async (config, messageData) => {
    const from = config.account;
    const accountChainType = config.chainType;
    const personalMsgHashBuffer = (0, hashPersonalMessage_1.default)(Buffer.from(messageData));
    const personalMsgHex = `0x${personalMsgHashBuffer.toString('hex')}`;
    let sig = '';
    (0, check_1.checkSignConfig)(accountChainType, config);
    if ([
        types_1.ChainType.ethereum,
        types_1.ChainType.moon,
        types_1.ChainType.conflux,
        types_1.ChainType.bsc,
        types_1.ChainType.platon
    ].includes(accountChainType)) {
        sig = await ethereum_1.default.signMessageAsync(config.ethConnectedSigner, from, messageData);
    }
    else if (accountChainType === types_1.ChainType.arweave) {
        sig = await arweave_1.default.signMessageAsync(config.arJWK, from, personalMsgHex);
    }
    else {
        throw new Error(errors_1.ERRORS.INVALID_ACCOUNT_TYPE);
    }
    return { everHash: personalMsgHex, sig };
};
exports.signMessageAsync = signMessageAsync;
const verifySigAsync = async (tx) => {
    const from = tx.from;
    const chainType = (0, util_1.getAccountChainType)(from);
    const messageData = (0, exports.getEverpayTxMessage)(tx);
    if (chainType === types_1.ChainType.arweave) {
        return await arweave_1.default.verifySigAsync(from, messageData, tx.sig);
    }
    else {
        return await ethereum_1.default.verifySigAsync(from, messageData, tx.sig);
    }
};
exports.verifySigAsync = verifySigAsync;
const transferAsync = async (config, info, params) => {
    (0, check_1.checkSignConfig)(config.chainType, config);
    const to = getDepositAddr(info, config.chainType);
    const paramsMergedTo = { ...params, to };
    if ([
        types_1.ChainType.ethereum,
        types_1.ChainType.moon,
        types_1.ChainType.conflux,
        types_1.ChainType.bsc,
        types_1.ChainType.platon
    ].includes(config.chainType)) {
        return await ethereum_1.default.transferAsync(config.ethConnectedSigner, config.chainType, paramsMergedTo);
    }
    else if (config.chainType === types_1.ChainType.arweave) {
        return await arweave_1.default.transferAsync(config.arJWK, config.chainType, paramsMergedTo);
    }
    throw new Error(errors_1.ERRORS.INVALID_ACCOUNT_TYPE);
};
exports.transferAsync = transferAsync;
