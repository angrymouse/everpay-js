import { ethers } from 'ethers';
import { TransferAsyncParams } from './interface';
import { ChainType } from '../types';
declare const _default: {
    signMessageAsync: (ethConnectedSigner: ethers.Signer, address: string, message: string) => Promise<string>;
    verifySigAsync: (address: string, messageData: string, sig: string) => Promise<boolean>;
    transferAsync: (ethConnectedSigner: ethers.Signer, chainType: ChainType, { symbol, token, from, to, value }: TransferAsyncParams) => Promise<ethers.providers.TransactionResponse>;
};
export default _default;
//# sourceMappingURL=ethereum.d.ts.map