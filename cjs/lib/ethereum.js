"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const erc20_1 = __importDefault(require("../constants/abi/erc20"));
const util_1 = require("../utils/util");
const constants_1 = require("../constants");
// 参考自 zkSync
// https://github.com/WalletConnect/walletconnect-monorepo/issues/347#issuecomment-880553018
const signMessageAsync = async (ethConnectedSigner, address, message) => {
    const messageBytes = ethers_1.utils.toUtf8Bytes(message);
    if (ethConnectedSigner instanceof ethers_1.providers.JsonRpcSigner) {
        try {
            const signature = await ethConnectedSigner.provider.send('personal_sign', [
                ethers_1.utils.hexlify(messageBytes),
                address.toLowerCase()
            ]);
            return signature;
        }
        catch (e) {
            const noPersonalSign = e.message.includes('personal_sign');
            if (noPersonalSign) {
                return await ethConnectedSigner.signMessage(messageBytes);
            }
            throw e;
        }
    }
    else {
        return await ethConnectedSigner.signMessage(messageBytes);
    }
};
const verifySigAsync = async (address, messageData, sig) => {
    const recoveredAddress = await ethers_1.ethers.utils.verifyMessage(messageData, sig);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
};
const transferAsync = async (ethConnectedSigner, chainType, { symbol, token, from, to, value }) => {
    let transactionResponse;
    const foundNative = constants_1.NATIVE_CHAIN_TOKENS.find(t => {
        return t.chainType === chainType && t.nativeSymbol === symbol.toLowerCase();
    });
    // TODO: check balance
    if (foundNative != null) {
        const transactionRequest = {
            from: from.toLowerCase(),
            to: to === null || to === void 0 ? void 0 : to.toLowerCase(),
            gasLimit: 25000,
            value
        };
        transactionResponse = await ethConnectedSigner.sendTransaction(transactionRequest);
    }
    else {
        const tokenID = (0, util_1.getTokenAddrByChainType)(token, chainType);
        const erc20RW = new ethers_1.Contract(tokenID.toLowerCase(), erc20_1.default, ethConnectedSigner);
        transactionResponse = await erc20RW.transfer(to, value, {
            gasLimit: 200000
        });
    }
    return transactionResponse;
};
exports.default = {
    signMessageAsync,
    verifySigAsync,
    transferAsync
};
