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
exports.jobRoute = void 0;
const job_1 = require("../swagger/job");
const job_2 = require("../validation/job");
// import mongoose from "mongoose";
// import config from "../config";
const account_1 = __importDefault(require("../models/account"));
const job_3 = __importDefault(require("../models/job"));
const client_1 = __importDefault(require("../models/profile/client"));
const expert_1 = __importDefault(require("../models/profile/expert"));
// require('dotenv').config();
const options = { abortEarly: false, stripUnknown: true };
exports.jobRoute = [
    {
        method: "POST",
        path: "/",
        options: {
            auth: "jwt",
            description: "Post job",
            plugins: job_1.JobSwagger,
            tags: ["api", "job"],
            validate: {
                payload: job_2.JobSchema,
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
                const currentDate = new Date().toUTCString();
                console.log(`POST api/v1/job request from ${request.auth.credentials.email} Time: ${currentDate}`);
                // check whether account is client
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "client") {
                    return response
                        .response({ status: "err", err: "Forbidden request!" })
                        .code(403);
                }
                // check whether profile exist
                const client = yield client_1.default.findOne({ account: account.id });
                if (!client) {
                    return response
                        .response({ status: "err", err: "Your profile does not exist" })
                        .code(406);
                }
                const data = request.payload;
                // check job already posted by current account
                const alreadyPostedJob = yield job_3.default.findOne({
                    client_email: account.email,
                    title: data["title"],
                });
                if (alreadyPostedJob) {
                    return response
                        .response({ status: "err", err: "Job already posted" })
                        .code(409);
                }
                // Todo check expert list
                const jobField = {
                    client: account.id,
                    client_email: account.email,
                    title: data["title"],
                    description: data["description"],
                    budget_type: data["budget_type"],
                    budget_amount: data["budget_amount"],
                    end_date: data["end_date"],
                    expire_date: data["expire_date"],
                    skill_set: data["skill_set"],
                    job_type: data["job_type"],
                    pub_date: currentDate,
                    invited_expert: data["invited_expert"],
                };
                const newJob = new job_3.default(jobField
                // { client_email: account.email },
                // { $set: jobField },
                // { new: true, upsert: true, setDefaultsOnInsert: true }
                );
                yield newJob.save();
                console.log("job posted successfully!", newJob);
                return response.response({ status: "ok", data: newJob }).code(201);
            }
            catch (error) {
                return response.response({ err: error }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/{jobId}",
        options: {
            auth: "jwt",
            description: "Update posted job",
            plugins: job_1.updateJobSwagger,
            tags: ["api", "job"],
            validate: {
                payload: job_2.updateJobSchema,
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
                const currentDate = new Date().toUTCString();
                console.log(`PUT api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email} Time: ${currentDate}`);
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                // check whether account is client
                if (account.account_type !== "client") {
                    return response
                        .response({ status: "err", err: "Forbidden requeset!" })
                        .code(403);
                }
                // check whether job exist
                try {
                    yield job_3.default.findById(request.params.jobId);
                }
                catch (error) {
                    return response
                        .response({ status: "err", err: "Posted Job not found!" })
                        .code(404);
                }
                const data = request.payload;
                const jobField = {
                    title: data["title"],
                    description: data["description"],
                    budget_type: data["budget_type"],
                    budget_amount: data["budget_amount"],
                    end_date: data["end_date"],
                    expire_date: data["expire_date"],
                    state: data["state"],
                    skill_set: data["skill_set"],
                    job_type: data["job_type"],
                };
                data["invited_expert"]
                    ? (jobField["invitied_expert"] = data["invited_expert"])
                    : null;
                const job = yield job_3.default.findOneAndUpdate({ _id: request.params.jobId, client_email: account.email }, {
                    $set: jobField,
                }, { new: true });
                // await job.save();
                console.log("job updated successfully!", job);
                return response
                    .response({ status: "ok", data: "Job updated successfully" })
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
            description: "Get all posted job",
            plugins: job_1.getAllJobSwagger,
            tags: ["api", "job"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/job request from ${request.auth.credentials.email} Time: ${currentDate}`);
                // check whether account is expert
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "expert") {
                    return response
                        .response({ status: "err", err: "Forbidden request" })
                        .code(403);
                }
                const allJobs = yield job_3.default.find().sort({ pub_date: -1 });
                const responseData = {
                    length: allJobs.length,
                    allJobs,
                };
                return response
                    .response({ status: "ok", data: responseData })
                    .code(200);
            }
            catch (error) {
                return response
                    .response({ status: "err", err: "Request not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/myjob",
        options: {
            auth: "jwt",
            description: "Get my all posted job",
            plugins: job_1.getMyAllJobSwagger,
            tags: ["api", "job"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/job/myjob request from ${request.auth.credentials.email} Time: ${currentDate}`);
                // Check whether account is client
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "client") {
                    return response
                        .response({ status: "err", err: "Forbidden request!" })
                        .code(403);
                }
                const allMyJobs = yield job_3.default.find({
                    client_email: account.email,
                }).sort({
                    pub_date: -1,
                });
                if (allMyJobs.length === 0) {
                    return response
                        .response({ status: "err", err: "Posted job not found!" })
                        .code(404);
                }
                const responseData = {
                    length: allMyJobs.length,
                    allMyJobs,
                };
                return response
                    .response({ status: "ok", data: responseData })
                    .code(200);
            }
            catch (error) {
                return response
                    .response({ status: "err", err: "Request not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/{jobId}",
        options: {
            auth: "jwt",
            description: "Get posted job",
            plugins: job_1.getJobSwagger,
            tags: ["api", "job"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email} Time: ${currentDate}`);
                try {
                    const job = yield job_3.default.find({
                        _id: request.params.jobId,
                        client_email: request.auth.credentials.email,
                    });
                    return response.response({ status: "ok", data: job }).code(200);
                }
                catch (error) {
                    return response
                        .response({ status: "err", err: "Posted job not found!" })
                        .code(404);
                }
            }
            catch (error) {
                return response
                    .response({ status: "err", err: "Request not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "DELETE",
        path: "/{jobId}",
        options: {
            auth: "jwt",
            description: "Delete posted job",
            plugins: job_1.deleteJobSwagger,
            tags: ["api", "job"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`DELETE api/v1/job/${request.params.jobId} request from ${request.auth.credentials.email}`);
                // Check account whether it's client
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "client") {
                    return response
                        .response({ status: "err", err: "Forbidden request!" })
                        .code(403);
                }
                try {
                    yield job_3.default.deleteOne({
                        _id: request.params.jobId,
                        client_email: account.email,
                    });
                    return response
                        .response({ status: "ok", data: "successfully deleted!" })
                        .code(200);
                }
                catch (error) {
                    return response
                        .response({ status: "err", err: "Posted job not found!" })
                        .code(404);
                }
            }
            catch (error) {
                return response
                    .response({ status: "err", err: "Request not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "POST",
        path: "/findjobs",
        options: {
            auth: "jwt",
            description: "Find Posted Jobs",
            plugins: job_1.findPostedJobSwagger,
            tags: ["api", "job"],
            validate: {
                payload: job_2.findPostedJobSchema,
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
            try {
                const currentDate = new Date().toUTCString();
                console.log(`POST api/v1/job/findjobs request from ${request.auth.credentials.email} Time: ${currentDate}`);
                // Check whether account is expert
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "expert") {
                    return response
                        .response({ status: "err", err: "Forbidden request!" })
                        .code(403);
                }
                // check whether profile exist
                const expert = yield expert_1.default.findOne({ account: account.id });
                if (!expert) {
                    return response
                        .response({ status: "err", err: "Your profile does not exist" })
                        .code(406);
                }
                const data = request.payload;
                const filter = {};
                data["skill_set"] ? (filter["skill_set"] = data["skill_set"]) : null;
                data["title"] ? (filter["title"] = data["title"]) : null;
                ((_a = data["budget_type"]) === null || _a === void 0 ? void 0 : _a["hourly"]) ? (filter["hourly"] = true) : null;
                ((_c = (_b = data["budget_type"]) === null || _b === void 0 ? void 0 : _b["hourly"]) === null || _c === void 0 ? void 0 : _c["min_value"])
                    ? (filter["hourly_min_value"] =
                        data["budget_type"]["hourly"]["min_value"])
                    : null;
                ((_e = (_d = data["budget_type"]) === null || _d === void 0 ? void 0 : _d["hourly"]) === null || _e === void 0 ? void 0 : _e["max_value"])
                    ? (filter["hourly_max_value"] =
                        data["budget_type"]["hourly"]["max_value"])
                    : null;
                ((_f = data["budget_type"]) === null || _f === void 0 ? void 0 : _f["fixed_budget"])
                    ? (filter["fixed_budget"] = true)
                    : null;
                ((_h = (_g = data["budget_type"]) === null || _g === void 0 ? void 0 : _g["fixed_budget"]) === null || _h === void 0 ? void 0 : _h["lessthan100"])
                    ? (filter["lessthan100"] = 100)
                    : null;
                ((_k = (_j = data["budget_type"]) === null || _j === void 0 ? void 0 : _j["fixed_budget"]) === null || _k === void 0 ? void 0 : _k["between100and500"])
                    ? (filter["between100and500"] = 500)
                    : null;
                ((_m = (_l = data["budget_type"]) === null || _l === void 0 ? void 0 : _l["fixed_budget"]) === null || _m === void 0 ? void 0 : _m["between500and1000"])
                    ? (filter["between500and1000"] = 1000)
                    : null;
                ((_p = (_o = data["budget_type"]) === null || _o === void 0 ? void 0 : _o["fixed_budget"]) === null || _p === void 0 ? void 0 : _p["between1000and5000"])
                    ? (filter["between1000and5000"] = 5000)
                    : null;
                ((_r = (_q = data["budget_type"]) === null || _q === void 0 ? void 0 : _q["fixed_budget"]) === null || _r === void 0 ? void 0 : _r["morethan5000"])
                    ? (filter["morethan5000"] = 5000)
                    : null;
                ((_u = (_t = (_s = data["budget_type"]) === null || _s === void 0 ? void 0 : _s["fixed_budget"]) === null || _t === void 0 ? void 0 : _t["min_max"]) === null || _u === void 0 ? void 0 : _u["min_value"])
                    ? (filter["fixed_min_value"] =
                        data["budget_type"]["fixed_budget"]["min_max"]["min_value"])
                    : null;
                ((_x = (_w = (_v = data["budget_type"]) === null || _v === void 0 ? void 0 : _v["fixed_budget"]) === null || _w === void 0 ? void 0 : _w["min_max"]) === null || _x === void 0 ? void 0 : _x["max_value"])
                    ? (filter["fixed_max_value"] =
                        data["budget_type"]["fixed_budget"]["min_max"]["max_value"])
                    : null;
                ((_y = data["number_of_proposals"]) === null || _y === void 0 ? void 0 : _y["lessthan5"])
                    ? (filter["proposal_lessthan5"] = 5)
                    : null;
                ((_z = data["number_of_proposals"]) === null || _z === void 0 ? void 0 : _z["between5and10"])
                    ? (filter["proposal_between5and10"] = 10)
                    : null;
                ((_0 = data["number_of_proposals"]) === null || _0 === void 0 ? void 0 : _0["between10and15"])
                    ? (filter["proposal_between10and15"] = 15)
                    : null;
                ((_1 = data["number_of_proposals"]) === null || _1 === void 0 ? void 0 : _1["between15and20"])
                    ? (filter["proposal_between15and20"] = 20)
                    : null;
                ((_2 = data["number_of_proposals"]) === null || _2 === void 0 ? void 0 : _2["between20and50"])
                    ? (filter["proposal_between20and50"] = 50)
                    : null;
                ((_3 = data["client_info"]) === null || _3 === void 0 ? void 0 : _3["payment_verified"])
                    ? (filter["payment_verified"] = true)
                    : null;
                ((_4 = data["hours_per_week"]) === null || _4 === void 0 ? void 0 : _4["lessthan30"])
                    ? (filter["lessthan30"] = 30)
                    : null;
                ((_5 = data["hours_per_week"]) === null || _5 === void 0 ? void 0 : _5["morethan30"])
                    ? (filter["morethan30"] = 30)
                    : null;
                data["jobs_per_page"]
                    ? (filter["jobs_per_page"] = data["jobs_per_page"])
                    : null;
                data["page_index"] ? (filter["page_index"] = data["page_index"]) : null;
                const query_skillandtitle = {};
                filter["skill_set"]
                    ? (query_skillandtitle["skill_set"] = { $in: data["skill_set"] })
                    : null;
                filter["title"] ? (query_skillandtitle["title"] = data["title"]) : null;
                let query_hourly_budget = {};
                filter["hourly"] ? (query_hourly_budget["budget_type"] = 1) : null;
                filter["hourly_min_value"]
                    ? (query_hourly_budget["budget_amount"] = {
                        $gt: filter["hourly_min_value"],
                    })
                    : null;
                filter["hourly_max_value"]
                    ? (query_hourly_budget["budget_amount"] = {
                        $lt: filter["hourly_max_value"],
                    })
                    : null;
                filter["hourly_min_value"] && filter["hourly_max_value"]
                    ? (query_hourly_budget["budget_amount"] = {
                        $gt: filter["hourly_min_value"],
                        $lt: filter["hourly_max_value"],
                    })
                    : null;
                Object.keys(query_hourly_budget).length === 0
                    ? (query_hourly_budget = { query_hourly_budget })
                    : null;
                console.log("query_hourly_budget-------------------->>>>>>>>>>>>>", query_hourly_budget);
                let query_fixed_budget = {};
                filter["fixed_budget"] ? (query_fixed_budget["budget_type"] = 0) : null;
                Object.keys(query_fixed_budget).length === 0
                    ? (query_fixed_budget = { query_fixed_budget })
                    : null;
                const query_fixed = new Array();
                filter["lessthan100"]
                    ? query_fixed.push({
                        budget_amount: {
                            $lt: filter["lessthan100"],
                        },
                    })
                    : null;
                filter["between100and500"]
                    ? query_fixed.push({
                        budget_amount: {
                            $lt: 100,
                            $gt: filter["between100and500"],
                        },
                    })
                    : null;
                filter["between500and1000"]
                    ? query_fixed.push({
                        budget_amount: {
                            $lt: 500,
                            $gt: filter["between500and1000"],
                        },
                    })
                    : null;
                filter["between1000and5000"]
                    ? query_fixed.push({
                        budget_amount: {
                            $lt: 1000,
                            $gt: filter["between1000and5000"],
                        },
                    })
                    : null;
                filter["morethan5000"]
                    ? query_fixed.push({
                        budget_amount: {
                            $gt: filter["morethan5000"],
                        },
                    })
                    : null;
                const query_fixed_min_max = {};
                filter["fixed_min_value"]
                    ? (query_fixed_min_max["budget_amount"] = {
                        $gt: filter["fixed_min_value"],
                    })
                    : null;
                filter["fixed_max_value"]
                    ? (query_fixed_min_max["budget_amount"] = {
                        $lt: filter["fixed_max_value"],
                    })
                    : null;
                filter["fixed_min_value"] && filter["fixed_max_value"]
                    ? (query_fixed_min_max["budget_amount"] = {
                        $gt: filter["fixed_min_value"],
                        $lt: filter["fixed_max_value"],
                    })
                    : null;
                query_fixed_min_max ? query_fixed.push(query_fixed_min_max) : null;
                console.log("query_fixed-------------------->>>>>>>>>>>>>", query_fixed);
                const query_number_of_proposals = [];
                filter["proposal_lessthan5"]
                    ? query_number_of_proposals.push({
                        $expr: {
                            $lt: [{ $size: "$proposals" }, filter["proposal_lessthan5"]],
                        },
                    })
                    : null;
                filter["proposal_between5and10"]
                    ? query_number_of_proposals.push({
                        $expr: {
                            $and: [
                                { $gt: [{ $size: "$proposals" }, 5] },
                                {
                                    $lt: [
                                        { $size: "$proposals" },
                                        filter["proposal_between5and10"],
                                    ],
                                },
                            ],
                        },
                    })
                    : null;
                filter["proposal_between10and15"]
                    ? query_number_of_proposals.push({
                        $expr: {
                            $and: [
                                { $gt: [{ $size: "$proposals" }, 10] },
                                {
                                    $lt: [
                                        { $size: "$proposals" },
                                        filter["proposal_between10and15"],
                                    ],
                                },
                            ],
                        },
                    })
                    : null;
                filter["proposal_between15and20"]
                    ? query_number_of_proposals.push({
                        $expr: {
                            $and: [
                                { $gt: [{ $size: "$proposals" }, 15] },
                                {
                                    $lt: [
                                        { $size: "$proposals" },
                                        filter["proposal_between15and20"],
                                    ],
                                },
                            ],
                        },
                    })
                    : null;
                filter["proposal_between20and50"]
                    ? query_number_of_proposals.push({
                        $expr: {
                            $and: [
                                { $gt: [{ $size: "$proposals" }, 20] },
                                {
                                    $lt: [
                                        { $size: "$proposals" },
                                        filter["proposal_between20and50"],
                                    ],
                                },
                            ],
                        },
                    })
                    : null;
                query_number_of_proposals.length === 0
                    ? query_number_of_proposals.push("")
                    : null;
                console.log("query_number_of_proposals----------------------------->>>>>>", query_number_of_proposals);
                // const query_client_info = [];
                // filter["client_info"] && filter["payment_verified"]
                //   ? query_client_info.push({ payment_verify: true })
                //   : null;
                // filter["client_info"] && filter["payment_unverified"]
                //   ? query_client_info.push({ payment_verify: false })
                //   : null;
                // console.log(
                //   "query_client_info ------------------------>>>>>>>>",
                //   query_client_info
                // );
                const queryAll = {
                    $and: [
                        query_skillandtitle,
                        {
                            $or: [
                                query_hourly_budget,
                                {
                                    $and: [
                                        query_fixed_budget,
                                        {
                                            $or: query_fixed,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                };
                if (query_number_of_proposals.length !== 0) {
                    queryAll.$and[1]["$or"].push({ $or: query_number_of_proposals });
                }
                // if (query_client_info.length !== 0) {
                //   queryAll.$and[1]["$or"].push({ $or: query_client_info });
                // }
                console.log("queryAll-------------------------------->>>>>>>>>>", queryAll);
                const findedjobs = yield job_3.default.find(queryAll);
                return response.response({ status: "ok", data: findedjobs }).code(200);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    // {
    //   method: 'POST',
    //   path: '/proposal',
    //   // options: {
    //   config: {
    //     auth: 'jwt',
    //     description: 'Create or Update job',
    //     plugins: JobSwagger,
    //     payload: {
    //       maxBytes: 10485760000,
    //       output: 'stream',
    //       parse: true,
    //       allow: "multipart/form-data",
    //       multipart: { output: 'stream' }
    //       // maxBytes: 10 * 1024 * 1024, // Maximum file size (10MB in this example)
    //     },
    //     tags: ['api', 'job'],
    //     validate: {
    //       payload: JobSchema,
    //       options,
    //       failAction: (request, h, error) => {
    //         const details = error.details.map((d) => {
    //           return { err: d.message, pagth: d.path }
    //         })
    //         return h.response(details).code(400).takeover();
    //       }
    //     },
    //     // },
    //     handler: async (request: Request, response: ResponseToolkit) => {
    //       try {
    //         console.log(`POST api/v1/job request from ${request.auth.credentials.email}`);
    //         const bucketdb = mongoose.connection.db;
    //         const bucket = new mongoose.mongo.GridFSBucket(bucketdb, {
    //           bucketName: 'file',
    //         });
    //         const file = request.payload['file'];
    //         // console.log(request.payload);
    //         console.log('-------------here-----------', file.hapi.filename);
    //         const uploadStream = bucket.openUploadStream(file.hapi.filename);
    //         file.pipe(uploadStream);
    //         return response.response({ msg: 'Success!' });
    //       } catch (error) {
    //         return response.response({ err: error });
    //       }
    //     }
    //   }
    // }
];
//# sourceMappingURL=job.js.map