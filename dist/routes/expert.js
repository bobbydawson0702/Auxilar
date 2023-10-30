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
const account_1 = __importDefault(require("../models/account"));
// import config from '../config';
const expert_1 = require("../swagger/expert");
const expert_2 = require("../validation/expert");
const expert_3 = __importDefault(require("../models/expert"));
const skill_1 = require("../swagger/skill");
const skill_2 = __importDefault(require("../models/skill"));
const major_1 = __importDefault(require("../models/major"));
const options = { abortEarly: false, stripUnknown: true };
exports.expertRoute = [
    {
        method: 'POST',
        path: '/',
        // config: {
        options: {
            auth: 'jwt',
            description: 'Create or Update expert profile',
            plugins: expert_1.ProfileSwagger,
            tags: ['api', 'expert'],
            validate: {
                payload: expert_2.ProfileSchema,
                options,
                failAction: (requeset, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                }
            },
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            try {
                console.log(`POST api/v1/expert request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                if (!account) {
                    return response.response({ status: 'err', err: 'Account not found!' }).code(404);
                }
                // if (expert) {
                //   return response.response({ status: 'err', err: 'ExpertProfile already exist!' }).code(409);
                // }
                console.log(account);
                const data = request.payload;
                console.log('data---------------', data);
                const expertField = {
                    account: account.id,
                    address: data['address'],
                    post_number: data['post_number'],
                    languages: data['languages'],
                    avatar: (_a = data['avatar']) !== null && _a !== void 0 ? _a : null,
                    rating: data['rating'],
                    summary: data['summary'],
                    verified_by: data['verified_by'],
                    portfolios: data['portfolios'],
                    skills: data['skills'],
                    majors: data['majors'],
                };
                const expert = yield expert_3.default.findOneAndUpdate({ account: account.id }, { $set: expertField }, { new: true, upsert: true, setDefaultsOnInsert: true });
                yield expert.save();
                const responseData = yield expert.populate('account', ['first_name', 'last_name', 'email']);
                console.log(`response data : ${responseData}`);
                return response.response({ status: 'ok', data: responseData }).code(201);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(400);
            }
        })
    },
    {
        method: 'GET',
        path: '/',
        options: {
            auth: 'jwt',
            description: 'Get expert profile',
            plugins: expert_1.getProfileSwagger,
            tags: ['api', 'expert'],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/expert/ request from ${request.auth.credentials.email}`);
                const expert = yield expert_3.default.findOne({ account: request.auth.credentials.accountId });
                if (!expert) {
                    console.log('Profile not found!');
                    return response.response({ status: 'err', err: 'Profile not found!' }).code(404);
                }
                const responseData = yield expert.populate('account', ['first_name', 'last_name', 'email']);
                console.log('request success');
                console.log(`response data : ${responseData}`);
                return response.response({ status: 'ok', data: responseData }).code(201);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(500);
            }
        })
    },
    {
        method: 'GET',
        path: '/all-skills',
        options: {
            auth: 'jwt',
            description: 'Get all recorded Skills',
            plugins: skill_1.getAllSkills,
            tags: ['api', 'expert'],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/expert/all-skills request from ${request.auth.credentials.email}`);
                const allSkills = yield skill_2.default.find();
                if (!allSkills) {
                    return response.response({ status: 'err', err: 'Recorded skill not found!' }).code(404);
                }
                return response.response({ status: 'ok', data: allSkills }).code(201);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(500);
            }
        })
    },
    {
        method: 'GET',
        path: '/all-majors',
        options: {
            auth: 'jwt',
            description: 'Get all recorded Majors',
            plugins: skill_1.getAllSkills,
            tags: ['api', 'expert'],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/expert/all-majors request from ${request.auth.credentials.email}`);
                const allMajors = yield major_1.default.find();
                if (!allMajors) {
                    return response.response({ status: 'err', err: 'Recorded major not found!' }).code(404);
                }
                return response.response({ status: 'ok', data: allMajors }).code(201);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(500);
            }
        })
    },
    {
        method: 'DELETE',
        path: '/',
        options: {
            auth: 'jwt',
            description: 'Delete expert profile',
            plugins: expert_1.deleteProfileSwagger,
            tags: ['api', 'expert'],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`DELETE api/v1/expert request from ${request.auth.credentials.email}`);
                const deleteStatus = yield expert_3.default.deleteOne({ account: request.auth.credentials.accountId });
                console.log('delete result ----------->', deleteStatus);
                if (deleteStatus.deletedCount)
                    return response.response({ status: 'ok', data: 'Successfuly deleted!' }).code(201);
                else
                    return response.response({ status: 'err', err: "Profile not found!" }).code(404);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(500);
            }
        })
    }
];
//# sourceMappingURL=expert.js.map