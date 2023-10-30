"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const transactionSchema = new Schema({
    from: {
        type: String,
        required: true,
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "project",
    },
    value: {
        type: Number,
        required: true,
    },
    action: {
        type: String,
        reqruied: true,
    },
    txHash: {
        type: String,
    },
}, { timestamps: true });
const Transaction = mongoose_1.default.model("transaction", transactionSchema);
exports.default = Transaction;
//# sourceMappingURL=transaction.js.map