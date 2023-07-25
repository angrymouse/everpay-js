import BN from 'bignumber.js';
import { BundleData, ChainType, InternalTransferItem, Token, FeeItem } from '../types';
export declare const toBN: (x: number | string | BN) => BN;
export declare const fromUnitToDecimalBN: (x: number | string | BN, decimals: number) => BN;
export declare const fromUnitToDecimal: (x: number | string | BN, decimals: number) => string;
export declare const fromDecimalToUnitBN: (x: number | string | BN, decimals: number) => BN;
export declare const fromDecimalToUnit: (x: number | string | BN, decimals: number) => string;
export declare const getTimestamp: () => number;
export declare const getTokenByTag: (tag: string, tokenList?: Token[]) => Token | undefined;
export declare const isArweaveChainPSTMode: (token?: Token) => boolean;
export declare const isArweaveL2PSTTokenSymbol: (symbol: string) => boolean;
export declare const getAccountChainType: (from: string) => ChainType;
export declare const getTokenAddrByChainType: (token: Token, chainType: ChainType) => string;
export declare const getChainDecimalByChainType: (token: Token, chainType: ChainType) => number;
export declare const getTokenBurnFeeByChainType: (token: Token, feeItem: FeeItem, chainType: ChainType) => string;
export declare const genTokenTag: (token: Token) => string;
export declare const matchTokenTag: (tag1: string, tag2: string) => boolean;
interface GenExpressDataParams {
    chainType: ChainType;
    to: string;
    fee: string;
}
interface ExpressData {
    appId: 'express';
    withdrawAction: 'pay';
    withdrawTo: string;
    withdrawChainType: ChainType;
    withdrawFee: string;
}
export declare const genExpressData: (params: GenExpressDataParams) => ExpressData;
interface GenBundleDataParams {
    tokenList: Token[];
    items: InternalTransferItem[];
    expiration: number;
}
export declare const genBundleData: (params: GenBundleDataParams) => BundleData;
export {};
//# sourceMappingURL=util.d.ts.map