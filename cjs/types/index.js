"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EverpayBase = exports.EverpayActionWithDeposit = exports.EverpayAction = exports.ChainType = void 0;
var ChainType;
(function (ChainType) {
    ChainType["ethereum"] = "ethereum";
    ChainType["moon"] = "moon";
    ChainType["arweave"] = "arweave";
    ChainType["conflux"] = "conflux";
    ChainType["bsc"] = "bsc";
    ChainType["platon"] = "platon";
})(ChainType = exports.ChainType || (exports.ChainType = {}));
var EverpayAction;
(function (EverpayAction) {
    EverpayAction["transfer"] = "transfer";
    EverpayAction["withdraw"] = "burn";
    EverpayAction["bundle"] = "bundle";
    EverpayAction["set"] = "set";
})(EverpayAction = exports.EverpayAction || (exports.EverpayAction = {}));
var EverpayActionWithDeposit;
(function (EverpayActionWithDeposit) {
    EverpayActionWithDeposit["transfer"] = "transfer";
    EverpayActionWithDeposit["withdraw"] = "burn";
    EverpayActionWithDeposit["deposit"] = "mint";
    EverpayActionWithDeposit["bundle"] = "bundle";
})(EverpayActionWithDeposit = exports.EverpayActionWithDeposit || (exports.EverpayActionWithDeposit = {}));
var EverpayTransactionStatus;
(function (EverpayTransactionStatus) {
    // deposit 下，经过 6 个区块 everPay confirm
    // mint、burn，后端接收到信息，会先 confirmed
    EverpayTransactionStatus["confirmed"] = "confirmed";
    // JSON 文件存储交易打包完成，变成 packaged
    EverpayTransactionStatus["packaged"] = "packaged";
})(EverpayTransactionStatus || (EverpayTransactionStatus = {}));
class EverpayBase {
}
exports.EverpayBase = EverpayBase;
