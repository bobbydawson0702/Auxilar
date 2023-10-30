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
exports.executeMetaTransaction = void 0;
const AbiForwarder_json_1 = __importDefault(require("./AbiForwarder.json"));
const localKeys_1 = require("./localKeys");
const venly_1 = require("../venly");
const FORWARDER_CONTRACT_ADDRESS = process.env.FORWARDER_CONTRACT_ADDRESS;
const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];
const types = {
    EIP712Domain,
    ForwardRequest: [
        {
            name: "from",
            type: "address",
        },
        {
            name: "to",
            type: "address",
        },
        {
            name: "value",
            type: "uint256",
        },
        {
            name: "gas",
            type: "uint256",
        },
        {
            name: "nonce",
            type: "uint256",
        },
        {
            name: "data",
            type: "bytes",
        },
    ],
};
const domain = {
    name: "Forwarder",
    version: 1,
    chainId: 5,
    verifyingContract: FORWARDER_CONTRACT_ADDRESS,
};
function executeMetaTransaction(abi, params, from, to, walletId) {
    return __awaiter(this, void 0, void 0, function* () {
        const forwardContract = new localKeys_1.web3.eth.Contract(AbiForwarder_json_1.default, FORWARDER_CONTRACT_ADDRESS);
        const encodedFunctionData = localKeys_1.web3.eth.abi.encodeFunctionCall(abi, params);
        const req = {
            from,
            to,
            value: "0",
            gas: "3000000",
            nonce: yield forwardContract.methods.getNonce(from).call({ from: from }),
            data: encodedFunctionData,
        };
        try {
            domain.chainId = yield localKeys_1.web3.eth.getChainId();
            const signature = yield (0, venly_1.getSignature)(walletId, {
                types: types,
                domain: domain,
                primaryType: "ForwardRequest",
                message: req,
            });
            console.log("execution signature", signature);
            const nonce = yield localKeys_1.web3.eth.getTransactionCount(localKeys_1.adminAccount.address);
            const tx = yield forwardContract.methods
                .execute(req, signature)
                .send({ from: localKeys_1.adminAccount.address, nonce });
            console.log("meta trasaction executed tx ------>", tx);
            return tx.transactionHash;
        }
        catch (error) {
            console.log(error);
            throw new Error("Execution failed" + error);
        }
    });
}
exports.executeMetaTransaction = executeMetaTransaction;
//# sourceMappingURL=utils.js.map