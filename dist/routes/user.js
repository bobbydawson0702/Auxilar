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
exports.userRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const users_1 = __importDefault(require("../models/users"));
const config_1 = __importDefault(require("../config"));
const user_1 = require("../validation/user");
const user_2 = require("../swagger/user");
const options = { abortEarly: false, stripUnknown: true };
exports.userRoute = [
    {
        method: "POST",
        path: "/register",
        options: {
            description: "Register User",
            plugins: user_2.createUserSwagger,
            tags: ["api", "user"],
            validate: {
                payload: user_1.createUserSchema,
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
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const email = request.payload["email"];
                const user = yield users_1.default.findOne({ email });
                if (user) {
                    return response
                        .response([{ message: "User already exists", path: ["email"] }])
                        .code(409);
                }
                console.log("user register request -->", request.payload);
                const newUser = new users_1.default(request.payload);
                const { password } = newUser;
                const hash = yield bcrypt_1.default.hash(password, 10);
                newUser.password = hash;
                const result = yield newUser.save();
                const token = jsonwebtoken_1.default.sign({ userId: result._id, email: result.email }, config_1.default.jwtSecret, {
                    expiresIn: "3m",
                });
                const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
                console.log(baseUrl);
                const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/api/v1/user/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
                // sendMail(result.email, content);
                return response
                    .response({
                    email: result.email,
                    firstName: result.firstName,
                    lastName: result.lastName,
                })
                    .code(201);
            }
            catch (error) {
                console.log(error);
                return response.response(error).code(500);
            }
        }),
    },
    {
        method: "POST",
        path: "/verify-otp",
        options: {
            description: "Verify OTP",
            plugins: user_2.otpSwagger,
            tags: ["api", "user"],
            validate: {
                payload: user_1.otpSchema,
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
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            console.log("verify otp request in-->", request.payload);
            const user = yield users_1.default.findOne({ email: request.payload["email"] });
            if (user) {
                if (user.otp === request.payload["otp"]) {
                    const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, config_1.default.jwtSecret, {
                        expiresIn: "1h",
                    });
                    const fullName = user.firstName + " " + user.lastName;
                    return response
                        .response({
                        token,
                        fullName,
                        role: user.role,
                        kycStatus: user.kycStatus,
                        walletAddress: user.wallet.address,
                        cus_id: user.cus_id,
                    })
                        .code(200);
                }
            }
            return response.response({ msg: "OTP Verification Failed." }).code(400);
        }),
    },
    {
        method: "GET",
        path: "/current",
        options: {
            auth: "jwt",
            description: "Get current user by token",
            plugins: user_2.currentUserSwagger,
            tags: ["api", "user"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = request.auth.credentials.userId;
                const user = yield users_1.default.findById(userId);
                if (user) {
                    const fullName = user.firstName + " " + user.lastName;
                    return response
                        .response({
                        fullName,
                        role: user.role,
                        kycStatus: user.kycStatus,
                        walletAddress: user.wallet.address,
                        cus_id: user.cus_id,
                    })
                        .code(200);
                }
                return response
                    .response({
                    msg: "User not found",
                })
                    .code(404);
            }),
        },
    },
    {
        method: "GET",
        path: "/all",
        options: {
            auth: "jwt",
            description: "Get all user with pagination, firstName, middleName, lastName, email, referralCode, role, emailVerified",
            plugins: user_2.getAllUserSwawgger,
            tags: ["api", "kyc"],
            validate: {
                query: user_1.getAllUserSchema,
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
                const userId = request.auth.credentials.userId;
                const user = yield users_1.default.findById(userId);
                if (user.role === "admin") {
                    let { id, firstName, lastName, middleName, email, emailVerified, role, kycStatus, page, status, } = request.query;
                    const query = {};
                    if (id)
                        query["_id"] = id;
                    if (firstName)
                        query["firstName"] = firstName;
                    if (lastName)
                        query["lastName"] = lastName;
                    if (middleName)
                        query["middleName"] = middleName;
                    if (email)
                        query["email"] = email;
                    if (emailVerified !== undefined)
                        query["emailVerified"] = emailVerified;
                    if (role)
                        query["role"] = role;
                    query["kycStatus"] = 0;
                    const pendingCount = yield users_1.default.countDocuments(query);
                    query["kycStatus"] = 1;
                    const approvedCount = yield users_1.default.countDocuments(query);
                    query["kycStatus"] = 2;
                    const rejectCount = yield users_1.default.countDocuments(query);
                    delete query["kycStatus"];
                    query["status"] = true;
                    const activeCount = yield users_1.default.countDocuments(query);
                    query["status"] = false;
                    const inactiveCount = yield users_1.default.countDocuments(query);
                    delete query["status"];
                    if (kycStatus !== undefined)
                        query["kycStatus"] = kycStatus;
                    if (status !== undefined)
                        query["status"] = status;
                    const total = yield users_1.default.countDocuments(query);
                    if (!page)
                        page = 1;
                    const result = yield users_1.default.find(query)
                        .sort({ createdAt: -1 })
                        .skip((page - 1) * 25)
                        .limit(25);
                    console.log(result);
                    return {
                        total,
                        pendingCount,
                        approvedCount,
                        rejectCount,
                        activeCount,
                        inactiveCount,
                        data: result,
                        offset: page * 25,
                    };
                }
                return response
                    .response({ msg: "You have no permission to access." })
                    .code(403);
            }),
        },
    },
    {
        method: "GET",
        path: "/{userId}",
        options: {
            auth: "jwt",
            description: "Get signle user's information",
            plugins: user_2.getSingleUserSwagger,
            tags: ["api", "user"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = request.auth.credentials.userId;
                const authUser = yield users_1.default.findById(userId);
                if (authUser.role === "admin") {
                    const user = yield users_1.default.findById(request.params.userId);
                    if (user)
                        return user;
                    return response
                        .response({ msg: "Cannot find the specific user's information." })
                        .code(400);
                }
                return response
                    .response({ msg: "You have no permission to access." })
                    .code(403);
            }),
        },
    },
    {
        method: "PUT",
        path: "/{userId}",
        options: {
            auth: "jwt",
            description: "Get single user's information",
            plugins: user_2.getSingleUserSwagger,
            tags: ["api", "user"],
            validate: {
                payload: user_1.userUpdateSchema,
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
                const payload = request.payload;
                if (payload.password) {
                    const hash = yield bcrypt_1.default.hash(payload.password, 10);
                    payload.password = hash;
                }
                const userId = request.auth.credentials.userId;
                const authUser = yield users_1.default.findById(userId);
                if (authUser.role === "admin" || request.params.userId === userId) {
                    const user = yield users_1.default.findOneAndUpdate({ _id: request.params.userId }, { $set: payload }, { new: true });
                    return user;
                }
                return response.response({ msg: "Cannot update" }).code(400);
            }),
        },
    },
    {
        method: "DELETE",
        path: "/{userId}",
        options: {
            auth: "jwt",
            description: "Delete single user",
            plugins: user_2.deleteSingleUserSwagger,
            tags: ["api", "user"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const userId = request.auth.credentials.userId;
                const authUser = yield users_1.default.findById(userId);
                console.log(authUser.role);
                if (authUser.role === "admin" || request.params.userId === userId) {
                    yield users_1.default.findOneAndRemove({ _id: request.params.userId });
                    return response.response({ msg: "User deleted successfully." });
                }
                return response.response({ msg: "Cannot delete user." }).code(400);
            }),
        },
    },
    {
        method: "GET",
        path: "/milestone/:completeId",
        handler: (request, response) => {
            return "Handle milestone!";
        },
    },
];
//# sourceMappingURL=user.js.map