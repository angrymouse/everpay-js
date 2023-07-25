import { SignMessageAsyncResult, TransferAsyncParams } from './interface';
import { Config, EverpayInfo, EverpayTxWithoutSig, EthereumTransaction, ArweaveTransaction, EverpayTransaction } from '../types';
export declare const getEverpayTxMessage: (everpayTxWithoutSig: EverpayTxWithoutSig) => string;
export declare const signMessageAsync: (config: Config, messageData: string) => Promise<SignMessageAsyncResult>;
export declare const verifySigAsync: (tx: EverpayTransaction) => Promise<boolean>;
export declare const transferAsync: (config: Config, info: EverpayInfo, params: TransferAsyncParams) => Promise<EthereumTransaction | ArweaveTransaction>;
//# sourceMappingURL=sign.d.ts.map