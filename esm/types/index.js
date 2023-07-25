export var ChainType;
(function (ChainType) {
    ChainType["ethereum"] = "ethereum";
    ChainType["moon"] = "moon";
    ChainType["arweave"] = "arweave";
    ChainType["conflux"] = "conflux";
    ChainType["bsc"] = "bsc";
    ChainType["platon"] = "platon";
})(ChainType || (ChainType = {}));
export var EverpayAction;
(function (EverpayAction) {
    EverpayAction["transfer"] = "transfer";
    EverpayAction["withdraw"] = "burn";
    EverpayAction["bundle"] = "bundle";
    EverpayAction["set"] = "set";
})(EverpayAction || (EverpayAction = {}));
export var EverpayActionWithDeposit;
(function (EverpayActionWithDeposit) {
    EverpayActionWithDeposit["transfer"] = "transfer";
    EverpayActionWithDeposit["withdraw"] = "burn";
    EverpayActionWithDeposit["deposit"] = "mint";
    EverpayActionWithDeposit["bundle"] = "bundle";
})(EverpayActionWithDeposit || (EverpayActionWithDeposit = {}));
var EverpayTransactionStatus;
(function (EverpayTransactionStatus) {
    // deposit 下，经过 6 个区块 everPay confirm
    // mint、burn，后端接收到信息，会先 confirmed
    EverpayTransactionStatus["confirmed"] = "confirmed";
    // JSON 文件存储交易打包完成，变成 packaged
    EverpayTransactionStatus["packaged"] = "packaged";
})(EverpayTransactionStatus || (EverpayTransactionStatus = {}));
export class EverpayBase {
}
