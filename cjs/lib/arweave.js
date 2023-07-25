"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkArPermissions = void 0;
const arweave_1 = __importDefault(require("arweave"));
const isString_1 = __importDefault(require("lodash/isString"));
const types_1 = require("../types");
const util_1 = require("../utils/util");
const hashPersonalMessage_1 = __importDefault(require("./hashPersonalMessage"));
const api_1 = require("../api");
const options = {
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 20000,
    logging: false // Enable network request logging
};
// TODO: to fix arConnect return result and interface
var ERRORS;
(function (ERRORS) {
    ERRORS["PLEASE_INSTALL_ARCONNECT"] = "PLEASE_INSTALL_ARCONNECT";
    ERRORS["ACCESS_ADDRESS_PERMISSION_NEEDED"] = "ACCESS_ADDRESS_PERMISSION_NEEDED";
    ERRORS["ACCESS_PUBLIC_KEY_PERMISSION_NEEDED"] = "ACCESS_PUBLIC_KEY_PERMISSION_NEEDED";
    ERRORS["SIGNATURE_PERMISSION_NEEDED"] = "NEED_SIGNATURE_PERMISSION";
    ERRORS["SIGN_TRANSACTION_PERMISSION_NEEDED"] = "SIGN_TRANSACTION_PERMISSION_NEEDED";
    ERRORS["SIGNATURE_FAILED"] = "SIGNATURE_FAILED";
    ERRORS["TRANSACTION_POST_ERROR"] = "TRANSACTION_POST_ERROR";
    ERRORS["ACCESS_PUBLIC_KEY_FAILED"] = "ACCESS_PUBLIC_KEY_FAILED";
})(ERRORS || (ERRORS = {}));
const checkArPermissions = async (permissions) => {
    let existingPermissions = [];
    permissions = (0, isString_1.default)(permissions) ? [permissions] : permissions;
    try {
        existingPermissions = await window.arweaveWallet.getPermissions();
    }
    catch {
        throw new Error(ERRORS.PLEASE_INSTALL_ARCONNECT);
    }
    if (permissions.length === 0) {
        return;
    }
    if (permissions.some(permission => {
        return !existingPermissions.includes(permission);
    })) {
        await window.arweaveWallet.connect(permissions);
    }
};
exports.checkArPermissions = checkArPermissions;
const toArrayBuffer = (buffer) => {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return view;
};
const signMessageAsync = async (arJWK, address, everHash) => {
    const arweave = arweave_1.default.init(options);
    const everHashUnit8Array = Buffer.from(everHash.slice(2), 'hex');
    let arOwner = '';
    let signatureB64url = '';
    // web
    if (arJWK === 'use_wallet') {
        try {
            await (0, exports.checkArPermissions)('ACCESS_PUBLIC_KEY');
        }
        catch {
            throw new Error(ERRORS.ACCESS_PUBLIC_KEY_PERMISSION_NEEDED);
        }
        try {
            // TODO: wait arweave-js update arconnect.d.ts
            arOwner = await window.arweaveWallet.getActivePublicKey();
        }
        catch {
            throw new Error(ERRORS.ACCESS_PUBLIC_KEY_FAILED);
        }
        try {
            await (0, exports.checkArPermissions)('SIGNATURE');
        }
        catch {
            throw new Error(ERRORS.SIGNATURE_PERMISSION_NEEDED);
        }
        const algorithm = {
            name: 'RSA-PSS',
            saltLength: 32
        };
        try {
            const signature = await window.arweaveWallet.signature(everHashUnit8Array, algorithm);
            // console.log("signature:", signature)
            const buf = signature;
            signatureB64url = arweave_1.default.utils.bufferTob64Url(buf);
            console.log(signatureB64url);
        }
        catch (e) {
            console.log("Signature error: ", e);
            throw new Error(ERRORS.SIGNATURE_FAILED);
        }
        // node
    }
    else {
        const buf = await arweave.crypto.sign(arJWK, everHashUnit8Array, {
            saltLength: 32
        });
        arOwner = arJWK.n;
        signatureB64url = arweave_1.default.utils.bufferTob64Url(buf);
    }
    return `${signatureB64url},${arOwner}`;
};
const verifySigAsync = async (address, messageData, sig) => {
    const options = {
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false
    };
    const [signature, owner] = sig.split(',');
    const arweave = arweave_1.default.init(options);
    const ownerAddr = await arweave.wallets.ownerToAddress(owner);
    const personalMsgHashBuffer = (0, hashPersonalMessage_1.default)(Buffer.from(messageData));
    const isCorrectOwner = ownerAddr === address;
    if (!isCorrectOwner) {
        return false;
    }
    const verified = await arweave.crypto.verify(owner, personalMsgHashBuffer, arweave.utils.b64UrlToBuffer(signature));
    return verified;
};
const transferAsync = async (arJWK, chainType, { symbol, token, from, to, value }) => {
    const arweave = arweave_1.default.init(options);
    let transactionTransfer;
    if (symbol.toUpperCase() === 'AR') {
        transactionTransfer = await arweave.createTransaction({
            target: to,
            quantity: value.toString()
        }, arJWK);
        // PST Token
    }
    else {
        const tokenID = (0, util_1.getTokenAddrByChainType)(token, types_1.ChainType.arweave);
        transactionTransfer = await arweave.createTransaction({
            data: (Math.random() * 10000).toFixed(),
            last_tx: (0, util_1.isArweaveL2PSTTokenSymbol)(token.symbol) ? 'p7vc1iSP6bvH_fCeUFa9LqoV5qiyW-jdEKouAT0XMoSwrNraB9mgpi29Q10waEpO' : undefined,
            reward: (0, util_1.isArweaveL2PSTTokenSymbol)(token.symbol) ? '0' : undefined
        }, arJWK);
        transactionTransfer.addTag('App-Name', 'SmartWeaveAction');
        transactionTransfer.addTag('App-Version', '0.3.0');
        transactionTransfer.addTag('Contract', tokenID);
        transactionTransfer.addTag('Input', JSON.stringify({
            function: 'transfer',
            qty: value.toNumber(),
            target: to
        }));
    }
    if (arJWK === 'use_wallet') {
        try {
            const existingPermissions = await window.arweaveWallet.getPermissions();
            if (!existingPermissions.includes('SIGN_TRANSACTION')) {
                await window.arweaveWallet.connect(['SIGN_TRANSACTION']);
            }
        }
        catch (_a) {
            // Permission is already granted
        }
        const signedTransaction = await window.arweaveWallet.sign(transactionTransfer);
        // TODO: Temp fix arConnect modify reward
        transactionTransfer.reward = signedTransaction.reward;
        transactionTransfer.setSignature({
            id: signedTransaction.id,
            owner: signedTransaction.owner,
            tags: signedTransaction.tags,
            signature: signedTransaction.signature
        });
    }
    else {
        // 直接给原来 transaction 赋值了 signature 值
        await arweave.transactions.sign(transactionTransfer, arJWK);
    }
    let responseTransfer = null;
    if ((0, util_1.isArweaveL2PSTTokenSymbol)(token.symbol)) {
        await (0, api_1.sendRequest)({
            url: 'https://gateway.warp.cc/gateway/sequencer/register',
            data: transactionTransfer,
            headers: {
                // 'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            method: 'POST'
        });
        responseTransfer = {
            status: 200,
            data: {}
        };
        // responseTransfer = await fetch('https://gateway.warp.cc/gateway/sequencer/register', {
        //   method: 'POST',
        //   body: JSON.stringify(transactionTransfer),
        //   headers: {
        //     'Accept-Encoding': 'gzip, deflate, br',
        //     'Content-Type': 'application/json',
        //     Accept: 'application/json'
        //   }
        // })
    }
    else {
        responseTransfer = await arweave.transactions.post(transactionTransfer);
    }
    if (responseTransfer.status === 200) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (responseTransfer.data.error) {
            throw new Error(responseTransfer.data.error);
        }
        return transactionTransfer;
    }
    throw new Error(ERRORS.TRANSACTION_POST_ERROR);
};
function toUrlSafeBase64(byteArray) {
    let base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let base64 = '';
    let padding = 0;
    for (let i = 0; i < byteArray.length; i += 3) {
        let a = byteArray[i];
        let b = byteArray[i + 1];
        let c = byteArray[i + 2];
        if (b === undefined)
            b = 0, padding++;
        if (c === undefined)
            c = 0, padding++;
        let index1 = a >> 2;
        let index2 = ((a & 3) << 4) | (b >> 4);
        let index3 = ((b & 15) << 2) | (c >> 6);
        let index4 = c & 63;
        base64 += base64Chars[index1] + base64Chars[index2] + base64Chars[index3] + base64Chars[index4];
    }
    base64 = base64.slice(0, base64.length - padding);
    return base64;
}
exports.default = {
    signMessageAsync,
    verifySigAsync,
    transferAsync
};
