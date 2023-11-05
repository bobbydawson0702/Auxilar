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
exports.mentorRoute = void 0;
const mentor_1 = require("../../swagger/profile/mentor");
const mentor_2 = require("../../validation/profile/mentor");
const account_1 = __importDefault(require("../../models/account"));
const mentor_3 = __importDefault(require("../../models/profile/mentor"));
const options = { abortEarly: false, stripUnknown: true };
exports.mentorRoute = [
    {
        method: "POST",
        path: "/",
        options: {
            auth: "jwt",
            description: "Create mentor profile",
            plugins: mentor_1.ProfileSwagger,
            tags: ["api", "mentor"],
            validate: {
                payload: mentor_2.ProfileSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                console.log(`POST api/v1/mentor request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                // Check account type
                if (account.account_type !== "mentor") {
                    return response
                        .response({ status: "err", err: "Not allowed" })
                        .code(403);
                }
                console.log(account);
                const data = request.payload;
                console.log("data---------------------------", data);
                let birthday = new Date("<yyyy-mm-dd>");
                birthday = data["birthday"];
                const mentorField = {
                    account: account.id,
                    email: account.email,
                    avatar: (_a = data["avatar"]) !== null && _a !== void 0 ? _a : null,
                    birthday: birthday,
                    country: data["country"],
                    state: data["state"],
                    city: data["city"],
                    address: data["address"],
                    languages: data["languages"],
                    summary: data["summary"],
                    social_media: (_b = data["social_media"]) !== null && _b !== void 0 ? _b : null,
                    payment_verify: (_c = data["payment_verify"]) !== null && _c !== void 0 ? _c : null,
                    payment_info: (_d = data["payment_info"]) !== null && _d !== void 0 ? _d : null,
                    professional_info: (_e = data["professional_info"]) !== null && _e !== void 0 ? _e : null,
                };
                // const mentor = await Mentor.findOneAndUpdate(
                //   { account: account.id },
                //   { $set: mentorField },
                //   { new: true, upsert: true, setDefaultOnInsert: true }
                // );
                // Check whether mentor profile already exists
                const mentorExist = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                });
                if (mentorExist)
                    return response
                        .response({ status: "err", err: "already exists" })
                        .code(403);
                const mentor = new mentor_3.default(mentorField);
                yield mentor.save();
                const responseData = yield mentor.populate("account", [
                    "firt_name",
                    "last_name",
                    "email",
                ]);
                console.log(`response data: ${responseData}`);
                // return response.response({ status: 'ok', data: 'Profile created successfully' }).code(201);
                return response
                    .response({ status: "ok", data: responseData })
                    .code(201);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/",
        options: {
            auth: "jwt",
            description: "Get mentor profile",
            plugins: mentor_1.getProfileSwagger,
            tags: ["api", "mentor"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/mentor/ request from ${request.auth.credentials.email}`);
                const mentor = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                });
                if (!mentor) {
                    console.log("Profile not found!");
                    return response
                        .response({ status: "err", err: "Profile not found!" })
                        .code(404);
                }
                const responseData = yield mentor.populate("account", [
                    "first_name",
                    "last_name",
                ]);
                console.log("request success");
                console.log(`response data : ${responseData}`);
                return response
                    .response({ status: "ok", data: responseData })
                    .code(200);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/summary",
        options: {
            auth: "jwt",
            description: "Update mentor summary",
            plugins: mentor_1.updateSummarySwagger,
            tags: ["api", "mentor"],
            validate: {
                payload: mentor_2.updateSummarySchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`PUT api/v1/mentor/summary request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const mentor = yield mentor_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: {
                        summary: data["summary"],
                    },
                });
                const responseData = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).populate("account", ["first_name", "last_name", "email"]);
                console.log(`response data : ${responseData}`);
                return response.response({
                    status: "ok",
                    // data: "Profile updated successfully",
                    data: responseData,
                });
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/avatar",
        options: {
            auth: "jwt",
            description: "Update mentor avatar",
            plugins: mentor_1.updateAvatarSwagger,
            tags: ["api", "mentor"],
            validate: {
                payload: mentor_2.updateAvatarSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`PUT api/v1/mentor/avatar request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const mentor = yield mentor_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: {
                        avatar: data["avatar"],
                    },
                });
                const responseData = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).populate("account", ["first_name", "last_name", "email"]);
                console.log(`response data : ${responseData}`);
                return response.response({
                    status: "ok",
                    // data: "Profile updated successfully",
                    data: responseData,
                });
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/personal-info",
        options: {
            auth: "jwt",
            description: "Update mentor personal information",
            plugins: mentor_1.updatePersonalInfoSwagger,
            tags: ["api", "mentor"],
            validate: {
                payload: mentor_2.updatePersonalInfoSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`PUT api/v1/mentor/peronal-info request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const updateData = {
                    country: data["country"],
                    state: data["state"],
                    city: data["city"],
                    address: data["address"],
                    languages: data["languages"],
                };
                const mentor = yield mentor_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: updateData,
                });
                const responseData = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).populate("account", ["first_name", "last_name", "email"]);
                console.log(`response data : ${responseData}`);
                return response.response({
                    status: "ok",
                    // data: "Profile updated successfully",
                    data: responseData,
                });
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/social-media",
        options: {
            auth: "jwt",
            description: "Update mentor social media",
            plugins: mentor_1.updateSocialMediaSwagger,
            tags: ["api", "mentor"],
            validate: {
                payload: mentor_2.updateSocialMediaSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`PUT api/v1/mentor/social-media request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const updateData = {
                    social_media: data["social_media"],
                };
                const mentor = yield mentor_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: updateData,
                });
                const responseData = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).populate("account", ["first_name", "last_name", "email"]);
                console.log(`response data : ${responseData}`);
                return response.response({
                    status: "ok",
                    // data: "Profile updated successfully",
                    data: responseData,
                });
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/payment-info",
        options: {
            auth: "jwt",
            description: "Update mentor payment information",
            plugins: mentor_1.updatePaymentInfoSwagger,
            tags: ["api", "mentor"],
            validate: {
                payload: mentor_2.updatePaymentInfoSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`PUT api/v1/mentor/social-media request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const updateData = {
                    payment_info: data["payment_info"],
                };
                const mentor = yield mentor_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: updateData,
                });
                const responseData = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).populate("account", ["first_name", "last_name", "email"]);
                console.log(`response data : ${responseData}`);
                return response.response({
                    status: "ok",
                    // data: "Profile updated successfully",
                    data: responseData,
                });
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/professional-info",
        options: {
            auth: "jwt",
            description: "Update mentor professional information",
            plugins: mentor_1.updateProfessionalInfoSwagger,
            tags: ["api", "mentor"],
            validate: {
                payload: mentor_2.updateProfessionalInfoSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`PUT api/v1/mentor/social-media request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const updateData = {
                    professional_info: data["professional_info"],
                };
                const mentor = yield mentor_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: updateData,
                });
                const responseData = yield mentor_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).populate("account", ["first_name", "last_name", "email"]);
                console.log(`response data : ${responseData}`);
                return response.response({
                    status: "ok",
                    // data: "Profile updated successfully",
                    data: responseData,
                });
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "DELETE",
        path: "/",
        options: {
            auth: "jwt",
            description: "Delete mentor profile",
            plugins: mentor_1.deleteProfileSwagger,
            tags: ["api", "mentor"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`DELETE api/v1/mentor request from ${request.auth.credentials.email}`);
                const deleteStatus = yield mentor_3.default.deleteOne({
                    account: request.auth.credentials.accountId,
                });
                console.log("delete result ----------->", deleteStatus);
                if (deleteStatus.deletedCount)
                    return response
                        .response({ status: "ok", data: "Successfuly deleted!" })
                        .code(200);
                else
                    return response
                        .response({ status: "err", err: "Profile not found!" })
                        .code(404);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
];
//# sourceMappingURL=mentor.js.map