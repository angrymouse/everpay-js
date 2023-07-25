"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sign_1 = require("./lib/sign");
const api_1 = require("./api");
const config_1 = require("./config");
const util_1 = require("./utils/util");
const check_1 = require("./utils/check");
const errors_1 = require("./utils/errors");
const ethers_1 = require("ethers");
const uuid_1 = require("uuid");
const types_1 = require("./types");
__exportStar(require("./types"), exports);
class Everpay extends types_1.EverpayBase {
    constructor(config) {
        var _a, _b;
        super();
        this.getAccountChainType = util_1.getAccountChainType;
        this.cacheHelper = async (key) => {
            var _a, _b, _c;
            const timestamp = (0, util_1.getTimestamp)();
            // cache info 3 mins
            if (((_a = this._cachedInfo[key]) === null || _a === void 0 ? void 0 : _a.value) != null &&
                this._cachedInfo[key].timestamp > timestamp - 3 * 60) {
                return (_b = this._cachedInfo[key]) === null || _b === void 0 ? void 0 : _b.value;
            }
            if (key === 'everpay') {
                const value = await await (0, api_1.getEverpayInfo)(this._apiHost);
                this._cachedInfo[key] = { value, timestamp };
            }
            else if (key === 'express') {
                const value = await await (0, api_1.getExpressInfo)(this._expressHost);
                this._cachedInfo[key] = { value, timestamp };
            }
            return (_c = this._cachedInfo[key]) === null || _c === void 0 ? void 0 : _c.value;
        };
        this._config = {
            ...config,
            account: (_a = config === null || config === void 0 ? void 0 : config.account) !== null && _a !== void 0 ? _a : '',
            chainType: (_b = config === null || config === void 0 ? void 0 : config.chainType) !== null && _b !== void 0 ? _b : types_1.ChainType.ethereum
        };
        this._apiHost = (0, config_1.getEverpayHost)(config === null || config === void 0 ? void 0 : config.debug);
        this._expressHost = (0, config_1.getExpressHost)(config === null || config === void 0 ? void 0 : config.debug);
        this._cachedInfo = {};
    }
    async info() {
        const result = await this.cacheHelper('everpay');
        return result;
    }
    async expressInfo() {
        const result = await this.cacheHelper('express');
        return result;
    }
    async balance(params) {
        var _a, _b;
        await this.info();
        const { tag, account } = params;
        const acc = account !== null && account !== void 0 ? account : this._config.account;
        const token = (0, util_1.getTokenByTag)(tag, (_b = (_a = this._cachedInfo) === null || _a === void 0 ? void 0 : _a.everpay) === null || _b === void 0 ? void 0 : _b.value.tokenList);
        (0, check_1.checkParams)({ account: acc, tag, token });
        const mergedParams = {
            tokenTag: (0, util_1.genTokenTag)(token),
            account: acc
        };
        const everpayBalance = await (0, api_1.getEverpayBalance)(this._apiHost, mergedParams);
        return (0, util_1.fromDecimalToUnit)(everpayBalance.balance.amount, everpayBalance.balance.decimals);
    }
    async balances(params) {
        const info = await this.info();
        params = (params !== null && params !== void 0 ? params : {});
        const { account } = params;
        const acc = account !== null && account !== void 0 ? account : this._config.account;
        (0, check_1.checkParams)({ account: acc });
        const mergedParams = {
            account: acc
        };
        const everpayBalances = await (0, api_1.getEverpayBalances)(this._apiHost, mergedParams);
        const balances = everpayBalances.balances.map(item => {
            const tag = item.tag;
            const token = info.tokenList.find(token => token.tag === tag);
            return {
                chainType: token === null || token === void 0 ? void 0 : token.chainType,
                symbol: token === null || token === void 0 ? void 0 : token.symbol.toUpperCase(),
                tag: token === null || token === void 0 ? void 0 : token.tag,
                address: token.id,
                balance: (0, util_1.fromDecimalToUnit)(item.amount, item.decimals)
            };
        });
        return balances;
    }
    async getMergedTxsParams(params) {
        var _a, _b;
        const { page, tag, action, withoutAction } = params;
        const mergedParams = {};
        if (page !== undefined) {
            mergedParams.page = page;
        }
        if (tag !== undefined) {
            await this.info();
            const token = (0, util_1.getTokenByTag)(tag, (_b = (_a = this._cachedInfo) === null || _a === void 0 ? void 0 : _a.everpay) === null || _b === void 0 ? void 0 : _b.value.tokenList);
            (0, check_1.checkParams)({ token });
            mergedParams.tokenTag = token.tag;
        }
        if (action !== undefined) {
            (0, check_1.checkParams)({ action });
            mergedParams.action = action;
        }
        if (withoutAction !== undefined) {
            mergedParams.withoutAction = withoutAction;
        }
        return mergedParams;
    }
    async txs(params) {
        const mergedParams = await this.getMergedTxsParams(params);
        return await (0, api_1.getEverpayTransactions)(this._apiHost, mergedParams);
    }
    async txsByAccount(params) {
        var _a, _b;
        (0, check_1.checkParams)({ account: (_a = params.account) !== null && _a !== void 0 ? _a : this._config.account });
        const mergedParams = await this.getMergedTxsParams(params);
        mergedParams.account = (_b = params.account) !== null && _b !== void 0 ? _b : this._config.account;
        return await (0, api_1.getEverpayTransactions)(this._apiHost, mergedParams);
    }
    async txByHash(everHash) {
        (0, check_1.checkParams)({ everHash });
        return await (0, api_1.getEverpayTransaction)(this._apiHost, everHash);
    }
    async mintedTxByChainTxHash(chainTxHash) {
        (0, check_1.checkParams)({ chainTxHash });
        return await (0, api_1.getMintdEverpayTransactionByChainTxHash)(this._apiHost, chainTxHash);
    }
    async fees() {
        return await (0, api_1.getFees)(this._apiHost);
    }
    async fee(tag) {
        var _a, _b;
        await this.info();
        const token = (0, util_1.getTokenByTag)(tag, (_b = (_a = this._cachedInfo) === null || _a === void 0 ? void 0 : _a.everpay) === null || _b === void 0 ? void 0 : _b.value.tokenList);
        (0, check_1.checkParams)({ tag, token });
        return await (0, api_1.getFee)(this._apiHost, (0, util_1.genTokenTag)(token));
    }
    async deposit(params) {
        var _a, _b, _c;
        await this.info();
        const { amount, tag } = params;
        const from = this._config.account;
        const token = (0, util_1.getTokenByTag)(tag, (_b = (_a = this._cachedInfo) === null || _a === void 0 ? void 0 : _a.everpay) === null || _b === void 0 ? void 0 : _b.value.tokenList);
        const chainType = this._config.chainType;
        (0, check_1.checkParams)({ account: from, tag, token, amount });
        // arweave 上的 PST 充值必须是整数
        if ((0, util_1.isArweaveChainPSTMode)(token) && chainType === types_1.ChainType.arweave && !(0, util_1.isArweaveL2PSTTokenSymbol)(token.symbol) && parseInt(amount) !== +amount) {
            throw new Error(errors_1.ERRORS.DEPOSIT_ARWEAVE_PST_MUST_BE_INTEGER);
        }
        const chainDecimal = (0, util_1.getChainDecimalByChainType)(token, chainType);
        const value = ethers_1.utils.parseUnits((0, util_1.toBN)(amount).toString(), chainDecimal);
        return await (0, sign_1.transferAsync)(this._config, (_c = this._cachedInfo.everpay) === null || _c === void 0 ? void 0 : _c.value, {
            symbol: token.symbol,
            token,
            from: from !== null && from !== void 0 ? from : '',
            value
        });
    }
    // amount 为实际收款数量
    async getEverpayTxWithoutSig(type, params) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        await this.info();
        const { tag, amount, fee, quickMode } = params;
        const token = (0, util_1.getTokenByTag)(tag, (_b = (_a = this._cachedInfo) === null || _a === void 0 ? void 0 : _a.everpay) === null || _b === void 0 ? void 0 : _b.value.tokenList);
        const from = this._config.account;
        let data = params.data;
        let to = params === null || params === void 0 ? void 0 : params.to;
        let decimalFeeBN = (0, util_1.toBN)(0);
        let decimalOperateAmountBN = (0, util_1.toBN)(0);
        let action = types_1.EverpayAction.transfer;
        (0, check_1.checkParams)({ account: from, tag, token, to });
        if (type === 'transfer') {
            (0, check_1.checkParams)({ amount });
            action = types_1.EverpayAction.transfer;
            decimalOperateAmountBN = (0, util_1.fromUnitToDecimalBN)(amount, (_c = token === null || token === void 0 ? void 0 : token.decimals) !== null && _c !== void 0 ? _c : 0);
        }
        else if (type === 'bundle') {
            action = types_1.EverpayAction.bundle;
            decimalOperateAmountBN = (0, util_1.fromUnitToDecimalBN)(amount, (_d = token === null || token === void 0 ? void 0 : token.decimals) !== null && _d !== void 0 ? _d : 0);
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        }
        else if (type === 'set') {
            action = types_1.EverpayAction.set;
            decimalOperateAmountBN = (0, util_1.fromUnitToDecimalBN)(amount, (_e = token === null || token === void 0 ? void 0 : token.decimals) !== null && _e !== void 0 ? _e : 0);
        }
        else if (type === 'withdraw') {
            (0, check_1.checkParams)({ amount });
            const chainType = params.chainType;
            // PST 提现到 arweave 网络必须是整数
            if ((0, util_1.isArweaveChainPSTMode)(token) && chainType === types_1.ChainType.arweave && !(0, util_1.isArweaveL2PSTTokenSymbol)(token === null || token === void 0 ? void 0 : token.symbol) && parseInt(amount) !== +amount) {
                throw new Error(errors_1.ERRORS.PST_WITHDARW_TO_ARWEAVE_MUST_BE_INTEGER);
            }
            const balance = await this.balance({ tag });
            const decimalBalanceBN = (0, util_1.fromUnitToDecimalBN)(balance, (_f = token === null || token === void 0 ? void 0 : token.decimals) !== null && _f !== void 0 ? _f : 0);
            // 快速提现
            if (quickMode === true) {
                action = types_1.EverpayAction.transfer;
                const expressInfo = await this.expressInfo();
                const tokenTag = (0, util_1.genTokenTag)(token);
                const foundExpressTokenData = expressInfo.tokens.find(t => (0, util_1.matchTokenTag)(tokenTag, t.tokenTag));
                if (foundExpressTokenData == null) {
                    throw new Error(errors_1.ERRORS.WITHDRAW_TOKEN_NOT_SUPPORT_QUICK_MODE);
                }
                const quickWithdrawLimitBN = (0, util_1.fromUnitToDecimalBN)(foundExpressTokenData.walletBalance, (_g = token === null || token === void 0 ? void 0 : token.decimals) !== null && _g !== void 0 ? _g : 0);
                // 快速提现的手续费，只放入 data 字段中
                const quickWithdrawFeeBN = fee !== undefined
                    ? (0, util_1.fromUnitToDecimalBN)(fee, (_h = token === null || token === void 0 ? void 0 : token.decimals) !== null && _h !== void 0 ? _h : 0)
                    : (0, util_1.toBN)(foundExpressTokenData.withdrawFee);
                // 快速提现的 amount 为全部数量
                decimalOperateAmountBN = (0, util_1.fromUnitToDecimalBN)(amount, (_j = token === null || token === void 0 ? void 0 : token.decimals) !== null && _j !== void 0 ? _j : 0).plus(quickWithdrawFeeBN);
                if (decimalOperateAmountBN.gt(decimalBalanceBN)) {
                    throw new Error(errors_1.ERRORS.WITHDRAW_AMOUNT_LESS_THAN_FEE);
                }
                if (decimalOperateAmountBN.gt(quickWithdrawLimitBN)) {
                    throw new Error(errors_1.ERRORS.INSUFFICIENT_QUICK_WITHDRAWAL_AMOUNT);
                }
                const expressData = (0, util_1.genExpressData)({
                    chainType, to, fee: quickWithdrawFeeBN.toString()
                });
                data = data !== undefined ? { ...data, ...expressData } : { ...expressData };
                // to 需要更改为快速提现收款账户
                to = expressInfo.address;
                // 普通提现
            }
            else {
                action = types_1.EverpayAction.withdraw;
                if (fee !== undefined) {
                    decimalFeeBN = (0, util_1.fromUnitToDecimalBN)(fee, (_k = token === null || token === void 0 ? void 0 : token.decimals) !== null && _k !== void 0 ? _k : 0);
                }
                else {
                    const feeItem = await (0, api_1.getFee)(this._apiHost, (0, util_1.genTokenTag)(token));
                    decimalFeeBN = (0, util_1.toBN)((_l = (0, util_1.getTokenBurnFeeByChainType)(token, feeItem, chainType)) !== null && _l !== void 0 ? _l : '0');
                }
                const targetChainType = chainType;
                data = data !== undefined ? { ...data, targetChainType } : { targetChainType };
                decimalOperateAmountBN = (0, util_1.fromUnitToDecimalBN)(amount, (_m = token === null || token === void 0 ? void 0 : token.decimals) !== null && _m !== void 0 ? _m : 0);
                if (decimalOperateAmountBN.plus(decimalFeeBN).gt(decimalBalanceBN)) {
                    throw new Error(errors_1.ERRORS.WITHDRAW_AMOUNT_LESS_THAN_FEE);
                }
            }
        }
        const everpayTxWithoutSig = {
            tokenSymbol: token === null || token === void 0 ? void 0 : token.symbol,
            action,
            from,
            to,
            amount: decimalOperateAmountBN.toString(),
            fee: decimalFeeBN.toString(),
            feeRecipient: (_q = (_p = (_o = this._cachedInfo) === null || _o === void 0 ? void 0 : _o.everpay) === null || _p === void 0 ? void 0 : _p.value.feeRecipient) !== null && _q !== void 0 ? _q : '',
            nonce: Date.now().toString(),
            tokenID: token === null || token === void 0 ? void 0 : token.id,
            chainType: token === null || token === void 0 ? void 0 : token.chainType,
            chainID: token === null || token === void 0 ? void 0 : token.chainID,
            data: data !== undefined ? JSON.stringify(data) : '',
            version: config_1.everpayTxVersion
        };
        return everpayTxWithoutSig;
    }
    getEverpayTxMessage(everpayTxWithoutSig) {
        return (0, sign_1.getEverpayTxMessage)(everpayTxWithoutSig);
    }
    async signedEverpayTx(everpayTxWithoutSig) {
        const messageData = (0, sign_1.getEverpayTxMessage)(everpayTxWithoutSig);
        const { sig, everHash } = await (0, sign_1.signMessageAsync)(this._config, messageData);
        const everpayTx = {
            ...everpayTxWithoutSig,
            sig
        };
        return { everpayTx, everHash };
    }
    async sendEverpayTx(everpayTxWithoutSig) {
        const { everpayTx, everHash } = await this.signedEverpayTx(everpayTxWithoutSig);
        const postEverpayTxResult = await (0, api_1.postTx)(this._apiHost, everpayTx);
        return {
            ...postEverpayTxResult,
            everpayTx,
            everHash
        };
    }
    async transfer(params) {
        const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('transfer', params);
        return await this.sendEverpayTx(everpayTxWithoutSig);
    }
    async withdraw(params) {
        var _a;
        await this.info();
        const to = (_a = params.to) !== null && _a !== void 0 ? _a : this._config.account;
        const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('withdraw', {
            ...params,
            to
        });
        return await this.sendEverpayTx(everpayTxWithoutSig);
    }
    async getBundleData(items, expiration) {
        var _a, _b;
        await this.info();
        return (0, util_1.genBundleData)({
            items,
            tokenList: (_b = (_a = this._cachedInfo.everpay) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.tokenList,
            // 设置 60s 过期
            expiration: expiration !== null && expiration !== void 0 ? expiration : Math.round(Date.now() / 1000) + 60
        });
    }
    async signBundleData(bundleData) {
        const { items, expiration, salt, version } = bundleData;
        const { sig } = await (0, sign_1.signMessageAsync)(this._config, JSON.stringify({
            // 只签名这几个字段，并且顺序需要保持一致
            items, expiration, salt, version
        }));
        const sigs = bundleData.sigs != null ? bundleData.sigs : {};
        sigs[this._config.account] = sig;
        return {
            items, expiration, salt, version, sigs
        };
    }
    async bundle(params) {
        const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('bundle', params);
        return await this.sendEverpayTx(everpayTxWithoutSig);
    }
    async signAddTokenSet(newToken) {
        const addToken = {
            action: 'addToken',
            operator: this._config.account,
            salt: (0, uuid_1.v4)(),
            version: 'v1',
            expiration: Math.round(Date.now() / 1000) + 100,
            token: newToken,
            sig: ''
        };
        const { sig } = await (0, sign_1.signMessageAsync)(this._config, JSON.stringify({
            action: addToken.action,
            operator: addToken.operator,
            salt: addToken.salt,
            version: addToken.version,
            expiration: addToken.expiration,
            token: addToken.token
        }));
        addToken.sig = sig;
        return addToken;
    }
    async signAddTargetChainSet(tokenTag, targetChain) {
        const addTargetChain = {
            action: 'addTargetChain',
            operator: this._config.account,
            salt: (0, uuid_1.v4)(),
            version: 'v1',
            expiration: Math.round(Date.now() / 1000) + 100,
            tokenTag: tokenTag,
            targetChain: targetChain,
            sig: ''
        };
        const { sig } = await (0, sign_1.signMessageAsync)(this._config, JSON.stringify({
            action: addTargetChain.action,
            operator: addTargetChain.operator,
            salt: addTargetChain.salt,
            version: addTargetChain.version,
            expiration: addTargetChain.expiration,
            tokenTag: addTargetChain.tokenTag,
            targetChain: addTargetChain.targetChain
        }));
        addTargetChain.sig = sig;
        return addTargetChain;
    }
    async signTokenDisplaySet(tokenTag, display) {
        const tokenDisplay = {
            action: 'setTokenDisplay',
            operator: this._config.account,
            salt: (0, uuid_1.v4)(),
            version: 'v1',
            expiration: Math.round(Date.now() / 1000) + 100,
            tokenTag: tokenTag,
            display: display,
            sig: ''
        };
        const { sig } = await (0, sign_1.signMessageAsync)(this._config, JSON.stringify({
            action: tokenDisplay.action,
            operator: tokenDisplay.operator,
            salt: tokenDisplay.salt,
            version: tokenDisplay.version,
            expiration: tokenDisplay.expiration,
            tokenTag: tokenDisplay.tokenTag,
            display: tokenDisplay.display
        }));
        tokenDisplay.sig = sig;
        return tokenDisplay;
    }
    async signOwnershipSet(newOwner) {
        const ownership = {
            action: 'transferOwnership',
            operator: this._config.account,
            salt: (0, uuid_1.v4)(),
            version: 'v1',
            expiration: Math.round(Date.now() / 1000) + 100,
            newOwner: newOwner,
            sig: ''
        };
        const { sig } = await (0, sign_1.signMessageAsync)(this._config, JSON.stringify({
            action: ownership.action,
            operator: ownership.operator,
            salt: ownership.salt,
            version: ownership.version,
            expiration: ownership.expiration,
            newOwner: ownership.newOwner
        }));
        ownership.sig = sig;
        return ownership;
    }
    async setTx(setData) {
        const setParams = { amount: '0', data: setData, symbol: 'eth', to: this._config.account };
        const everpayTxWithoutSig = await this.getEverpayTxWithoutSig('set', setParams);
        return await this.sendEverpayTx(everpayTxWithoutSig);
    }
    async verifyTx(tx) {
        return await (0, sign_1.verifySigAsync)(tx);
    }
}
exports.default = Everpay;
