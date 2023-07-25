"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSignConfig = exports.checkParams = exports.checkItem = void 0;
const types_1 = require("../types");
const errors_1 = require("./errors");
const cases = {
    symbol: errors_1.ERRORS.SYMBOL_NOT_FOUND,
    token: errors_1.ERRORS.TOKEN_NOT_FOUND,
    account: errors_1.ERRORS.ACCOUNT_NOT_FOUND,
    everHash: errors_1.ERRORS.EVERHASH_NOT_FOUND,
    chainTxHash: errors_1.ERRORS.CHAIN_TX_HASH_NOT_FOUND,
    tag: errors_1.ERRORS.TAG_NOT_FOUND,
    action: errors_1.ERRORS.INVALID_ACTION,
    to: errors_1.ERRORS.TO_NOT_FOUND,
    ethConnectedSigner: errors_1.ERRORS.ETH_SIGNER_NOT_FOUND
};
const checkItem = (itemName, param) => {
    if (param === null || param === undefined || param === '' || param === 0) {
        throw new Error(cases[itemName]);
    }
    if (itemName === 'amount' && !(param >= 0)) {
        throw new Error(errors_1.ERRORS.INVALID_AMOUNT);
    }
    const actions = [
        types_1.EverpayActionWithDeposit.deposit,
        types_1.EverpayActionWithDeposit.withdraw,
        types_1.EverpayActionWithDeposit.transfer,
        types_1.EverpayActionWithDeposit.bundle
    ];
    if (itemName === 'action' && !actions.includes(param)) {
        throw new Error(cases.action);
    }
};
exports.checkItem = checkItem;
const checkParams = (params) => {
    Object.keys(params).forEach(key => (0, exports.checkItem)(key, params[key]));
};
exports.checkParams = checkParams;
const checkSignConfig = (accountType, config) => {
    if (accountType === types_1.ChainType.ethereum) {
        (0, exports.checkItem)('ethConnectedSigner', config.ethConnectedSigner);
    }
    else if (accountType === types_1.ChainType.arweave) {
        (0, exports.checkItem)('arJWK', config.arJWK);
    }
};
exports.checkSignConfig = checkSignConfig;
