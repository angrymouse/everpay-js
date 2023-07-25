import { isAddress } from '@ethersproject/address';
import isString from 'lodash/isString';
import { v4 as uuidv4 } from 'uuid';
import BN from 'bignumber.js';
import { ERRORS } from './errors';
import { ChainType } from '../types';
import { bundleInternalTxVersion } from '../config';
BN.config({
    EXPONENTIAL_AT: 1000
});
export const toBN = (x) => {
    if (isNaN(Number(x)))
        return new BN(0);
    if (x instanceof BN)
        return x;
    if (typeof x === 'string') {
        if (x.indexOf('0x') === 0 || x.indexOf('-0x') === 0) {
            return new BN((x).replace('0x', ''), 16);
        }
    }
    return new BN(x);
};
export const fromUnitToDecimalBN = (x, decimals) => {
    return toBN(x).times(toBN(10).pow(decimals));
};
export const fromUnitToDecimal = (x, decimals) => {
    return fromUnitToDecimalBN(x, decimals).toString();
};
export const fromDecimalToUnitBN = (x, decimals) => {
    return toBN(x).dividedBy(toBN(10).pow(decimals));
};
export const fromDecimalToUnit = (x, decimals) => {
    return fromDecimalToUnitBN(x, decimals).toString();
};
export const getTimestamp = () => Math.round(Date.now() / 1000);
export const getTokenByTag = (tag, tokenList) => {
    return tokenList === null || tokenList === void 0 ? void 0 : tokenList.find(t => matchTokenTag(genTokenTag(t), tag));
};
const isEthereumAddress = isAddress;
const isArweaveAddress = (address) => {
    return isString(address) && address.length === 43 && address.search(/[a-z0-9A-Z_-]{43}/g) === 0;
};
export const isArweaveChainPSTMode = (token) => {
    if (token == null)
        return false;
    return token.crossChainInfoList[ChainType.arweave] != null && token.symbol.toUpperCase() !== 'AR';
};
export const isArweaveL2PSTTokenSymbol = (symbol) => {
    return (symbol === null || symbol === void 0 ? void 0 : symbol.toUpperCase()) === 'STAMP' || symbol.toUpperCase() === 'U';
};
export const getAccountChainType = (from) => {
    if (isEthereumAddress(from)) {
        return ChainType.ethereum;
    }
    if (isArweaveAddress(from)) {
        return ChainType.arweave;
    }
    throw new Error(ERRORS.INVALID_ACCOUNT_TYPE);
};
export const getTokenAddrByChainType = (token, chainType) => {
    const crossChainInfo = token.crossChainInfoList[chainType];
    return crossChainInfo.targetTokenId;
};
export const getChainDecimalByChainType = (token, chainType) => {
    const crossChainInfo = token.crossChainInfoList[chainType];
    return crossChainInfo.targetDecimals;
};
export const getTokenBurnFeeByChainType = (token, feeItem, chainType) => {
    return feeItem.burnFeeMap[chainType];
};
export const genTokenTag = (token) => {
    const { chainType, symbol, id } = token;
    const chainTypes = chainType.split(',');
    const tokenAddrs = id.split(',').map((addr, index) => {
        if ([
            ChainType.ethereum,
            ChainType.bsc,
            ChainType.conflux,
            ChainType.moon,
            ChainType.platon,
            'everpay'
        ].includes(chainTypes[index])) {
            return addr.toLowerCase();
        }
        return addr;
    });
    return `${chainType.toLowerCase()}-${symbol.toLowerCase()}-${tokenAddrs.join(',')}`;
};
export const matchTokenTag = (tag1, tag2) => {
    return (tag1 === null || tag1 === void 0 ? void 0 : tag1.toLowerCase()) === (tag2 === null || tag2 === void 0 ? void 0 : tag2.toLowerCase());
};
export const genExpressData = (params) => {
    const { chainType, to, fee } = params;
    return {
        appId: 'express',
        withdrawAction: 'pay',
        withdrawTo: to,
        withdrawChainType: chainType,
        withdrawFee: fee
    };
};
export const genBundleData = (params) => {
    const items = params.items.map((item) => {
        const { tag, amount, from, to } = item;
        const token = getTokenByTag(tag, params.tokenList);
        // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
        return {
            tag: genTokenTag(token),
            chainID: token.chainID,
            from,
            to,
            amount: fromUnitToDecimal(amount, token.decimals)
        };
    });
    const salt = uuidv4();
    const version = bundleInternalTxVersion;
    return {
        // 注意：顺序必须与后端保持一致，来让 JSON.stringify() 生成的字符串顺序与后端也一致
        items,
        expiration: params.expiration,
        salt,
        version
    };
};
