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
exports.expertRoute = void 0;
// import Jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
// import fs from 'fs';
// import { Path } from "mongoose";
// import process from "process";
const account_1 = __importDefault(require("../../models/account"));
// import config from '../config';
const expert_1 = require("../../swagger/profile/expert");
const expert_2 = require("../../validation/profile/expert");
const expert_3 = __importDefault(require("../../models/profile/expert"));
const skill_1 = require("../../swagger/skill");
const skill_2 = __importDefault(require("../../models/skill"));
const major_1 = __importDefault(require("../../models/major"));
const options = { abortEarly: false, stripUnknown: true };
exports.expertRoute = [
    {
        method: "POST",
        path: "/",
        // config: {
        options: {
            auth: "jwt",
            description: "Create  expert profile",
            plugins: expert_1.ProfileSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.ProfileSchema,
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
            var _a;
            try {
                console.log(`POST api/v1/expert request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                // check account type
                // if(account.account_type !== 'expert') {
                //   return response.response({status:'err', err: 'Not allowed expert profile!'}).code(403);
                // }
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const expertField = {
                    account: account.id,
                    address: data["address"],
                    post_number: data["post_number"],
                    languages: data["languages"],
                    avatar: (_a = data["avatar"]) !== null && _a !== void 0 ? _a : null,
                    hourly_rate: data["hourly_rate"],
                    summary: data["summary"],
                    verified_by: data["verified_by"],
                    portfolios: data["portfolios"],
                    skills: data["skills"],
                    majors: data["majors"],
                    resume: data["resume"],
                    profile_links: data["profile_links"],
                    linkedin: data["linkedin"],
                    education: data["education"],
                };
                // const expert = await Expert.findOneAndUpdate(
                //   { account: account.id },
                //   { $set: expertField },
                //   { new: true, upsert: true, setDefaultsOnInsert: true }
                // );
                const expert = new expert_3.default(expertField);
                yield expert.save();
                const responseData = yield expert.populate("account", [
                    "first_name",
                    "last_name",
                    "email",
                ]);
                console.log(`response data : ${responseData}`);
                return response
                    .response({ status: "ok", data: "Profile created successfully" })
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
            description: "Get expert profile",
            plugins: expert_1.getProfileSwagger,
            tags: ["api", "expert"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/expert/ request from ${request.auth.credentials.email}`);
                const expert = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                });
                if (!expert) {
                    console.log("Profile not found!");
                    return response
                        .response({ status: "err", err: "Profile not found!" })
                        .code(404);
                }
                // const responseData = await expert
                // .populate("account", ["first_name", "last_name", "email"])
                // .select("-ongoing_project");
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                })
                    .populate("account", ["first_name", "last_name", "email"])
                    .select("-ongoing_project");
                // const responseData = expert;
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
        path: "/person-info",
        options: {
            auth: "jwt",
            description: "Update expert base info",
            plugins: expert_1.updateBaseInfoSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updateBaseInfoSchema,
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
                console.log(`PUT api/v1/expert/person-info request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: {
                        avatar: data["avatar"],
                        hourly_rate: data["hourly_rate"],
                    },
                });
                // await expert.save();
                // const responseData = await expert.populate("account", [
                //   "first_name",
                //   "last_name",
                //   "email",
                // ]);
                // const responseData = await Expert.findOne({
                //   account: request.auth.credentials.accountId,
                // })
                //   .populate("account", ["first_name", "last_name", "email"])
                //   .select("-ongoing_project");
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).select("avatar hourly_rate");
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
        path: "/summary",
        options: {
            auth: "jwt",
            description: "Update expert summary",
            plugins: expert_1.updateSummarySwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updateSummarySchema,
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
                console.log(`PUT api/v1/expert/summary request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: {
                        summary: data["summary"],
                    },
                });
                // await expert.save();
                // const responseData = await expert.populate("account", [
                //   "first_name",
                //   "last_name",
                //   "email",
                // ]);
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                })
                    .populate("account", ["first_name", "last_name", "email"])
                    .select("-ongoing_project");
                // const responseData = await Expert.findOne({
                //   account: request.auth.credentials.accountId,
                // }).select("summary");
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
        path: "/portfolio",
        options: {
            auth: "jwt",
            description: "Update expert portfolio",
            plugins: expert_1.updatePortfolioSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updatePortfolioSchema,
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
                console.log(`PUT api/v1/expert/portfolio request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: {
                        portfolios: data["portfolios"],
                    },
                });
                // await expert.save();
                console.log("expert--------------", expert);
                // const responseData = await expert.populate("account", [
                //   "first_name",
                //   "last_name",
                //   "email",
                // ]);
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                })
                    .populate("account", ["first_name", "last_name", "email"])
                    .select("-ongoing_project");
                // const responseData = await Expert.findOne({
                //   account: request.auth.credentials.accountId,
                // }).select("portfolios");
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
        path: "/portfolio/{portfolio_id}",
        options: {
            auth: "jwt",
            description: "Update expert portfolio indiviually",
            plugins: expert_1.updatePortfolioItemSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updatePortfolioItemSchema,
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
                console.log(`PUT api/v1/expert/portfolio/${request.params.portfolio_id} from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data ----------------->", data);
                console.log(`portfolio_id : ${request.params.portfolio_id}`);
                // const portfolioItem = await Expert.findOne({
                //   account: request.auth.credentials.accountId,
                // })
                //   .select("portfolios");
                // .findOne({
                //    "portfolios._id": request.params.portfolio_id
                // });
                const portfolioItem = yield expert_3.default.findOne({
                    "portfolios._id": request.params.portfolio_id,
                });
                // const result = portfolioItem.portfolios.map((item) => String(item._id) === String(request.params.portfolio_id));
                // console.log('--->>>>', result);
                console.log(portfolioItem);
                // await portfolioItem.save();
                const responseData = portfolioItem;
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
        path: "/verifier",
        options: {
            auth: "jwt",
            description: "Update expert verifier",
            plugins: expert_1.updateVerifierSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updateVerifierSchema,
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
                console.log(`PUT api/v1/expert/verifier request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: {
                        verified_by: data["verified_by"],
                    },
                });
                // await expert.save();
                // const responseData = await expert.populate("account", [
                //   "first_name",
                //   "last_name",
                //   "email",
                // ]);
                // const responseData = await Expert.findOne({
                //   account: request.auth.credentials.accountId,
                // })
                //   .populate("account", ["first_name", "last_name", "email"])
                //   .select("-ongoing_project");
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).select("verified_by");
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
        path: "/resume",
        options: {
            auth: "jwt",
            description: "Update expert resume",
            plugins: expert_1.updateResumeSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updateResumeSchema,
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
                console.log(`PUT api/v1/expert/resume request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: {
                        resume: data["resume"],
                    },
                });
                // await expert.save();
                // const responseData = await expert.populate("account", [
                //   "first_name",
                //   "last_name",
                //   "email",
                // ]);
                // const responseData = await Expert.findOne({
                //   account: request.auth.credentials.accountId,
                // })
                //   .populate("account", ["first_name", "last_name", "email"])
                //   .select("-ongoing_project");
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                }).select("resume");
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
        path: "/person-detail",
        options: {
            auth: "jwt",
            description: "Update expert person-detail",
            plugins: expert_1.updatePersonDetailSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updatePersonDetailSchema,
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
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            try {
                console.log(`PUT api/v1/expert/person-detail request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const updateData = {
                    address: (_b = data["address"]) !== null && _b !== void 0 ? _b : null,
                    post_number: (_c = data["post_number"]) !== null && _c !== void 0 ? _c : null,
                    languages: (_d = data["languages"]) !== null && _d !== void 0 ? _d : null,
                    skills: (_e = data["skills"]) !== null && _e !== void 0 ? _e : null,
                    majors: (_f = data["majors"]) !== null && _f !== void 0 ? _f : null,
                    reviews: (_g = data["reviews"]) !== null && _g !== void 0 ? _g : null,
                    active_status: (_h = data["active_status"]) !== null && _h !== void 0 ? _h : null,
                    account_status: (_j = data["account_status"]) !== null && _j !== void 0 ? _j : null,
                    profile_links: (_k = data["profile_links"]) !== null && _k !== void 0 ? _k : null,
                    linkedin: (_l = data["linkedin"]) !== null && _l !== void 0 ? _l : null,
                };
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: updateData,
                });
                // await expert.save();
                // const responseData = await expert.populate("account", [
                //   "first_name",
                //   "last_name",
                //   "email",
                // ]);
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                })
                    .populate("account", ["first_name", "last_name", "email"])
                    .select("-ongoing_project");
                // const responseData = await Expert.findOne({
                //   account: request.auth.credentials.accountId,
                // }).select(
                //   "address post_number languages skills majors reviews active_status profile_links linkedin"
                // );
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
        path: "/education",
        options: {
            auth: "jwt",
            description: "Update expert education",
            plugins: expert_1.updateEducationSwagger,
            tags: ["api", "expert"],
            validate: {
                payload: expert_2.updateEducationSchema,
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
                console.log(`PUT api/v1/expert/education request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                console.log(account);
                const data = request.payload;
                console.log("data---------------", data);
                const updateData = {
                    education: data["education"],
                };
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, {
                    $set: updateData,
                });
                const responseData = yield expert_3.default.findOne({
                    account: request.auth.credentials.accountId,
                })
                    .populate("account", ["first_name", "last_name", "email"])
                    .select("-ongoing_project");
                console.log(`response data : ${responseData}`);
                return response.response({
                    status: "ok",
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
            description: "Delete expert profile",
            plugins: expert_1.deleteProfileSwagger,
            tags: ["api", "expert"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`DELETE api/v1/expert request from ${request.auth.credentials.email}`);
                const deleteStatus = yield expert_3.default.deleteOne({
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
    {
        method: "GET",
        path: "/all-skills",
        options: {
            auth: "jwt",
            description: "Get all recorded Skills",
            plugins: skill_1.getAllSkills,
            tags: ["api", "expert"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/expert/all-skills request from ${request.auth.credentials.email}`);
                const allSkills = yield skill_2.default.find();
                if (!allSkills) {
                    return response
                        .response({ status: "err", err: "Recorded skill not found!" })
                        .code(404);
                }
                return response.response({ status: "ok", data: allSkills }).code(200);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/all-majors",
        options: {
            auth: "jwt",
            description: "Get all recorded Majors",
            plugins: skill_1.getAllSkills,
            tags: ["api", "expert"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/expert/all-majors request from ${request.auth.credentials.email}`);
                const allMajors = yield major_1.default.find();
                if (!allMajors) {
                    return response
                        .response({ status: "err", err: "Recorded major not found!" })
                        .code(404);
                }
                return response.response({ status: "ok", data: allMajors }).code(200);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
];
//# sourceMappingURL=expert.js.map