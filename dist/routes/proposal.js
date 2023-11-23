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
exports.proposalRoute = void 0;
const fs_1 = __importDefault(require("fs"));
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
                    console.log("------------------<<<<<<<here>>>>>>>>>>>>>>>>>---------------", data["proposalData"]["cover_letter"]);
                    try {
                        // Check whether Posted job exist
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
                    const proposalField = {
                        expert: { id: account.id, email: account.email },
                        cover_letter: data["proposalData"]["cover_letter"],
                        total_amount: data["proposalData"]["total_amount"],
                        milestones: data["proposalData"]["milestones"],
                        proposal_status: 1,
                        mentor_check: [],
                        attached_files: [],
                    };
                    // Check whether mentors exist
                    if (data["proposalData"]["mentors"]) {
                        const mentor_check = [];
                        data["proposalData"]["mentors"].forEach((item) => {
                            mentor_check.push({
                                mentor: item,
                                checked: false,
                            });
                        });
                        proposalField["mentor_check"] = mentor_check;
                        proposalField["proposal_status"] = 2;
                    }
                    console.log("data[attached_files]------------------------>>>>>>>>>>>>>>", data["attached_files"]);
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
                        console.log("proposals ---------------------->>>>>>>>>>>>>", proposal);
                        data["attached_files"].forEach((fileItem) => __awaiter(void 0, void 0, void 0, function* () {
                            const bucketdb = mongoose_1.default.connection.db;
                            const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                                bucketName: "file",
                            });
                            const attached_file = fileItem;
                            // console.log(request.payload);
                            console.log("-------------here-----------", attached_file.hapi.filename);
                            const uploadStream = bucket.openUploadStream(attached_file.hapi.filename);
                            uploadStream.on("finish", (file) => __awaiter(void 0, void 0, void 0, function* () {
                                // proposalField["attached_files"].push ({
                                //   name: attached_file.hapi.filename,
                                //   file_id: file._id,
                                // });
                                console.log("<<<<<<<<<--------attached_file.hapi.filename----------->>>>>>>>>>>>>>>>>>", attached_file.hapi.filename);
                                console.log("<<<<<<<<<--------file._id----------->>>>>>>>>>>>>>>>>>", file._id);
                                console.log("<<<<<<<<<--------proposal._id----------->>>>>>>>>>>>>>>>>>", proposal[0].proposals[0]._id);
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
                                console.log("------------------------attachedProposal--------------------", attachedProposal);
                            }));
                            yield attached_file.pipe(uploadStream);
                        }));
                    }
                    else {
                        console.log("----------------------------here-------------------------------------");
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
            // },
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
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
                        // delete uploaded file
                        const appliedProposal = yield job_1.default.findOne({
                            _id: request.params.jobId,
                            "proposals.expert.email": account.email,
                        }, { "proposals.$": 1 });
                        console.log("here---------------------->>>>>>>>>>", appliedProposal);
                        const attached_file = appliedProposal.proposals[0]["attached_files"];
                        console.log("attached_file.length-------------->>>>>>>>>>>>>>", attached_file);
                        if (attached_file) {
                            attached_file.forEach((item) => {
                                const bucketdb = mongoose_1.default.connection.db;
                                const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                                    bucketName: "file",
                                });
                                console.log("item---------------->>>>>>>>>>>>>>", item);
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
                    const proposalField = {
                        expert: { id: account.id, email: account.email },
                        cover_letter: data["proposalData"]["cover_letter"],
                        total_amount: data["proposalData"]["total_amount"],
                        milestones: data["proposalData"]["milestones"],
                        proposal_status: 1,
                        mentor_check: [],
                        attached_files: [],
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
                        proposalField["proposal_status"] = 2;
                    }
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
                                "proposals.$.mentor_check": (_a = proposalField["mentor_check"]) !== null && _a !== void 0 ? _a : null,
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
                        console.log("proposals ---------------------->>>>>>>>>>>>>", proposal);
                        data["attached_files"].forEach((fileItem) => __awaiter(void 0, void 0, void 0, function* () {
                            const bucketdb = mongoose_1.default.connection.db;
                            const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                                bucketName: "file",
                            });
                            const attached_file = fileItem;
                            // console.log(request.payload);
                            console.log("-------------here-----------", attached_file.hapi.filename);
                            const uploadStream = bucket.openUploadStream(attached_file.hapi.filename);
                            uploadStream.on("finish", (file) => __awaiter(void 0, void 0, void 0, function* () {
                                // proposalField["attached_files"].push ({
                                //   name: attached_file.hapi.filename,
                                //   file_id: file._id,
                                // });
                                console.log("<<<<<<<<<--------attached_file.hapi.filename----------->>>>>>>>>>>>>>>>>>", attached_file.hapi.filename);
                                console.log("<<<<<<<<<--------file._id----------->>>>>>>>>>>>>>>>>>", file._id);
                                console.log("<<<<<<<<<--------proposal._id----------->>>>>>>>>>>>>>>>>>", proposal[0].proposals[0]._id);
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
                                console.log("------------------------attachedProposal--------------------", attachedProposal);
                            }));
                            yield attached_file.pipe(uploadStream);
                        }));
                    }
                    else {
                        console.log("----------------------------here-------------------------------------");
                        const proposal = yield job_1.default.findOneAndUpdate({
                            _id: request.params.jobId,
                            "proposals.expert.email": account.email,
                        }, {
                            $set: {
                                "proposals.$.cover_letter": proposalField.cover_letter,
                                "proposals.$.total_amount": proposalField.total_amount,
                                "proposals.$.milestones": proposalField.milestones,
                                "proposals.$.proposal_status": proposalField.proposal_status,
                                "proposals.$.mentor_check": (_b = proposalField["mentor_check"]) !== null && _b !== void 0 ? _b : null,
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
                // Check whether account is expert
                // if (account.account_type !== "expert") {
                //   return response
                //     .response({ status: "err", err: "Frobidden Request!" })
                //     .code(403);
                // }
                let proposal;
                const ObjectId = mongoose_1.default.Types.ObjectId;
                if (account.account_type === "client") {
                    proposal = yield job_1.default.aggregate([
                        {
                            $match: {
                                _id: new ObjectId(request.params.jobId),
                            },
                        },
                        {
                            $project: {
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
                        "proposals.$.proposal_status": 0,
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
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/download/${request.params.fileId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                const bucketdb = mongoose_1.default.connection.db;
                const bucket = new mongoose_1.default.mongo.GridFSBucket(bucketdb, {
                    bucketName: "file",
                });
                // const fileId = request.params.fileId;
                // const files = bucketdb.collection("GridFS Buckets.file");
                // console.log("files----------------------->>>>>>>>>>>>>>>>>", files);
                // // const filename = await files.findOne({ _id: fileId });
                const ObjectId = mongoose_1.default.Types.ObjectId;
                const downloadfile = bucket.openDownloadStream(new ObjectId(`${request.params.fileId}`));
                // .pipe(fs.createWriteStream("Contract Project Lead.docx"));
                console.log("-------------------here----------");
                return h.response({
                    status: "success",
                    data: downloadfile.pipe(fs_1.default.createWriteStream("Contract Project Lead.docx")),
                });
                // return downloadfile.pipe(h.response());
                // return h.download(downloadfile);
            }
            catch (err) {
                return h.response({ status: "err", err: "Download failed" }).code(501);
            }
        }),
    },
];
//# sourceMappingURL=proposal.js.map