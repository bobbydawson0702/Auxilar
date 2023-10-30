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
exports.transactionRoute = void 0;
const transaction_1 = require("../validation/transaction");
const transaction_2 = require("../swagger/transaction");
const users_1 = __importDefault(require("../models/users"));
const transaction_3 = __importDefault(require("../models/transaction"));
const options = { abortEarly: false, stripUnknown: true };
exports.transactionRoute = [
    {
        method: "GET",
        path: "/all",
        options: {
            auth: "jwt",
            description: "Get all transactions by role with pagination",
            plugins: transaction_2.getTransactionSwagger,
            tags: ["api", "transaction"],
            validate: {
                query: transaction_1.getTransactionSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return {
                            message: d.message,
                            path: d.path,
                        };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                let { page, txType } = request.query;
                if (page === undefined) {
                    page = 1;
                }
                if (txType === undefined) {
                    txType = "all";
                }
                console.log("transaction history -->", page, txType);
                if (user.role === "investor") {
                    const total = yield transaction_3.default.countDocuments({
                        from: user.wallet.address,
                    });
                    const transactionWithProject = yield transaction_3.default.find({
                        from: user.wallet.address,
                        projectId: { $ne: null },
                    })
                        .populate("projectId")
                        .sort({ createdAt: -1 })
                        .exec();
                    const transactionWithoutProject = yield transaction_3.default.find({
                        from: user.wallet.address,
                        projectId: null,
                    })
                        .sort({ createdAt: -1 })
                        .exec();
                    let result = transactionWithProject.concat(transactionWithoutProject);
                    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                    result = result.slice((page - 1) * 25, page * 25);
                    return { total, data: result };
                }
                else if (user.role === "prowner") {
                    let result = [];
                    const total = yield transaction_3.default.countDocuments({
                        from: user.wallet.address,
                    });
                    if (txType === "project") {
                        const transactionWithProject = yield transaction_3.default.find({
                            from: user.wallet.address,
                            projectId: { $ne: null },
                        })
                            .populate("projectId")
                            .skip((page - 1) * 25)
                            .limit(25)
                            .sort({ createdAt: -1 })
                            .exec();
                        result = transactionWithProject;
                    }
                    else {
                        const transactionWithProject = yield transaction_3.default.find({
                            $or: [{ from: user.wallet.address }, { to: user.wallet.address }],
                            projectId: { $ne: null },
                            value: { $ne: 0 },
                        })
                            .populate({
                            path: "projectId",
                            select: "name tokenization.tokenName contract",
                            match: { deleted: false },
                        })
                            .sort({ createdAt: -1 })
                            .exec();
                        const transactionWithoutProject = yield transaction_3.default.find({
                            $or: [{ from: user.wallet.address }, { to: user.wallet.address }],
                            projectId: null,
                            value: { $ne: 0 },
                        })
                            .sort({ createdAt: -1 })
                            .exec();
                        result = transactionWithProject.concat(transactionWithoutProject);
                        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                        result = result.slice((page - 1) * 25, page * 25);
                    }
                    return { total, data: result };
                }
                else {
                    let result = [];
                    const total = yield transaction_3.default.countDocuments({});
                    if (txType === "project") {
                        const transactionWithProject = yield transaction_3.default.find({
                            projectId: { $ne: null },
                        })
                            .populate("projectId")
                            .skip((page - 1) * 25)
                            .limit(25)
                            .sort({ createdAt: -1 })
                            .exec();
                        result = transactionWithProject;
                    }
                    else {
                        const transactionWithProject = yield transaction_3.default.find({
                            projectId: { $ne: null },
                            value: { $ne: 0 },
                        })
                            .populate("projectId")
                            .sort({ createdAt: -1 })
                            .exec();
                        const transactionWithoutProject = yield transaction_3.default.find({
                            projectId: null,
                            value: { $ne: 0 },
                        })
                            .sort({ createdAt: -1 })
                            .exec();
                        result = transactionWithProject.concat(transactionWithoutProject);
                        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                        result = result.slice((page - 1) * 25, page * 25);
                    }
                    return { total, data: result };
                }
            }),
        },
    },
];
//# sourceMappingURL=transaction.js.map