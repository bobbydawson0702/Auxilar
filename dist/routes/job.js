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
const account_1 = __importDefault(require("../models/account"));
const job_3 = __importDefault(require("../models/job"));
const client_1 = __importDefault(require("../models/profile/client"));
const expert_1 = __importDefault(require("../models/profile/expert"));
const cateogory_1 = require("../swagger/cateogory");
const category_1 = __importDefault(require("../models/category"));
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
                // // check job already posted by current account
                // const alreadyPostedJob = await Job.findOne({
                //   client_email: account.email,
                //   title: data["title"],
                // });
                // if (alreadyPostedJob) {
                //   return response
                //     .response({ status: "err", err: "Job already posted" })
                //     .code(409);
                // }
                // Todo check expert list
                const jobField = {
                    client: client.id,
                    client_email: account.email,
                    title: data["title"],
                    description: data["description"],
                    budget_type: data["budget_type"],
                    budget_amount: data["budget_amount"],
                    end_date: data["end_date"],
                    // expire_date: data["expire_date"],
                    category: data["category"],
                    skill_set: data["skill_set"],
                    job_type: data["job_type"],
                    project_duration: data["project_duration"],
                    pub_date: currentDate,
                    // invited_expert: data["invited_expert"],
                };
                const newJob = new job_3.default(jobField
                // { client_email: account.email },
                // { $set: jobField },
                // { new: true, upsert: true, setDefaultsOnInsert: true }
                );
                yield newJob.save();
                console.log("job posted successfully!", newJob);
                // add posted job to client
                yield client_1.default.findOneAndUpdate({ email: account.email }, {
                    $push: {
                        ongoing_project: { project: newJob._id },
                    },
                }, { new: true });
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
                    // expire_date: data["expire_date"],
                    state: data["state"],
                    category: data["category"],
                    skill_set: data["skill_set"],
                    job_type: data["job_type"],
                    project_duration: data["project_duration"],
                    hours_per_week: data["hours_per_week"],
                };
                // data["invited_expert"]
                //   ? (jobField["invitied_expert"] = data["invited_expert"])
                //   : null;
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
                // const allMyJobs: Array<Object> = await Job.find({
                //   client_email: account.email,
                // }).sort({
                //   pub_date: -1,
                // });
                const allMyJobs = yield job_3.default.aggregate([
                    {
                        $match: {
                            client_email: account.email,
                        },
                    },
                    {
                        $project: {
                            client_email: 1,
                            title: 1,
                            description: 1,
                            budget_type: 1,
                            budget_amount: 1,
                            pub_dae: 1,
                            state: 1,
                            category: 1,
                            skill_set: 1,
                            job_type: 1,
                            hours_per_week: 1,
                            project_duration: 1,
                            invited_expert: 1,
                            proposals: {
                                $filter: {
                                    input: "$proposals",
                                    as: "proposal",
                                    cond: {
                                        $eq: ["$$proposal.proposal_status", 1],
                                    },
                                },
                            },
                        },
                    },
                    {
                        $sort: { pub_date: -1 },
                    },
                ]);
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
                    // remove job id from client ongoing project
                    yield client_1.default.findOneAndUpdate({
                        email: account.email,
                        "ongoing_project.project": request.params.jobId,
                    }, {
                        $pull: {
                            ongoing_project: { project: request.params.jobId },
                        },
                    }, { new: true });
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
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
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
                data["skill_set"].length !== 0
                    ? (filter["skill_set"] = data["skill_set"])
                    : null;
                data["category"].length !== 0
                    ? (filter["category"] = data["category"])
                    : null;
                data["title"] !== "emptystringtitle"
                    ? (filter["title"] = data["title"])
                    : null;
                ((_a = data["budget_type"]) === null || _a === void 0 ? void 0 : _a["hourly"]) ? (filter["hourly"] = true) : null;
                const query_skillandtitle = {};
                filter["skill_set"]
                    ? (query_skillandtitle["skill_set"] = { $in: filter["skill_set"] })
                    : null;
                filter["category"]
                    ? (query_skillandtitle["category"] = { $in: filter["category"] })
                    : null;
                filter["title"]
                    ? (query_skillandtitle["title"] = {
                        $regex: new RegExp("^" + filter["title"].toLowerCase(), "i"),
                    })
                    : null;
                console.log("query_skillandtitle---------------------->>>>>>>>>>>>>>", query_skillandtitle);
                // ----------------------------- query for budget type is hourly ---------------------------
                let query_hourly_budget = {};
                const query_hourly = [];
                if (((_c = (_b = data["budget_type"]) === null || _b === void 0 ? void 0 : _b["hourly"]) === null || _c === void 0 ? void 0 : _c["ishourly"]) === true) {
                    query_hourly_budget = {
                        budget_type: 1,
                    };
                }
                if (((_e = (_d = data["budget_type"]) === null || _d === void 0 ? void 0 : _d["hourly"]) === null || _e === void 0 ? void 0 : _e["hourly_range"].length) !== 0) {
                    (_g = (_f = data["budget_type"]) === null || _f === void 0 ? void 0 : _f["hourly"]) === null || _g === void 0 ? void 0 : _g["hourly_range"].forEach((item) => {
                        query_hourly.push({
                            $and: [
                                { budget_amount: { $gte: item.min_value } },
                                { budget_amount: { $lt: item.max_value } },
                            ],
                        });
                    });
                }
                console.log("query_hourly_budget-------------------->>>>>>>>>>>>>", query_hourly_budget);
                console.log("query_hourly-------------------->>>>>>>>>>>>>", query_hourly);
                // ------------------------------- query for budget type is fixed --------------------------
                let query_fixed_budget = {};
                const query_fixed = [];
                if (((_j = (_h = data["budget_type"]) === null || _h === void 0 ? void 0 : _h["fixed"]) === null || _j === void 0 ? void 0 : _j["isfixed"]) === true) {
                    query_fixed_budget = {
                        budget_type: 0,
                    };
                }
                if (((_l = (_k = data["budget_type"]) === null || _k === void 0 ? void 0 : _k["fixed"]) === null || _l === void 0 ? void 0 : _l["fixed_range"].length) !== 0) {
                    (_o = (_m = data["budget_type"]) === null || _m === void 0 ? void 0 : _m["fixed"]) === null || _o === void 0 ? void 0 : _o["fixed_range"].forEach((item) => {
                        query_fixed.push({
                            $and: [
                                { budget_amount: { $gte: item.min_value } },
                                { budget_amount: { $lt: item.max_value } },
                            ],
                        });
                    });
                }
                console.log("query_fixed_budget-------------------->>>>>>>>>>>>>", query_fixed_budget);
                console.log("query_fixed-------------------->>>>>>>>>>>>>", query_fixed);
                const query_number_of_proposals = [];
                if (data["number_of_proposals"].length !== 0) {
                    data["number_of_proposals"].forEach((item) => {
                        query_number_of_proposals.push({
                            $expr: {
                                $and: [
                                    { $gte: [{ $size: "$proposals" }, item.min_value] },
                                    { $lt: [{ $size: "$proposals" }, item.max_value] },
                                ],
                            },
                        });
                    });
                }
                console.log("query_number_of_proposals-------------------->>>>>>>>>>>>>", query_number_of_proposals);
                const query_client_info = [];
                if ((_p = data["client_info"]) === null || _p === void 0 ? void 0 : _p["payment_verified"])
                    query_client_info.push({ "clientData.payment_verify": true });
                if ((_q = data["client_info"]) === null || _q === void 0 ? void 0 : _q["payment_unverified"])
                    query_client_info.push({ "clientData.payment_verify": false });
                console.log("query_client_info ------------------>>>>>>>>>>>>>", query_client_info);
                const query_hours_per_week = [];
                if (data["hours_per_week"].length !== 0) {
                    data["hours_per_week"].forEach((item) => {
                        query_hours_per_week.push({ hours_per_week: item });
                    });
                }
                console.log("query_hours_per_week ------------------>>>>>>>>>>", query_hours_per_week);
                const query_project_duration = [];
                if (data["project_duration"].length !== 0) {
                    data["project_duration"].forEach((item) => {
                        query_project_duration.push({ project_duration: item });
                    });
                }
                console.log("query_project_duration ------------------>>>>>>>>>>", query_project_duration);
                data["jobs_per_page"]
                    ? (filter["jobs_per_page"] = data["jobs_per_page"])
                    : null;
                data["page_index"] ? (filter["page_index"] = data["page_index"]) : null;
                const queryAll = {
                    $and: [
                        query_skillandtitle,
                        // {
                        //   $or: [
                        // query_hourly_budget,
                        //     // {
                        //     // $and: [
                        //     // query_fixed_budget,
                        //     // {
                        //     //   $or: query_fixed,
                        //     // },
                        //     // ],
                        //     // },
                        //     {
                        //       $or: query_number_of_proposals,
                        //     },
                        //     {
                        //       $or: query_client_info,
                        //     },
                        //     {
                        //       $or: query_hours_per_week,
                        //     },
                        //   ],
                        // },
                    ],
                };
                if (Object.keys(query_hourly_budget).length !== 0) {
                    if (queryAll.$and[1]) {
                        if (query_hourly.length !== 0) {
                            queryAll.$and[1]["$or"].push({
                                $and: [query_hourly_budget, { $or: query_hourly }],
                            });
                        }
                        else {
                            queryAll.$and[1]["$or"].push({ $and: [query_hourly_budget] });
                        }
                    }
                    else {
                        if (query_hourly.length !== 0) {
                            queryAll.$and.push({
                                $or: [{ $and: [query_hourly_budget, { $or: query_hourly }] }],
                            });
                        }
                        else {
                            queryAll.$and.push({ $or: [{ $and: [query_hourly_budget] }] });
                        }
                    }
                    console.log("queryAll.and[1]----------------------->>>>>>>>>>>", queryAll.$and[1]["$or"][0]);
                }
                if (Object.keys(query_fixed_budget).length !== 0) {
                    if (queryAll.$and[1]) {
                        if (query_fixed.length !== 0) {
                            queryAll.$and[1]["$or"].push({
                                $and: [query_fixed_budget, { $or: query_fixed }],
                            });
                        }
                        else {
                            queryAll.$and[1]["$or"].push({ $and: [query_fixed_budget] });
                        }
                    }
                    else {
                        if (query_fixed.length !== 0) {
                            queryAll.$and.push({
                                $or: [{ $and: [query_fixed_budget, { $or: query_fixed }] }],
                            });
                        }
                        else {
                            queryAll.$and.push({ $or: [{ $and: [query_fixed_budget] }] });
                        }
                    }
                    console.log("queryAll.and[1]----------------------->>>>>>>>>>>", queryAll.$and[1]["$or"][0]);
                }
                if (query_number_of_proposals.length !== 0) {
                    queryAll.$and[1]
                        ? queryAll.$and[1]["$or"].push({ $or: query_number_of_proposals })
                        : queryAll.$and.push({ $or: [{ $or: query_number_of_proposals }] });
                }
                if (query_client_info.length !== 0) {
                    queryAll.$and[1]
                        ? queryAll.$and[1]["$or"].push({ $or: query_client_info })
                        : queryAll.$and.push({ $or: [{ $or: query_client_info }] });
                }
                if (query_hours_per_week.length !== 0) {
                    queryAll.$and[1]
                        ? queryAll.$and[1]["$or"].push({ $or: query_hours_per_week })
                        : queryAll.$and.push({ $or: [{ $or: query_hours_per_week }] });
                }
                if (query_project_duration.length !== 0) {
                    queryAll.$and[1]
                        ? queryAll.$and[1]["$or"].push({ $or: query_project_duration })
                        : queryAll.$and.push({ $or: [{ $or: query_project_duration }] });
                }
                console.log("queryAll-------------------------------->>>>>>>>>>", queryAll);
                // console.log(
                //   "query_client_info------------------->>>>>>>>>>>",
                //   query_client_info
                // );
                const findedjobs = yield job_3.default.aggregate([
                    {
                        $lookup: {
                            from: "clients",
                            localField: "client",
                            foreignField: "_id",
                            as: "clientData",
                            pipeline: [
                                {
                                    $project: {
                                        payment_verify: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $match: queryAll,
                    },
                    {
                        $skip: filter["jobs_per_page"] * (filter["page_index"] - 1),
                    },
                    {
                        $limit: filter["jobs_per_page"],
                    },
                ]);
                return response.response({ status: "ok", data: findedjobs }).code(200);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "PATCH",
        path: "/{jobId}/invite/{expertId}",
        options: {
            auth: "jwt",
            description: "Invite expert to the posted job",
            plugins: job_1.inviteExpertSwagger,
            tags: ["api", "job"],
            validate: {
                payload: job_2.inviteExpertSchema,
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
                console.log(`PATCH api/v1/job/${request.params.jobId}/invite/${request.params.expertId} request from
           ${request.auth.credentials.email} Time: ${currentDate}`);
                // check whether account is client
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "client") {
                    return response
                        .response({ status: "err", err: "Forbidden Request" })
                        .code(403);
                }
                // Check whether expert profile exist
                const expert = yield expert_1.default.findOne({
                    account: request.params.expertId,
                }).populate("account", ["first_name", "last_name"]);
                if (!expert) {
                    return response
                        .response({ status: "err", err: "Expert does not exist" })
                        .code(404);
                }
                // check already invited
                const isAreadyInvited = yield job_3.default.findOne({
                    _id: request.params.jobId,
                    client_email: account.email,
                    "invited_expert.id": expert.account._id,
                });
                if (isAreadyInvited) {
                    return response
                        .response({ status: "err", err: "Expert already invited!" })
                        .code(409);
                }
                console.log("expert------------------>>>>>>>>>>>>>>>>>>>", expert);
                let inviteExpertToJob;
                const data = request.payload;
                try {
                    const inviteExpertField = {
                        id: request.params.expertId,
                        first_name: expert.account.first_name,
                        last_name: expert.account.last_name,
                        type: data["type"],
                        content: data["content"],
                    };
                    inviteExpertToJob = yield job_3.default.findOneAndUpdate({
                        _id: request.params.jobId,
                        client_email: account.email,
                    }, {
                        $push: {
                            invited_expert: inviteExpertField,
                        },
                    }, { new: true });
                }
                catch (err) {
                    return response
                        .response({ status: "err", err: "Posted Job not found!" })
                        .code(404);
                }
                return response
                    .response({ status: "ok", data: inviteExpertToJob })
                    .code(201);
            }
            catch (err) {
                return response
                    .response({ status: "err", err: "Not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/{jobId}/recommendedExperts",
        options: {
            auth: "jwt",
            description: "Find expert",
            plugins: job_1.recommendedExpertsSwagger,
            tags: ["api", "expert"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`POST api/v1/job/${request.params.jobId}/recommendedExperts request from ${request.auth.credentials.email} Time: ${currentDate}`);
                // check whether account is client
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "client") {
                    return response
                        .response({ status: "err", err: "Forbidden request!" })
                        .code(403);
                }
                // Get Job
                const job = yield job_3.default.findOne({
                    _id: request.params.jobId,
                    client_email: account.email,
                });
                if (!job) {
                    return response.response({ status: "err", err: "Job is not found!" });
                }
                const queryAll = {};
                if (job.skill_set.length)
                    queryAll["skills"] = { $in: job.skill_set };
                console.log("queryAll------------------->>>>>>>>>>>>>>>>", queryAll);
                const findExperts = yield expert_1.default.aggregate([
                    {
                        $lookup: {
                            from: "accounts",
                            localField: "account",
                            foreignField: "_id",
                            as: "accountData",
                            pipeline: [
                                {
                                    $project: {
                                        first_name: 1,
                                        last_name: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $match: queryAll,
                    },
                ]);
                return response.response({ status: "ok", data: findExperts }).code(200);
            }
            catch (err) {
                return response
                    .response({ status: "err", err: "Not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/all-categories",
        options: {
            auth: "jwt",
            description: "Get all recorded Categories",
            plugins: cateogory_1.getAllCategories,
            tags: ["api", "job"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/job/all-categories request from ${request.auth.credentials.email} Time: ${currentDate}`);
                const allCategories = yield category_1.default.find();
                if (!allCategories) {
                    return response
                        .response({ status: "err", err: "Recorded category not found!" })
                        .code(404);
                }
                return response
                    .response({ status: "ok", data: allCategories })
                    .code(200);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
];
//# sourceMappingURL=job.js.map