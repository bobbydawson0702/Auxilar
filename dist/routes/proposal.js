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
const proposal_1 = require("../swagger/proposal");
const proposal_2 = require("../validation/proposal");
const account_1 = __importDefault(require("../models/account"));
const expert_1 = __importDefault(require("../models/profile/expert"));
const job_1 = __importDefault(require("../models/job"));
const options = { abortEarly: false, stripUnknown: true };
exports.proposalRoute = [
    {
        method: "POST",
        path: "/{jobId}",
        options: {
            auth: "jwt",
            description: "apply Proposal",
            plugins: proposal_1.ProposalSwagger,
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
        },
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
                // Check whether already apply proposal
                const existingProposal = yield job_1.default.findOne({
                    _id: request.params.jobId,
                    "proposals.expert_email": account.email,
                });
                if (existingProposal) {
                    return response
                        .response({ status: "err", err: "Proposal already exist!" })
                        .code(409);
                }
                // apply proposal
                const proposal = yield job_1.default.findOneAndUpdate({ _id: request.params.jobId }, {
                    $push: {
                        proposals: {
                            expert_email: account.email,
                            cover_letter: data["cover_letter"],
                            attached_file: data["attached_file"],
                            milestones: data["milestones"],
                        },
                    },
                }, { new: true }).select("proposals");
                if (!proposal) {
                    return response
                        .response({ status: "err", err: "Posted job not found!" })
                        .code(404);
                }
                return response.response({ status: "ok", data: proposal }).code(201);
            }
            catch (error) {
                return response
                    .response({ status: "err", err: "Not implemented!" })
                    .code(501);
            }
        }),
    },
    {
        method: "PUT",
        path: "/{proposalId}",
        options: {
            auth: "jwt",
            description: "Update proposal",
            plugins: proposal_1.updateProposalSwagger,
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
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`PUT api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                // Check whether account is expert
                const account = yield account_1.default.findOne({
                    email: request.auth.credentials.email,
                });
                if (account.account_type !== "expert") {
                    return response
                        .response({ status: "err", err: "Frobidden Request!" })
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
                // Edit proposal
                const proposal = yield job_1.default.findOneAndUpdate({
                    "proposals._id": request.params.proposalId,
                    "proposals.expert_email": account.email,
                }, {
                    $set: {
                        proposals: {
                            expert_email: account.email,
                            cover_letter: data["cover_letter"],
                            attached_file: data["attached_file"],
                            milestones: data["milestones"],
                        },
                    },
                }, { new: true }).select("proposals");
                if (!proposal) {
                    return response
                        .response({ status: "err", err: "Applied Proposal not found!" })
                        .code(404);
                }
                return response.response({ status: "ok", data: proposal }).code(201);
            }
            catch (error) {
                return response.response({ status: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "GET",
        path: "/{proposalId}",
        options: {
            auth: "jwt",
            description: "Update proposal",
            plugins: proposal_1.getProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                // const account = await Account.findOne({
                //   email: request.auth.credentials.email,
                // });
                // // Check whether account is expert
                // // if (account.account_type !== "expert") {
                // //   return response
                // //     .response({ status: "err", err: "Frobidden Request!" })
                // //     .code(403);
                // // }
                const proposal = yield job_1.default.findOne({
                    "proposals._id": request.params.proposalId,
                    "proposals.expert_email": request.auth.credentials.email,
                }).select("proposals");
                if (!proposal) {
                    return response
                        .response({ status: "err", err: "Applied Proposal not found!" })
                        .code(404);
                }
                return response.response({ status: "ok", data: proposal }).code(201);
            }
            catch (error) {
                return response.response({ staus: "err", err: error }).code(501);
            }
        }),
    },
    {
        method: "DELETE",
        path: "/{proposalId}",
        options: {
            auth: "jwt",
            description: "Delete proposal",
            plugins: proposal_1.deleteProposalSwagger,
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
                if (account.account_type !== "expert") {
                    return response
                        .response({ status: "err", err: "Frobidden Request!" })
                        .code(403);
                }
                // Check whether already apply proposal
                const existingProposal = yield job_1.default.findOne({
                    "proposals._id": request.params.proposalId,
                    "proposals.expert_email": account.email,
                });
                if (!existingProposal) {
                    return response
                        .response({ status: "err", err: "Applied proposal not found!" })
                        .code(409);
                }
                try {
                    yield job_1.default.findOneAndUpdate({
                        "proposals._id": request.params.proposalId,
                        "proposals.expert_email": request.auth.credentials.email,
                    }, {
                        $pull: {
                            proposals: { _id: request.params.proposalId },
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
        method: "GET",
        path: "/",
        options: {
            auth: "jwt",
            description: "Update proposal",
            plugins: proposal_1.getAllProposalSwagger,
            tags: ["api", "proposal"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const currentDate = new Date().toUTCString();
                console.log(`GET api/v1/proposal/${request.params.proposalId} from 
        ${request.auth.credentials.email} Time: ${currentDate}`);
                // const account = await Account.findOne({
                //   email: request.auth.credentials.email,
                // });
                // // Check whether account is expert
                // // if (account.account_type !== "expert") {
                // //   return response
                // //     .response({ status: "err", err: "Frobidden Request!" })
                // //     .code(403);
                // // }
                const proposal = yield job_1.default.find({
                    "proposals.expert_email": request.auth.credentials.email,
                }).select("proposals").sort({ 'pub_date': -1 });
                if (!proposal) {
                    return response
                        .response({ status: "err", err: "Applied Proposal not found!" })
                        .code(404);
                }
                return response.response({ status: "ok", data: proposal }).code(201);
            }
            catch (error) {
                return response.response({ staus: "err", err: error }).code(501);
            }
        }),
    },
];
//# sourceMappingURL=proposal.js.map