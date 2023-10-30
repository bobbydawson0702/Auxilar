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
exports.projectRoute = void 0;
const ethers_1 = require("ethers");
const venly_1 = require("../utils/venly");
const process_1 = __importDefault(require("process"));
const fs_1 = __importDefault(require("fs"));
const project_1 = require("../utils/blockchain/project");
const project_2 = require("../validation/project");
const users_1 = __importDefault(require("../models/users"));
const project_3 = require("../swagger/project");
const projects_1 = __importDefault(require("../models/projects"));
const manager_1 = require("../utils/blockchain/manager");
const withdraw_1 = __importDefault(require("../models/withdraw"));
const options = { abortEarly: false, stripUnknown: true };
const path = process_1.default.cwd();
const network = process_1.default.env.ETHEREUM_NETWORK;
const provider = new ethers_1.InfuraProvider(network, process_1.default.env.INFURA_API_KEY);
const deploy = (abi, bytecode, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload.tokenName, payload.tokenSymbol, payload.tonnage);
    const signer = new ethers_1.ethers.Wallet(process_1.default.env.SIGNER_PRIVATE_KEY, provider);
    const factory = new ethers_1.ethers.ContractFactory(abi, bytecode, signer);
    const contract = yield factory.deploy(payload.tokenName, payload.tokenSymbol, payload.tonnage * 1000); // Add constructor arguments if required
    return contract;
});
exports.projectRoute = [
    {
        method: "POST",
        path: "/register",
        config: {
            description: "Create Project",
            auth: "jwt",
            plugins: project_3.createProjectSwagger,
            payload: {
                maxBytes: 10485760000,
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                multipart: { output: "stream" },
            },
            tags: ["api", "project"],
            validate: {
                payload: project_2.projectCreateSchema,
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
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                if (user.wallet.address === "") {
                    const wallet = yield (0, venly_1.createWallet)();
                    console.log(wallet);
                    user.wallet.address = wallet.result.address;
                    user.wallet.id = wallet.result.id;
                    yield user.save();
                }
                payload["projectOwner"] = request.auth.credentials.userId;
                const projectImage = payload["projectImage"];
                delete payload["projectImage"];
                const newProject = new projects_1.default(payload);
                const extension = projectImage.hapi.filename.split(".");
                const databaseFilePath = `/static/uploads/project/${newProject.id}/projectImage.${extension[extension.length - 1]}`;
                let filePath = path + `/static/uploads/project/${newProject.id}`;
                console.log(databaseFilePath);
                try {
                    if (!fs_1.default.existsSync(filePath))
                        fs_1.default.mkdirSync(filePath);
                    filePath += `/projectImage.${extension[extension.length - 1]}`;
                    const projectPipe = fs_1.default.createWriteStream(filePath);
                    projectImage.pipe(projectPipe);
                    newProject.projectImage = databaseFilePath;
                    yield newProject.save();
                    return response.response(newProject).code(201);
                }
                catch (error) {
                    console.log(error);
                }
            }),
        },
    },
    {
        method: "POST",
        path: "/{id}/documents",
        config: {
            description: "Upload Project Document",
            plugins: project_3.uploadDocumentsSwagger,
            payload: {
                maxBytes: 10485760000,
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                multipart: { output: "stream" },
            },
            tags: ["api", "project"],
            validate: {
                payload: project_2.uploadDocumentSchema,
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
                const fileNames = [
                    "technicalReport",
                    "financialReport",
                    "commercialReport",
                    "risk",
                    "community",
                    "vesselCertificate",
                ];
                let filePath = path + `/static/uploads/project/${request.params.id}`;
                try {
                    if (!fs_1.default.existsSync(filePath))
                        fs_1.default.mkdirSync(filePath);
                    const project = yield projects_1.default.findById(request.params.id);
                    fileNames.map((fileName) => {
                        const extension = payload[fileName].hapi.filename.split(".");
                        const savedPath = filePath + `/${fileName}.${extension[extension.length - 1]}`;
                        const projectPipe = fs_1.default.createWriteStream(savedPath);
                        payload[fileName].pipe(projectPipe);
                        const newPath = savedPath.replace(path, "");
                        console.log("documentation -->", newPath);
                        project.documents[fileName] = newPath;
                    });
                    yield project.save();
                    return response.response("successfully uploaded");
                }
                catch (error) {
                    console.log(error);
                }
            }),
        },
    },
    {
        method: "GET",
        path: "/all",
        config: {
            description: "Get all project with filter",
            auth: "jwt",
            plugins: project_3.getAllProjectSwagger,
            tags: ["api", "project"],
            validate: {
                query: project_2.getProjectSchema,
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
                let { tokenized, sto, page, status, allowance } = request.query;
                const query = {};
                if (user.role === "prowner") {
                    query["projectOwner"] = request.auth.credentials.userId;
                }
                if (user.role === "investor") {
                    query["allowance"] = 1;
                }
                if (tokenized !== undefined) {
                    query["tokenized"] = tokenized;
                }
                if (sto !== undefined) {
                    query["isSTOLaunched"] = sto;
                }
                query["allowance"] = 0;
                const pendingCount = yield projects_1.default.countDocuments(query);
                query["allowance"] = 1;
                const approvedCount = yield projects_1.default.countDocuments(query);
                query["allowance"] = 2;
                const rejectCount = yield projects_1.default.countDocuments(query);
                delete query["allowance"];
                query["status"] = true;
                const activeCount = yield projects_1.default.countDocuments(query);
                query["status"] = false;
                const inactiveCount = yield projects_1.default.countDocuments(query);
                delete query["status"];
                if (status !== undefined) {
                    query["status"] = status;
                }
                if (allowance !== undefined) {
                    query["allowance"] = allowance;
                }
                if (page) {
                    page = parseInt(page);
                }
                else
                    page = 1;
                const total = yield projects_1.default.countDocuments(query);
                console.log(total);
                let result = yield projects_1.default.find(query)
                    .populate({
                    path: "projectOwner",
                    select: "email firstName lastName",
                })
                    .skip((page - 1) * 25)
                    .sort({ createdAt: -1 })
                    .limit(25);
                let index = 0;
                const finalResult = [];
                for (; index < result.length; index++) {
                    const row = result[index];
                    if (row.allowance === 1) {
                        const withdrawalRequest = yield withdraw_1.default.findOne({
                            projectId: row._id,
                        });
                        const givenRewards = yield (0, project_1.getGivenRewards)(row._id.toString());
                        const investments = yield (0, project_1.getFundraising)(row._id.toString());
                        const withdrawals = yield (0, project_1.getWithdrawal)(row._id.toString());
                        finalResult.push(Object.assign(Object.assign({}, row), { withdrawalRequest: withdrawalRequest
                                ? withdrawalRequest.allowance
                                : "undefined", givenRewards,
                            investments,
                            withdrawals }));
                    }
                    else {
                        finalResult.push(row);
                    }
                }
                return {
                    total,
                    pendingCount,
                    approvedCount,
                    rejectCount,
                    activeCount,
                    inactiveCount,
                    data: finalResult,
                    offset: page * 25,
                };
            }),
        },
    },
    {
        method: "POST",
        path: "/{projectId}/tokenization",
        config: {
            description: "Tokenize the Project",
            auth: "jwt",
            plugins: project_3.tokenizationProjectSwagger,
            tags: ["api", "project"],
            validate: {
                payload: project_2.tokenizationProjectSchema,
                params: project_2.deleteProjectSchema,
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
                const project = yield projects_1.default.findById(request.params.projectId);
                if (project) {
                    try {
                        const updatedData = yield projects_1.default.updateOne({ _id: request.params.projectId }, { $set: { tokenization: request.payload } });
                        return response
                            .response({
                            result: "success",
                        })
                            .code(200);
                    }
                    catch (error) {
                        return response.response({ msg: "Updated Failed" }).code(404);
                    }
                }
                return response.response({ msg: "Project not found" }).code(404);
            }),
        },
    },
    {
        method: "POST",
        path: "/{projectId}/submit",
        config: {
            description: "Allow the Project",
            auth: "jwt",
            plugins: project_3.allowProjectSwagger,
            tags: ["api", "project"],
            validate: {
                payload: project_2.allowanceProjectSchema,
                params: project_2.deleteProjectSchema,
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
                const project = yield projects_1.default.findById(request.params.projectId);
                if (project) {
                    try {
                        try {
                            const { tokenName, tokenSymbol, tonnage, offeringPercentage, assetValue, decimal, } = project.tokenization;
                            const user = yield users_1.default.findById(project.projectOwner);
                            const result = yield (0, manager_1.createNewProject)(String(project._id), tokenName, tokenSymbol, tonnage * 10 * offeringPercentage, decimal, Number((assetValue / (tonnage * 1000)).toFixed(18)), String(user.wallet.address));
                            if (result.success === true) {
                                const updatedData = yield projects_1.default.updateOne({ _id: request.params.projectId }, {
                                    $set: {
                                        tokenized: true,
                                        allowance: request.payload["allowance"],
                                        contract: result.contract,
                                    },
                                });
                                return response.response(updatedData).code(200);
                            }
                            else
                                return response
                                    .response({
                                    msg: "Failed to deploy cproject contract",
                                })
                                    .code(400);
                        }
                        catch (error) {
                            console.log(error);
                            return response
                                .response({ msg: "Failed to deploy project contract" })
                                .code(500);
                        }
                    }
                    catch (error) {
                        return response.response({ msg: "Updated Failed" }).code(404);
                    }
                }
                return response.response({ msg: "Project not found" }).code(404);
            }),
        },
    },
    {
        method: "GET",
        path: "/{projectId}",
        config: {
            description: "Get single project with project ID",
            auth: "jwt",
            plugins: project_3.getSingleProjectSwagger,
            tags: ["api", "project"],
            validate: {
                params: project_2.deleteProjectSchema,
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
                const project = yield projects_1.default.findById(request.params.projectId).populate({
                    path: "projectOwner",
                    select: "email firstName lastName phoneNumber",
                });
                const withdrawalRequest = yield withdraw_1.default.findOne({
                    projectId: project._id,
                });
                if (project.allowance === 1) {
                    const givenRewards = yield (0, project_1.getGivenRewards)(project._id.toString());
                    const investments = yield (0, project_1.getFundraising)(project._id.toString());
                    const withdrawals = yield (0, project_1.getWithdrawal)(project._id.toString());
                    return response.response(Object.assign(Object.assign({}, project), { withdrawalRequest: withdrawalRequest
                            ? withdrawalRequest.allowance
                            : "undefined", givenRewards,
                        investments,
                        withdrawals }));
                }
                if (project) {
                    return response.response(Object.assign(Object.assign({}, project), { withdrawalRequest: withdrawalRequest
                            ? withdrawalRequest.allowance
                            : "undefined", givenRewards: 0, investments: 0, withdrawals: 0 }));
                }
                return response.response({ msg: "Project not found" }).code(404);
            }),
        },
    },
    {
        method: "POST",
        path: "/deposit",
        config: {
            description: "Deposit on my project",
            auth: "jwt",
            plugins: project_3.depositProjectSwagger,
            tags: ["api", "project"],
            validate: {
                payload: project_2.depositProjectSchema,
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
                if (user.role === "prowner") {
                    const result = yield (0, project_1.deposit)(request.payload["projectId"], user.wallet.id, user.wallet.address, request.payload["amount"]);
                    if (result === true)
                        return response.response({ msg: "Deposit Success" });
                    return response.response({ msg: "Deposit failed" }).code(400);
                }
                return response.response({ msg: "No permission" }).code(403);
            }),
        },
    },
    {
        method: "POST",
        path: "/withdraw",
        config: {
            description: "Withdraw on my project",
            auth: "jwt",
            plugins: project_3.withdrawProjectSwagger,
            tags: ["api", "project"],
            validate: {
                payload: project_2.withdrawProjectSchema,
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
                if (user.role === "prowner") {
                    const project = yield projects_1.default.findOne({
                        _id: request.payload["projectId"],
                        projectOwner: user._id,
                    });
                    if (project) {
                        const withdrawData = yield withdraw_1.default.findOne({
                            projectId: request.payload["projectId"],
                        });
                        if (withdrawData) {
                            withdrawData.allowance = false;
                            yield withdrawData.save();
                        }
                        else {
                            const newWithDraw = new withdraw_1.default(request.payload);
                            yield newWithDraw.save();
                        }
                        return response.response({ msg: "Withdraw saved" }).code(200);
                    }
                    return response
                        .response({ msg: "This project is not yours" })
                        .code(403);
                }
                return response.response({ msg: "No permission" }).code(403);
            }),
        },
    },
    {
        method: "POST",
        path: "/withdraw/submit",
        config: {
            description: "Withdraw on my project",
            auth: "jwt",
            plugins: project_3.withdrawSubmitProjectSwagger,
            tags: ["api", "project"],
            validate: {
                payload: project_2.withdrawSubmitProjectSchema,
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
                const status = request.payload["status"];
                if (user.role === "admin") {
                    const withdrawData = yield withdraw_1.default.findOne({
                        projectId: request.payload["projectId"],
                    });
                    if (withdrawData && withdrawData.allowance === false) {
                        if (status === true) {
                            const result = yield (0, project_1.withdraw)(withdrawData.projectId.toString(), user.wallet.address);
                            if (result === true) {
                                yield withdrawData.deleteOne();
                                return response.response({ msg: "Withdraw success" });
                            }
                            else {
                                return response.response({ msg: "Failed" }).code(500);
                            }
                        }
                        else {
                            withdrawData.allowance = true;
                            yield withdrawData.save();
                            return response.response({ msg: "Withdraw failed" });
                        }
                    }
                    return response.response({ msg: "Withdraw not found" }).code(404);
                }
                return response.response({ msg: "No permission" }).code(403);
            }),
        },
    },
    {
        method: "POST",
        path: "/claim",
        config: {
            description: "claim on my project",
            auth: "jwt",
            plugins: project_3.claimProjectSwagger,
            tags: ["api", "project"],
            validate: {
                payload: project_2.claimProjectSchema,
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
                if (user.role === "investor") {
                    const result = yield (0, project_1.claim)(request.payload["projectId"], user.wallet.id, user.wallet.address);
                    if (result === true) {
                        return response.response({ msg: "Claimed successfully" });
                    }
                    return response.response({ msg: "Claimed failed" }).code(400);
                }
                return response.response({ msg: "No permission" }).code(403);
            }),
        },
    },
    {
        method: "DELETE",
        path: "/{projectId}",
        config: {
            description: "Get single project with project ID",
            auth: "jwt",
            plugins: project_3.deleteProjectSwagger,
            tags: ["api", "project"],
            validate: {
                params: project_2.deleteProjectSchema,
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
                const project = yield projects_1.default.findById(request.params.projectId);
                if (project) {
                    if (user.role === "admin" ||
                        project.projectOwner.toString() === user._id.toString()) {
                        yield project.deleteOne();
                        return response.response({ msg: "Removed Successfully" });
                    }
                    return response
                        .response({
                        msg: "You don't have permission to delete this project",
                    })
                        .code(403);
                }
                return response.response({ msg: "Project not found" }).code(404);
            }),
        },
    },
];
//# sourceMappingURL=project.js.map