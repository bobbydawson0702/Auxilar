"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.invest = exports.deposit = exports.withdraw = exports.claim = exports.getBalance = exports.getShipTokenPrice = exports.getClaimedRewards = exports.getClaimableAmount = exports.getGivenRewards = exports.getWithdrawal = exports.getFundraising = exports.getShipTokenAddress = void 0;
const transaction_1 = __importDefault(require("../../models/transaction"));
const utils_1 = require("./utils");
const AbiManager_json_1 = __importDefault(require("./AbiManager.json"));
const AbiProject_json_1 = __importDefault(require("./AbiProject.json"));
const AbiShipToken_json_1 = __importDefault(require("./AbiShipToken.json"));
const localKeys_1 = require("./localKeys");
const web3_1 = __importDefault(require("web3"));
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const ADMIN_WALLET_VENLY_ID = process.env.ADMIN_WALLET_VENLY_ID;
const managerContract = new localKeys_1.web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
const getShipTokenAddress = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getShipTokenAddress--->", projectId);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const projectContract = new localKeys_1.web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const shipTokenAddress = yield projectContract.methods
            .shipToken()
            .call({ from: localKeys_1.adminAccount.address });
        return shipTokenAddress;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getShipTokenAddress = getShipTokenAddress;
const getFundraising = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getFundraising--->", projectId);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const projectContract = new localKeys_1.web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .fundraising()
            .call({ from: localKeys_1.adminAccount.address });
        return localKeys_1.web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getFundraising = getFundraising;
const getWithdrawal = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getWithdrawal--->", projectId);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const projectContract = new localKeys_1.web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .withdrawal()
            .call({ from: localKeys_1.adminAccount.address });
        return localKeys_1.web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getWithdrawal = getWithdrawal;
const getGivenRewards = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getGivenRewards--->", projectId);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const projectContract = new localKeys_1.web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .givenRewards()
            .call({ from: localKeys_1.adminAccount.address });
        return localKeys_1.web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getGivenRewards = getGivenRewards;
const getClaimableAmount = (projectId, investorAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getClaimableAmount--->", projectId, investorAddress);
        if (investorAddress === "" ||
            !web3_1.default.utils.isAddress(investorAddress) ||
            !web3_1.default.utils.checkAddressChecksum(investorAddress)) {
            return 0;
        }
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const projectContract = new localKeys_1.web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .claimableAmount(investorAddress)
            .call({ from: localKeys_1.adminAccount.address });
        return localKeys_1.web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getClaimableAmount = getClaimableAmount;
const getClaimedRewards = (projectId, investorAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getClaimedRewards--->", projectId, investorAddress);
        if (investorAddress === "" ||
            !web3_1.default.utils.isAddress(investorAddress) ||
            !web3_1.default.utils.checkAddressChecksum(investorAddress)) {
            return 0;
        }
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const projectContract = new localKeys_1.web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .claimed(investorAddress)
            .call({ from: localKeys_1.adminAccount.address });
        return localKeys_1.web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getClaimedRewards = getClaimedRewards;
const getShipTokenPrice = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getShipTokenPrice--->", projectId);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const projectContract = new localKeys_1.web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .shipTokenPrice()
            .call({ from: localKeys_1.adminAccount.address });
        return localKeys_1.web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getShipTokenPrice = getShipTokenPrice;
const getBalance = (projectId, investorAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getBalance--->", projectId, investorAddress);
        if (investorAddress === "" ||
            !web3_1.default.utils.isAddress(investorAddress) ||
            !web3_1.default.utils.checkAddressChecksum(investorAddress)) {
            return 0;
        }
        const shipTokenAddress = yield (0, exports.getShipTokenAddress)(projectId);
        const shipTokenContract = new localKeys_1.web3.eth.Contract(AbiShipToken_json_1.default, shipTokenAddress);
        const result = yield shipTokenContract.methods
            .balanceOf(investorAddress)
            .call({ from: localKeys_1.adminAccount.address });
        return localKeys_1.web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getBalance = getBalance;
const claim = (projectId, accountId, account) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("claim--->", projectId, accountId);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        const amount = yield (0, exports.getClaimableAmount)(projectId, account);
        const txHash = yield (0, utils_1.executeMetaTransaction)({
            type: "function",
            inputs: [],
            name: "claimRewards",
        }, [], account, projectAddress, accountId);
        const transaction = new transaction_1.default({
            from: account,
            projectId,
            value: amount,
            action: "claim rewards",
            txHash,
        });
        yield transaction.save();
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.claim = claim;
const withdraw = (projectId, projectOwnerAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("withdraw--->", projectId);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        console.log("withdraw -->", projectAddress);
        const fundraising = yield (0, exports.getFundraising)(projectId);
        const withdrawal = yield (0, exports.getWithdrawal)(projectId);
        const txHash = yield (0, utils_1.executeMetaTransaction)({
            type: "function",
            inputs: [],
            name: "withdraw",
        }, [], localKeys_1.adminAccount.address, projectAddress, ADMIN_WALLET_VENLY_ID);
        const transaction = new transaction_1.default({
            from: projectOwnerAddress,
            projectId,
            value: Number(fundraising) - Number(withdrawal),
            action: "withdraw on the project",
            txHash,
        });
        yield transaction.save();
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
});
exports.withdraw = withdraw;
const deposit = (projectId, projectOwnerId, projectOwnerAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("deposit--->", projectId, projectOwnerId, amount);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        console.log("project deposit -->", projectAddress);
        yield (0, utils_1.executeMetaTransaction)({
            type: "function",
            inputs: [
                {
                    internalType: "address",
                    name: "spender",
                    type: "address",
                },
                {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "approve",
        }, [projectAddress, localKeys_1.web3.utils.toWei(amount.toString(), "ether").toString()], projectOwnerAddress, MUSD_CONTRACT_ADDRESS, projectOwnerId);
        const txHash = yield (0, utils_1.executeMetaTransaction)({
            type: "function",
            inputs: [
                {
                    internalType: "uint256",
                    name: "_amount",
                    type: "uint256",
                },
            ],
            name: "depositRewards",
        }, [localKeys_1.web3.utils.toWei(amount.toString(), "ether").toString()], projectOwnerAddress, projectAddress, projectOwnerId);
        const trasaction = new transaction_1.default({
            from: projectOwnerAddress,
            projectId,
            value: amount,
            action: "deposit on the project",
            txHash,
        });
        yield trasaction.save();
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.deposit = deposit;
const invest = (projectId, investorId, investorAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("invest--->", projectId, investorId, amount);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        console.log("On investment project address-->", projectAddress);
        yield (0, utils_1.executeMetaTransaction)({
            type: "function",
            inputs: [
                {
                    internalType: "address",
                    name: "spender",
                    type: "address",
                },
                {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                },
            ],
            name: "approve",
        }, [projectAddress, localKeys_1.web3.utils.toWei(amount.toString(), "ether").toString()], investorAddress, MUSD_CONTRACT_ADDRESS, investorId);
        const txHash = yield (0, utils_1.executeMetaTransaction)({
            type: "function",
            inputs: [
                {
                    internalType: "uint256",
                    name: "_amount",
                    type: "uint256",
                },
            ],
            name: "invest",
        }, [localKeys_1.web3.utils.toWei(amount.toString(), "ether").toString()], investorAddress, projectAddress, investorId);
        const transaction = new transaction_1.default({
            from: investorAddress,
            projectId,
            value: amount,
            action: "Invest on project",
            txHash,
        });
        yield transaction.save();
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
});
exports.invest = invest;
//# sourceMappingURL=project.js.map