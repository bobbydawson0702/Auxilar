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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalRoute = void 0;
const proposal_1 = require("../swagger/proposal");
const proposal_2 = require("../validation/proposal");
const account_1 = __importDefault(require("../models/account"));
const expert_1 = __importDefault(require("../models/profile/expert"));
const job_1 = __importDefault(require("../models/job"));
const mongoose_1 = __importDefault(require("mongoose"));
const options = { abortEarly: false, stripUnknown: true };
exports.proposalRoute = [
    {
        method: "POST",
        path: "/{jobId}",
        config: {
            auth: "jwt",
            description: "Apply proposal",
            plugins: proposal_1.ProposalSwagger,
            payload: {
                maxBytes: 10485760000,
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                multipart: { output: "stream" },
            },
            tags: ["api", "proposal"],
            validate: {
                payload: proposal_2.ProposalSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
            // },
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                try {
                    const currentDate = new Date().toUTCString();
                    console.log(`POST api/v1/proposal/${request.params.jobId} 
          request from ${request.auth.credentials.email} Time: ${currentDate}`);
                    // Check whether account is expert
                    const account = yield account_1.default.findOne({
                        email: request.auth.credentials.email,
                    });
                    if (account.account_type !== "expert") {
                        return response
                            .response({ status: "err", err: "Forbidden request" })
                            .code(403);
                    }
                    // Check whether profile exist
                    try {
                        yield expert_1.default.findOne({ account: account.id });
                    }
                    catch (error) {
                        return response
                            .response({ status: "err", err: "Your profile does not exist" })
                            .code(406);
                    }
                    const data = request.payload;
                    // Check whether Posted job exist
                    try {
                        yield job_1.default.findById(request.params.jobId);
                    }
                    catch (err) {
                        return response
                            .response({ status: "err", err: "Posted job not found!" })
                            .code(404);
                    }
                    // Check whether already apply proposal
                    const existingProposal = yield job_1.default.findOne({
                        _id: request.params.jobId,
                        "proposals.expert.email": account.email,
                    });
                    console.log("request.params.jobId--------------------", request.params.jobId);
                    if (existingProposal) {
                        return response
                            .response({ status: "err", err: "Proposal already exist!" })
                            .code(409);
                    }
                    // get field
                    const proposalField = {
                        expert: { id: account.id, email: account.email },
                        cover_letter: data["proposalData"]["cover_letter"],
                        total_amount: data["proposalData"]["total_amount"],
                        milestones: data["proposalData"]["milestones"],
                        proposal_status: (_a = data["proposalData"]["proposal_status"]) !== null && _a !== void 0 ? _a : null,
                        mentor_check: [],
                        attached_files: [],
                    };
                    // Check invited status
                    const invited_expert = yield job_1.default.findOne({
                        _id: request.params.jobId,
                        "invited_expert.id": account._id,
                    });
                    if (invited_expert) {
                        proposalField["expert"]["invited_status"] = true;
                        console.log("proposalField---------->", proposalField);
                    }
                    if (data["proposalData"]["mentors"]) {
                        // Check whether mentors exist
                        const mentor_check = [];
                        data["proposalData"]["mentors"].forEach((item) => {
                            mentor_check.push({
                                mentor: item,
                                checked: false,
                            });
                        });
                        proposalField["mentor_check"] = mentor_check;
                        proposal_status: (_b = data["proposalData"]["proposal_status"]) !== null && _b !== void 0 ? _b : null;
                    }
                    // Check whether attached_files exist
                    if (data["attached_files"]) {
                        // push proposal not add attached_files info
                        yield job_1.default.findOneAndUpdate({ _id: request.params.jobId }, {
                            $push: {
                                proposals: proposalField,
                            },
                        }, { new: true });
                        // get proposal id
                        const ObjectId = mongoose_1.default.Types.ObjectId;
                        const proposal = yield job_1.default.aggregate([
                            {
                                $match: {
                                    _id: new ObjectId(request.params.jobId),
                                    "proposals.expert.email": account.email,
                                },
                            },
                            {
                                $project: {
                                    proposals: {
                                        $filter: {
                                            input: "$proposals",
                                            as: "proposal",
                                            cond: {
                                                $eq: [
                                                    "$$proposal.expert.email",
                                                    request.auth.credentials.email,
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        ]);
                        // upload attached files
                        data["attached_files"].forEach((fileItem) => __awaiter(void 0, void 0, void 0, function* () {
                            const bucketdb = mongoose_1.default.connection.db;
                            const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                                bucketName: "file",
                            });
                            const attached_file = fileItem;
                            console.log("-------------here-----------", attached_file.hapi.filename);
                            const uploadStream = bucket.openUploadStream(attached_file.hapi.filename);
                            uploadStream.on("finish", (file) => __awaiter(void 0, void 0, void 0, function* () {
                                // record attached_files info to database
                                const attachedProposal = yield job_1.default.findOneAndUpdate({
                                    _id: request.params.jobId,
                                    "proposals._id": proposal[0].proposals[0]._id,
                                }, {
                                    $push: {
                                        "proposals.$.attached_files": {
                                            name: attached_file.hapi.filename,
                                            file_id: file._id,
                                        },
                                    },
                                }, { new: true });
                            }));
                            yield attached_file.pipe(uploadStream);
                        }));
                    }
                    else {
                        // add proposals which attached_files not exist
                        const proposal = yield job_1.default.findOneAndUpdate({ _id: request.params.jobId }, {
                            $push: {
                                proposals: proposalField,
                            },
                        }, { new: true }).select("proposals");
                    }
                    return response
                        .response({ status: "ok", data: "Proposal successfully applied" })
                        .code(201);
                }
                catch (error) {
                    return response
                        .response({ status: "err", err: "Not implemented!" })
                        .code(501);
                }
            }),
        },
    },
    {
        method: "PUT",
        path: "/{jobId}",
        config: {
            auth: "jwt",
            description: "Update applied proposal",
            plugins: proposal_1.updateProposalSwagger,
            payload: {
                maxBytes: 10485760000,
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                multipart: { output: "stream" },
            },
            tags: ["api", "proposal"],
            validate: {
                payload: proposal_2.updateProposalSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _c, _d, _e, _f;
                try {
                    const currentDate = new Date().toUTCString();
                    console.log(`PUT api/v1/proposal/${request.params.jobId} 
          request from ${request.auth.credentials.email} Time: ${currentDate}`);
                    // Check whether account is expert
                    const account = yield account_1.default.findOne({
                        email: request.auth.credentials.email,
                    });
                    if (account.account_type !== "expert") {
                        return response
                            .response({ status: "err", err: "Forbidden request" })
                            .code(403);
                    }
                    // Check whether profile exist
                    try {
                        yield expert_1.default.findOne({ account: account.id });
                    }
                    catch (error) {
                        return response
                            .response({ status: "err", err: "Your profile does not exist" })
                            .code(406);
                    }
                    const data = request.payload;
                    try {
                        // Check whether Posted job, proposal exist
                        const appliedProposal = yield job_1.default.findOne({
                            _id: request.params.jobId,
                            "proposals.expert.email": account.email,
                        }, { "proposals.$": 1 });
                        const attached_file = appliedProposal.proposals[0]["attached_files"];
                        // delete uploaded file
                        if (attached_file) {
                            attached_file.forEach((item) => {
                                const bucketdb = mongoose_1.default.connection.db;
                                const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                                    bucketName: "file",
                                });
                                try {
                                    bucket.delete(item.file_id);
                                }
                                catch (err) {
                                    return response
                                        .response({ status: "err", err: "Not implemented" })
                                        .code(501);
                                }
                            });
                        }
                    }
                    catch (err) {
                        return response
                            .response({ status: "err", err: "Applied proposal not found!" })
                            .code(404);
                    }
                    console.log("data[proposal_status]------------>", data["proposalData"]["proposal_status"]);
                    // receive field
                    const proposalField = {
                        expert: { id: account.id, email: account.email },
                        cover_letter: data["proposalData"]["cover_letter"],
                        total_amount: data["proposalData"]["total_amount"],
                        milestones: data["proposalData"]["milestones"],
                        proposal_status: (_c = data["proposalData"]["proposal_status"]) !== null && _c !== void 0 ? _c : null,
                        mentor_check: [],
                        attached_files: [], // don't use null
                    };
                    if (data["proposalData"]["mentors"].length) {
                        console.log("data[proposalData][mentors]------------->>>>>>>>>>", data["proposalData"]["mentors"]);
                        const mentor_check = [];
                        data["proposalData"]["mentors"].forEach((item) => {
                            mentor_check.push({
                                mentor: item,
                                checked: false,
                            });
                        });
                        proposalField["mentor_check"] = mentor_check;
                        proposalField["proposal_status"] =
                            (_d = data["proposalData"]["proposal_status"]) !== null && _d !== void 0 ? _d : null;
                    }
                    // Upadate proposal which have attached_files
                    if (data["attached_files"]) {
                        // Update proposal not add attached_files info
                        yield job_1.default.findOneAndUpdate({
                            _id: request.params.jobId,
                            "proposals.expert.email": account.email,
                        }, {
                            $set: {
                                "proposals.$.cover_letter": proposalField.cover_letter,
                                "proposals.$.total_amount": proposalField.total_amount,
                                "proposals.$.milestones": proposalField.milestones,
                                "proposals.$.proposal_status": proposalField.proposal_status,
                                "proposals.$.mentor_check": (_e = proposalField["mentor_check"]) !== null && _e !== void 0 ? _e : null,
                                "proposals.$.attached_files": [],
                            },
                        }, { new: true });
                        // get proposal id
                        const ObjectId = mongoose_1.default.Types.ObjectId;
                        const proposal = yield job_1.default.aggregate([
                            {
                                $match: {
                                    _id: new ObjectId(request.params.jobId),
                                    "proposals.expert.email": account.email,
                                },
                            },
                            {
                                $project: {
                                    proposals: {
                                        $filter: {
                                            input: "$proposals",
                                            as: "proposal",
                                            cond: {
                                                $eq: [
                                                    "$$proposal.expert.email",
                                                    request.auth.credentials.email,
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                        ]);
                        // upload attached_files
                        data["attached_files"].forEach((fileItem) => __awaiter(void 0, void 0, void 0, function* () {
                            const bucketdb = mongoose_1.default.connection.db;
                            const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                                bucketName: "file",
                            });
                            const attached_file = fileItem;
                            const uploadStream = bucket.openUploadStream(attached_file.hapi.filename);
                            uploadStream.on("finish", (file) => __awaiter(void 0, void 0, void 0, function* () {
                                // update attached_files info
                                const attachedProposal = yield job_1.default.findOneAndUpdate({
                                    _id: request.params.jobId,
                                    "proposals._id": proposal[0].proposals[0]._id,
                                }, {
                                    $push: {
                                        "proposals.$.attached_files": {
                                            name: attached_file.hapi.filename,
                                            file_id: file._id,
                                        },
                                    },
                                }, { new: true });
                            }));
                            yield attached_file.pipe(uploadStream);
                        }));
                    }
                    else {
                        // update proposal which don't have attached_files
                        const proposal = yield job_1.default.findOneAndUpdate({
                            _id: request.params.jobId,
                            "proposals.expert.email": account.email,
                        }, {
                            $set: {
                                "proposals.$.cover_letter": proposalField.cover_letter,
                                "proposals.$.total_amount": proposalField.total_amount,
                                "proposals.$.milestones": proposalField.milestones,
                                "proposals.$.proposal_status": proposalField.proposal_status,
                                "proposals.$.mentor_check": (_f = proposalField["mentor_check"]) !== null && _f !== void 0 ? _f : null,
                                "proposals.$.attached_files": null,
                            },
                        }, { new: true }).select("proposals");
                    }
                    return response
                        .response({ status: "ok", data: "Proposal successfully updated" })
                        .code(201);
                }
                catch (error) {
                    return response
                        .response({ status: "err", err: "Not implemented!" })
                        .code(501);
                }
            }),
        },
    },
    {
        method: "GET",
        path: "/{jobId}",
        options: {
            auth: "jwt",
            description: "Get applied proposal to certain job",
            plugins: proposal_1.getProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                let proposal;
                const ObjectId = mongoose_1.default.Types.ObjectId;
                // check account whether client if account is client display job and visisble proposals
                if (account.account_type === "client") {
                    proposal = yield job_1.default.aggregate([
                        // {
                        //   $lookup: {
                        //     from: "experts",
                        //     localField: "proposals.expert.id",
                        //     foreignField: "account",
                        //     as: "expertData",
                        //     pipeline: [
                        //       {
                        //         $project: {
                        //           avatar: 1,
                        //           first_name: 1,
                        //           last_name: 1,
                        //           skills: 1,
                        //           majors: 1,
                        //         },
                        //       },
                        //     ],
                        //   },
                        // },
                        {
                            $match: {
                                _id: new ObjectId(request.params.jobId),
                            },
                        },
                        {
                            $unwind: "$proposals",
                        },
                        {
                            $match: {
                                "proposals.proposal_status": { $in: [2, 3, 4] },
                            },
                        },
                        {
                            $lookup: {
                                from: "experts",
                                localField: "proposals.expert.id",
                                foreignField: "account",
                                as: "expertData",
                                pipeline: [
                                    {
                                        $project: {
                                            avatar: 1,
                                            first_name: 1,
                                            last_name: 1,
                                            skills: 1,
                                            majors: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $project: {
                                proposals: 1,
                                expertData: 1,
                            },
                        },
                        // {
                        //   $project: {
                        //     proposals: {
                        //       $filter: {
                        //         input: "$proposals",
                        //         as: "proposal",
                        //         cond: {
                        //           $eq: ["$$proposal.proposal_status", 1],
                        //         },
                        //       },
                        //     },
                        //   },
                        // },
                    ]);
                    if (!proposal) {
                        return response
                            .response({ staus: "err", err: "Not found applied proposal" })
                            .code(404);
                    }
                }
                else if (account.account_type === "expert") {
                    proposal = yield job_1.default.aggregate([
                        {
                            $match: {
                                _id: new ObjectId(request.params.jobId),
                            },
                        },
                        {
                            $unwind: "$proposals",
                        },
                        {
                            $match: {
                                "proposals.expert.email": account.email,
                            },
                        },
                        {
                            $lookup: {
                                from: "experts",
                                localField: "proposals.expert.id",
                                foreignField: "account",
                                as: "expertData",
                                pipeline: [
                                    {
                                        $project: {
                                            avatar: 1,
                                            first_name: 1,
                                            last_name: 1,
                                            skills: 1,
                                            majors: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $project: {
                                proposals: 1,
                                expertData: 1,
                            },
                        },
                    ]);
                    if (!proposal) {
                        return response
                            .response({ staus: "err", err: "Not found applied proposal" })
                            .code(404);
                    }
                }
                else {
                    console.log("account.id ------------------", account.id);
                    proposal = yield job_1.default.aggregate([
                        {
                            $lookup: {
                                from: "experts",
                                localField: "proposals.account",
                                foreignField: "_id",
                                as: "expertData",
                                pipeline: [
                                    {
                                        $project: {
                                            avatar: 1,
                                            first_name: 1,
                                            last_name: 1,
                                            skills: 1,
                                            majors: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $match: {
                                _id: new ObjectId(request.params.jobId),
                                "proposals.mentor_check.mentor": account.email,
                            },
                        },
                        { $unwind: "$proposals" },
                        {
                            $match: {
                                "proposals.mentor_check.mentor": account.email,
                            },
                        },
                        {
                            $lookup: {
                                from: "experts",
                                localField: "proposals.expert.id",
                                foreignField: "account",
                                as: "expertData",
                                pipeline: [
                                    {
                                        $project: {
                                            avatar: 1,
                                            first_name: 1,
                                            last_name: 1,
                                            skills: 1,
                                            majors: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $project: {
                                proposals: 1,
                                expertData: 1,
                            },
                        },
                    ]);
                    if (!proposal) {
                        return response
                            .response({ staus: "err", err: "Not found applied proposal" })
                            .code(404);
                    }
                }
                return response.response({ status: "ok", data: proposal }).code(200);
            }
            catch (error) {
                return response
                    .response({ staus: "err", err: "Not implemented" })
                    .code(501);
            }
        }),
    },
    {
        method: "DELETE",
        path: "/{jobId}",
        options: {
            auth: "jwt",
            description: "Delete applied proposal",
            plugins: proposal_1.deleteProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`DELETE api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                // Check whether account is expert
                if (account.account_type !== "expert") {
                    return response
                        .response({ status: "err", err: "Frobidden Request!" })
                        .code(403);
                }
                // Check whether already apply proposal
                const existingProposal = yield job_1.default.findOne({
                    _id: request.params.jobId,
                    "proposals.expert.email": account.email,
                });
                console.log("existingproposal ------------->>>>>>>>>>>", existingProposal);
                if (!existingProposal) {
                    return response
                        .response({ status: "err", err: "Applied proposal not found!" })
                        .code(409);
                }
                try {
                    yield job_1.default.findOneAndUpdate({
                        _id: request.params.jobId,
                        "proposals.expert.email": account.email,
                    }, {
                        $pull: {
                            proposals: { "expert.email": account.email },
                        },
                    });
                    return response
                        .response({ status: "ok", data: "successfully deleted!" })
                        .code(200);
                }
                catch (error) {
                    return response
                        .response({ status: "err", err: "Applied Proposal not found!" })
                        .code(404);
                }
            }
            catch (error) {
                return response.response({ status: "err", err: "error" }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/{jobId}/withdraw",
        options: {
            auth: "jwt",
            description: "Withdraw applied proposal",
            plugins: proposal_1.updateProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`PUT api/v1/proposal/${request.params.jobId} 
          request from ${request.auth.credentials.email} Time: ${currentDate}`);
                // Check whether account is expert
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "expert") {
                    return response
                        .response({ status: "err", err: "Forbidden request" })
                        .code(403);
                }
                // Check whether profile exist
                try {
                    yield expert_1.default.findOne({ account: account.id });
                }
                catch (error) {
                    return response
                        .response({ status: "err", err: "Your profile does not exist" })
                        .code(406);
                }
                const data = request.payload;
                const proposal = yield job_1.default.findOneAndUpdate({
                    _id: request.params.jobId,
                    "proposals.expert.email": account.email,
                }, {
                    $set: {
                        "proposals.$.proposal_status": 6,
                    },
                }, { new: true }).select("proposals");
                return response
                    .response({ status: "ok", data: "Proposal successfully updated" })
                    .code(201);
            }
            catch (error) {
                return response
                    .response({ status: "err", err: "Not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/",
        options: {
            auth: "jwt",
            description: "Get all proposals",
            plugins: proposal_1.getProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                // Check whether account is expert
                if (account.account_type === "client") {
                    return response
                        .response({ status: "err", err: "Forbidden Request!" })
                        .code(403);
                }
                let proposal;
                if (account.account_type === "expert") {
                    proposal = yield job_1.default.aggregate([
                        { $unwind: "$proposals" },
                        {
                            $match: {
                                "proposals.expert.email": account.email,
                            },
                        },
                    ]);
                    if (!proposal) {
                        return response
                            .response({ staus: "err", err: "Not found applied proposal" })
                            .code(404);
                    }
                }
                else {
                    console.log("account.id ------------------", account.id);
                    proposal = yield job_1.default.aggregate([
                        { $unwind: "$proposals" },
                        {
                            $match: {
                                "proposals.mentor_check.mentor": account.email,
                            },
                        },
                        {
                            $lookup: {
                                from: "experts",
                                localField: "proposals.expert.id",
                                foreignField: "account",
                                as: "expertAvatar",
                                pipeline: [
                                    {
                                        $project: {
                                            avatar: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $lookup: {
                                from: "accounts",
                                localField: "proposals.expert.id",
                                foreignField: "_id",
                                as: "expertName",
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
                    ]);
                    if (!proposal) {
                        return response
                            .response({ staus: "err", err: "Not found applied proposal" })
                            .code(404);
                    }
                }
                return response.response({ status: "ok", data: proposal }).code(201);
            }
            catch (error) {
                return response
                    .response({ staus: "err", err: "Not implemented" })
                    .code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/download/{fileId}",
        options: {
            auth: "jwt",
            description: "download specific attached_file",
            plugins: proposal_1.downloadProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
            var _g, e_1, _h, _j;
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/download/${request.params.fileId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                const bucketdb = mongoose_1.default.connection.db;
                const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                    bucketName: "file",
                });
                // const downloadfile = bucket
                // .openDownloadStream(new ObjectId(`${request.params.fileId}`))
                // .pipe(fs.createWriteStream("Contract Project Lead.docx"));
                // const cursor = bucket.find({_id: new ObjectId(`${request.params.fileId}`)});
                // for await (const docs of cursor) {
                //   console.log(docs);
                // }
                const ObjectId = mongoose_1.default.Types.ObjectId;
                let mime = require("mime-types");
                console.log("mime------------->>>>>>>>>>>>>>", "mime");
                let file = bucket.find({ _id: new ObjectId(request.params.fileId) });
                let filename;
                let contentType;
                try {
                    for (var _k = true, file_1 = __asyncValues(file), file_1_1; file_1_1 = yield file_1.next(), _g = file_1_1.done, !_g; _k = true) {
                        _j = file_1_1.value;
                        _k = false;
                        const docs = _j;
                        console.log(docs);
                        filename = docs.filename;
                        contentType = mime.contentType(docs.filename);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_k && !_g && (_h = file_1.return)) yield _h.call(file_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                const downloadStream = bucket.openDownloadStream(new ObjectId(request.params.fileId));
                return h
                    .response(downloadStream)
                    .header("Content-Type", contentType)
                    .header("Content-Disposition", "attachment; filename= " + filename);
            }
            catch (err) {
                return h.response({ status: "err", err: "Download failed" }).code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/{jobId}/approve/{proposalId}",
        options: {
            auth: "jwt",
            description: "Approve proposal",
            plugins: proposal_1.approveProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/download/${request.params.fileId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                // Check whether account is mentor
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "mentor") {
                    return response
                        .response({ status: "err", err: "Forbidden request" })
                        .code(403);
                }
                // try {
                yield job_1.default.findOneAndUpdate({
                    $and: [
                        { _id: request.params.jobId },
                        // { "proposals._id": request.params.proposalId },
                        // {
                        //   "proposals.mentor_check.mentor": account.email,
                        // },
                    ],
                }, {
                    $set: {
                        "proposals.$[proposal].proposal_status": 2,
                        "proposals.$[proposal].mentor_check.$[mentorCheckId].checked": true,
                    },
                }, {
                    arrayFilters: [
                        { "proposal._id": request.params.proposalId },
                        { "mentorCheckId.mentor": account.email },
                    ],
                }, { new: true });
                const ObjectId = mongoose_1.default.Types.ObjectId;
                const approvedProposal = yield job_1.default.aggregate([
                    {
                        $match: {
                            _id: new ObjectId(request.params.jobId),
                        },
                    },
                    { $unwind: "$proposals" },
                    {
                        $match: {
                            "proposals._id": new ObjectId(request.params.proposalId),
                            "proposals.mentor_check.mentor": account.email,
                        },
                    },
                ]);
                // } catch (err) {
                //   return response
                //     .response({ status: "err", err: "Applied proposal Not found!" })
                //     .code(404);
                // }
                return response
                    .response({ status: "ok", data: approvedProposal })
                    .code(200);
            }
            catch (err) {
                return response
                    .response({ status: "err", err: "Approve failed!" })
                    .code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/{jobId}/decline/{proposalId}",
        options: {
            auth: "jwt",
            description: "Approve proposal",
            plugins: proposal_1.approveProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/download/${request.params.fileId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                // Check whether account is mentor
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "mentor") {
                    return response
                        .response({ status: "err", err: "Forbidden request" })
                        .code(403);
                }
                // try {
                yield job_1.default.findOneAndUpdate({
                    $and: [
                        { _id: request.params.jobId },
                        // { "proposals._id": request.params.proposalId },
                        // {
                        //   "proposals.mentor_check.mentor": account.email,
                        // },
                    ],
                }, {
                    $set: {
                        "proposals.$[proposal].proposal_status": 1,
                        "proposals.$[proposal].mentor_check.$[mentorCheckId].checked": true,
                    },
                }, {
                    arrayFilters: [
                        { "proposal._id": request.params.proposalId },
                        { "mentorCheckId.mentor": account.email },
                    ],
                }, { new: true });
                const ObjectId = mongoose_1.default.Types.ObjectId;
                const approvedProposal = yield job_1.default.aggregate([
                    {
                        $match: {
                            _id: new ObjectId(request.params.jobId),
                        },
                    },
                    { $unwind: "$proposals" },
                    {
                        $match: {
                            "proposals._id": new ObjectId(request.params.proposalId),
                            "proposals.mentor_check.mentor": account.email,
                        },
                    },
                ]);
                // } catch (err) {
                //   return response
                //     .response({ status: "err", err: "Applied proposal Not found!" })
                //     .code(404);
                // }
                return response
                    .response({ status: "ok", data: approvedProposal })
                    .code(200);
            }
            catch (err) {
                return response
                    .response({ status: "err", err: "Approve failed!" })
                    .code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/{jobId}/viewed/{proposalId}",
        options: {
            auth: "jwt",
            description: "Approve proposal",
            plugins: proposal_1.approveProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/download/${request.params.fileId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                // Check whether account is mentor
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "client") {
                    return response
                        .response({ status: "err", err: "Forbidden request" })
                        .code(403);
                }
                // try {
                yield job_1.default.findOneAndUpdate({
                    $and: [
                        { _id: request.params.jobId },
                        // { "proposals._id": request.params.proposalId },
                        // {
                        //   "proposals.mentor_check.mentor": account.email,
                        // },
                    ],
                }, {
                    $set: {
                        "proposals.$[proposal].proposal_status": 3,
                        "proposals.$[proposal].mentor_check.$[mentorCheckId].checked": true,
                    },
                }, {
                    arrayFilters: [
                        { "proposal._id": request.params.proposalId },
                        { "mentorCheckId.mentor": account.email },
                    ],
                }, { new: true });
                const ObjectId = mongoose_1.default.Types.ObjectId;
                const approvedProposal = yield job_1.default.aggregate([
                    {
                        $match: {
                            _id: new ObjectId(request.params.jobId),
                        },
                    },
                    { $unwind: "$proposals" },
                    {
                        $match: {
                            "proposals._id": new ObjectId(request.params.proposalId),
                            "proposals.mentor_check.mentor": account.email,
                        },
                    },
                ]);
                // } catch (err) {
                //   return response
                //     .response({ status: "err", err: "Applied proposal Not found!" })
                //     .code(404);
                // }
                return response
                    .response({ status: "ok", data: approvedProposal })
                    .code(200);
            }
            catch (err) {
                return response
                    .response({ status: "err", err: "Approve failed!" })
                    .code(501);
            }
        }),
    },
];
//# sourceMappingURL=proposal.js.map