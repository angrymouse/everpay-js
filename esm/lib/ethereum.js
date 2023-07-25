import { ethers, Contract, utils, providers } from 'ethers';
import erc20Abi from '../constants/abi/erc20';
import { getTokenAddrByChainType } from '../utils/util';
import { NATIVE_CHAIN_TOKENS } from '../constants';
// 参考自 zkSync
// https://github.com/WalletConnect/walletconnect-monorepo/issues/347#issuecomment-880553018
const signMessageAsync = async (ethConnectedSigner, address, message) => {
    const messageBytes = utils.toUtf8Bytes(message);
    if (ethConnectedSigner instanceof providers.JsonRpcSigner) {
        try {
            const signature = await ethConnectedSigner.provider.send('personal_sign', [
                utils.hexlify(messageBytes),
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
    const recoveredAddress = await ethers.utils.verifyMessage(messageData, sig);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
};
const transferAsync = async (ethConnectedSigner, chainType, { symbol, token, from, to, value }) => {
    let transactionResponse;
    const foundNative = NATIVE_CHAIN_TOKENS.find(t => {
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
        const tokenID = getTokenAddrByChainType(token, chainType);
        const erc20RW = new Contract(tokenID.toLowerCase(), erc20Abi, ethConnectedSigner);
        transactionResponse = await erc20RW.transfer(to, value, {
            gasLimit: 200000
        });
    }
    return transactionResponse;
};
export default {
    signMessageAsync,
    verifySigAsync,
    transferAsync
};
