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
exports.depositRoute = void 0;
const deposit_1 = require("../swagger/deposit");
const deposit_2 = __importDefault(require("../models/deposit"));
const users_1 = __importDefault(require("../models/users"));
const venly_1 = require("../utils/venly");
const deposit_3 = require("../validation/deposit");
const coinpayment_1 = require("../utils/coinpayment");
const musd_1 = require("../utils/blockchain/musd");
const options = { abortEarly: false, stripUnknown: true };
const client = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.depositRoute = [
    {
        method: "POST",
        path: "/",
        options: {
            auth: "jwt",
            description: "Create deposit",
            plugins: deposit_1.createDepositSwagger,
            tags: ["api", "vessel"],
            validate: {
                payload: deposit_3.depositSchema,
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
                if (user.wallet.address === "") {
                    const wallet = yield (0, venly_1.createWallet)();
                    console.log(wallet);
                    user.wallet.address = wallet.result.address;
                    user.wallet.id = wallet.result.id;
                    yield user.save();
                }
                const query = {
                    userId: user._id,
                    amount: request.payload["amount"],
                };
                const traHistory = yield deposit_2.default.find(query);
                if (traHistory.length !== 0) {
                    return traHistory[0];
                }
                const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
                const ipn_url = `${baseUrl}/api/v1/deposit/ipn/${user._id}/${query.amount}`;
                console.log(ipn_url);
                const transaction = yield (0, coinpayment_1.createTransaction)(ipn_url, user.email, "USD", "ETH", query.amount);
                console.log(transaction);
                const newDeposit = new deposit_2.default({
                    userId: user._id,
                    amount: request.payload["amount"],
                    callback_url: transaction["checkout_url"],
                    expire: Date.now() + transaction["timeout"] * 1000,
                });
                yield newDeposit.save();
                return newDeposit;
            }),
        },
    },
    {
        method: "POST",
        path: "/ipn/{userId}/{amount}",
        options: {
            description: "Handle IPN",
            plugins: deposit_1.ipnSwagger,
            tags: ["api", "vessel"],
            validate: {
                params: deposit_3.ipnSchema,
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
                const query = {
                    userId: request.params["userId"],
                    amount: request.params["amount"],
                };
                const traHistory = yield deposit_2.default.find(query);
                const user = yield users_1.default.findById(query.userId);
                if (traHistory.length !== 0) {
                    if (request.payload["status"] == 100) {
                        try {
                            yield (0, musd_1.mint)(user.wallet.address, query.amount);
                            yield traHistory[0].deleteOne();
                        }
                        catch (error) {
                            console.log(error);
                        }
                        return response.response("Deposit Success");
                    }
                    return response.response({ msg: "Deposit failed" }).code(400);
                }
                return response.response({ msg: "Deposit can't find" }).code(404);
            }),
        },
    },
    {
        method: "POST",
        path: "/stripe/webhook",
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(request.payload["type"]);
            const sig = request.headers["stripe-signature"];
            if (request.payload["type"] === "charge.succeeded") {
                const cus_id = request.payload["data"]["object"]["customer"];
                const amount = request.payload["data"]["object"]["amount"];
                console.log(cus_id);
                const user = yield users_1.default.findOne({ cus_id: cus_id });
                if (user.wallet.address === "") {
                    const wallet = yield (0, venly_1.createWallet)();
                    console.log(wallet);
                    user.wallet.address = wallet.result.address;
                    user.wallet.id = wallet.result.id;
                    yield user.save();
                }
                try {
                    yield (0, musd_1.mint)(user.wallet.address, amount / 100);
                }
                catch (error) {
                    console.log(error);
                }
                console.log(request.payload["data"]["object"]["receipt_url"]);
                return response.response("Success");
            }
            return response.response("Handle Not Charing");
        }),
    },
];
//# sourceMappingURL=deposit.js.map