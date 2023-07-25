import { Config, EverpayInfo, EverpayBase, BalanceParams, BalancesParams, DepositParams, SendEverpayTxResult, TransferParams, WithdrawParams, EverpayTxWithoutSig, BundleData, FeeItem, ChainType, BalanceItem, TxsParams, TxsByAccountParams, TxsResult, EverpayTransaction, EthereumTransaction, ArweaveTransaction, ExpressInfo, InternalTransferItem, BundleDataWithSigs, BundleParams, EverpayTx, AddTokenSet, NewToken, SetParams, TargetChainMeta, AddTargetChainSet, TokenDisplaySet, OwnershipSet } from './types';
export * from './types';
declare class Everpay extends EverpayBase {
    constructor(config?: Config);
    private readonly _apiHost;
    private readonly _expressHost;
    private readonly _config;
    private _cachedInfo;
    getAccountChainType: (from: string) => ChainType;
    private readonly cacheHelper;
    info(): Promise<EverpayInfo>;
    expressInfo(): Promise<ExpressInfo>;
    balance(params: BalanceParams): Promise<string>;
    balances(params?: BalancesParams): Promise<BalanceItem[]>;
    private getMergedTxsParams;
    txs(params: TxsParams): Promise<TxsResult>;
    txsByAccount(params: TxsByAccountParams): Promise<TxsResult>;
    txByHash(everHash: string): Promise<EverpayTransaction>;
    mintedTxByChainTxHash(chainTxHash: string): Promise<EverpayTransaction>;
    fees(): Promise<FeeItem[]>;
    fee(tag: string): Promise<FeeItem>;
    deposit(params: DepositParams): Promise<EthereumTransaction | ArweaveTransaction>;
    getEverpayTxWithoutSig(type: 'transfer' | 'withdraw' | 'bundle' | 'set', params: TransferParams | WithdrawParams | BundleParams | SetParams): Promise<EverpayTxWithoutSig>;
    getEverpayTxMessage(everpayTxWithoutSig: EverpayTxWithoutSig): string;
    signedEverpayTx(everpayTxWithoutSig: EverpayTxWithoutSig): Promise<{
        everpayTx: EverpayTx;
        everHash: string;
    }>;
    sendEverpayTx(everpayTxWithoutSig: EverpayTxWithoutSig): Promise<SendEverpayTxResult>;
    transfer(params: TransferParams): Promise<SendEverpayTxResult>;
    withdraw(params: WithdrawParams): Promise<SendEverpayTxResult>;
    getBundleData(items: InternalTransferItem[], expiration?: number): Promise<BundleData>;
    signBundleData(bundleData: BundleData | BundleDataWithSigs): Promise<BundleDataWithSigs>;
    bundle(params: BundleParams): Promise<SendEverpayTxResult>;
    signAddTokenSet(newToken: NewToken): Promise<AddTokenSet>;
    signAddTargetChainSet(tokenTag: string, targetChain: TargetChainMeta): Promise<AddTargetChainSet>;
    signTokenDisplaySet(tokenTag: string, display: boolean): Promise<TokenDisplaySet>;
    signOwnershipSet(newOwner: string): Promise<OwnershipSet>;
    setTx(setData: any): Promise<SendEverpayTxResult>;
    verifyTx(tx: EverpayTransaction): Promise<boolean>;
}
export default Everpay;
//# sourceMappingURL=index.d.ts.map