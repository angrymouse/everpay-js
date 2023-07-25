import { ArJWK, ArweaveTransaction, ChainType } from '../types';
import { TransferAsyncParams } from './interface';
export declare const checkArPermissions: (permissions: string[] | string) => Promise<void>;
declare const _default: {
    signMessageAsync: (arJWK: ArJWK, address: string, everHash: string) => Promise<string>;
    verifySigAsync: (address: string, messageData: string, sig: string) => Promise<boolean>;
    transferAsync: (arJWK: ArJWK, chainType: ChainType, { symbol, token, from, to, value }: TransferAsyncParams) => Promise<ArweaveTransaction>;
};
export default _default;
//# sourceMappingURL=arweave.d.ts.map