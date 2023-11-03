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
exports.clientRoute = void 0;
const client_1 = require("../../swagger/profile/client");
const client_2 = require("../../validation/profile/client");
const account_1 = __importDefault(require("../../models/account"));
const client_3 = __importDefault(require("../../models/profile/client"));
const options = { abortEarly: false, stripUnknown: true };
exports.clientRoute = [
    {
        method: 'POST',
        path: '/',
        options: {
            auth: 'jwt',
            description: 'Create or Update client profile',
            plugins: client_1.ProfileSwagger,
            tags: ['api', 'client'],
            validate: {
                payload: client_2.ProfileSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return { err: d.message, path: d.path };
                    });
                    return h.response(details).code(400).takeover();
                }
            }
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log(`POST api/v1/client request from ${request.auth.credentials.email}`);
                const account = yield account_1.default.findById(request.auth.credentials.accountId);
                // Check account type 
                if (account.account_type !== 'client') {
                    return response.response({ status: 'err', err: 'Not allowed' }).code(403);
                }
                console.log(account);
                const data = request.payload;
                console.log('data---------------------------', data);
                let birthday = new Date("<yyyy-mm-dd>");
                birthday = data['birthday'];
                const clientField = {
                    email: account.email,
                    avatar: (_a = data['avatar']) !== null && _a !== void 0 ? _a : null,
                    birthday: birthday,
                    country: data['country'],
                    state: data['state'],
                    city: data['city'],
                    address: data['address'],
                    languages: data['languages'],
                    soial_media: (_b = data['social_media']) !== null && _b !== void 0 ? _b : null,
                    payment_verify: (_c = data['payment_verify']) !== null && _c !== void 0 ? _c : null
                };
                const client = yield client_3.default.findOneAndUpdate({ account: account.id }, { $set: clientField }, { new: true, upsert: true, setDefaultOnInsert: true });
                yield client.save();
                const responseData = yield client.populate('account', ['firt_name', 'last_name']);
                console.log(`response data: ${responseData}`);
                // return response.response({ status: 'ok', data: 'Profile created successfully' }).code(201);
                return response.response({ status: 'ok', data: responseData }).code(201);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(501);
            }
        })
    },
    {
        method: 'GET',
        path: '/',
        options: {
            auth: 'jwt',
            description: 'Get client profile',
            plugins: client_1.getProfileSwagger,
            tags: ['api', 'client'],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`GET api/v1/client/ request from ${request.auth.credentials.email}`);
                const client = yield client_3.default.findOne({ account: request.auth.credentials.accountId });
                if (!client) {
                    console.log('Profile not found!');
                    return response.response({ status: 'err', err: 'Profile not found!' }).code(404);
                }
                const responseData = yield client.populate('account', ['first_name', 'last_name']);
                console.log('request success');
                console.log(`response data : ${responseData}`);
                return response.response({ status: 'ok', data: responseData }).code(200);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(501);
            }
        })
    },
    {
        method: 'DELETE',
        path: '/',
        options: {
            auth: 'jwt',
            description: 'Delete client profile',
            plugins: client_1.deleteProfileSwagger,
            tags: ['api', 'client'],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(`DELETE api/v1/client request from ${request.auth.credentials.email}`);
                const deleteStatus = yield client_3.default.deleteOne({ account: request.auth.credentials.accountId });
                console.log('delete result ----------->', deleteStatus);
                if (deleteStatus.deletedCount)
                    return response.response({ status: 'ok', data: 'Successfuly deleted!' }).code(200);
                else
                    return response.response({ status: 'err', err: "Profile not found!" }).code(404);
            }
            catch (error) {
                return response.response({ status: 'err', err: error }).code(501);
            }
        })
    },
];
//# sourceMappingURL=client.js.map