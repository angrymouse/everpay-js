import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { EverpayInfo, EverpayTransaction, EverpayTx, TxsResult, FeeItem, ExpressInfo } from '../types';
import { GetEverpayTransactionsParams, GetEverpayBalanceParams, GetEverpayBalanceResult, GetEverpayBalancesParams, GetEverpayBalancesResult, PostEverpayTxResult } from '../types/api';
export declare const sendRequest: (config: AxiosRequestConfig) => Promise<AxiosResponse>;
export declare const getEverpayInfo: (apiHost: string) => Promise<EverpayInfo>;
export declare const getEverpayBalance: (apiHost: string, { account, tokenTag }: GetEverpayBalanceParams) => Promise<GetEverpayBalanceResult>;
export declare const getEverpayBalances: (apiHost: string, { account }: GetEverpayBalancesParams) => Promise<GetEverpayBalancesResult>;
export declare const getEverpayTransactions: (apiHost: string, params: GetEverpayTransactionsParams) => Promise<TxsResult>;
export declare const getEverpayTransaction: (apiHost: string, everHash: string) => Promise<EverpayTransaction>;
export declare const getMintdEverpayTransactionByChainTxHash: (apiHost: string, chainTxHash: string) => Promise<EverpayTransaction>;
export declare const getFees: (apiHost: string) => Promise<FeeItem[]>;
export declare const getFee: (apiHost: string, tokenTag: string) => Promise<FeeItem>;
export declare const postTx: (apiHost: string, params: EverpayTx) => Promise<PostEverpayTxResult>;
export declare const getExpressInfo: (apiHost: string) => Promise<ExpressInfo>;
//# sourceMappingURL=index.d.ts.map