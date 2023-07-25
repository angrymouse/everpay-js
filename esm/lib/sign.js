import ethereumLib from './ethereum';
import arweaveLib from './arweave';
import { ChainType } from '../types';
import { checkSignConfig } from '../utils/check';
import { ERRORS } from '../utils/errors';
import hashPersonalMessage from './hashPersonalMessage';
import { getAccountChainType } from '../utils/util';
const getDepositAddr = (info, accountChainType) => {
    if (accountChainType === ChainType.ethereum) {
        return info === null || info === void 0 ? void 0 : info.lockers.ethereum;
    }
    else if (accountChainType === ChainType.arweave) {
        // AR 大小写敏感
        return info === null || info === void 0 ? void 0 : info.lockers.arweave;
    }
    else if (accountChainType === ChainType.moon) {
        return info === null || info === void 0 ? void 0 : info.lockers.moon;
    }
    else if (accountChainType === ChainType.conflux) {
        return info === null || info === void 0 ? void 0 : info.lockers.conflux;
    }
    else if (accountChainType === ChainType.bsc) {
        return info === null || info === void 0 ? void 0 : info.lockers.bsc;
    }
    else if (accountChainType === ChainType.platon) {
        return info === null || info === void 0 ? void 0 : info.lockers.platon;
    }
    throw new Error(ERRORS.INVALID_ACCOUNT_TYPE);
};
export const getEverpayTxMessage = (everpayTxWithoutSig) => {
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
export const signMessageAsync = async (config, messageData) => {
    const from = config.account;
    const accountChainType = config.chainType;
    const personalMsgHashBuffer = hashPersonalMessage(Buffer.from(messageData));
    const personalMsgHex = `0x${personalMsgHashBuffer.toString('hex')}`;
    let sig = '';
    checkSignConfig(accountChainType, config);
    if ([
        ChainType.ethereum,
        ChainType.moon,
        ChainType.conflux,
        ChainType.bsc,
        ChainType.platon
    ].includes(accountChainType)) {
        sig = await ethereumLib.signMessageAsync(config.ethConnectedSigner, from, messageData);
    }
    else if (accountChainType === ChainType.arweave) {
        sig = await arweaveLib.signMessageAsync(config.arJWK, from, personalMsgHex);
    }
    else {
        throw new Error(ERRORS.INVALID_ACCOUNT_TYPE);
    }
    return { everHash: personalMsgHex, sig };
};
export const verifySigAsync = async (tx) => {
    const from = tx.from;
    const chainType = getAccountChainType(from);
    const messageData = getEverpayTxMessage(tx);
    if (chainType === ChainType.arweave) {
        return await arweaveLib.verifySigAsync(from, messageData, tx.sig);
    }
    else {
        return await ethereumLib.verifySigAsync(from, messageData, tx.sig);
    }
};
export const transferAsync = async (config, info, params) => {
    checkSignConfig(config.chainType, config);
    const to = getDepositAddr(info, config.chainType);
    const paramsMergedTo = { ...params, to };
    if ([
        ChainType.ethereum,
        ChainType.moon,
        ChainType.conflux,
        ChainType.bsc,
        ChainType.platon
    ].includes(config.chainType)) {
        return await ethereumLib.transferAsync(config.ethConnectedSigner, config.chainType, paramsMergedTo);
    }
    else if (config.chainType === ChainType.arweave) {
        return await arweaveLib.transferAsync(config.arJWK, config.chainType, paramsMergedTo);
    }
    throw new Error(ERRORS.INVALID_ACCOUNT_TYPE);
};
