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
const config_1 = __importDefault(require("../config"));
const account_1 = require("./account");
const expert_1 = require("./profile/expert");
const client_1 = require("./profile/client");
const mentor_1 = require("./profile/mentor");
const job_1 = require("./job");
// const prefix = `/api/${config.apiVersion}`;
const setRoutes = (server) => __awaiter(void 0, void 0, void 0, function* () {
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/account`;
    server.route(account_1.accountRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/expert`;
    server.route(expert_1.expertRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/client`;
    server.route(client_1.clientRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/mentor`;
    server.route(mentor_1.mentorRoute);
    server.realm.modifiers.route.prefix = `/api/${config_1.default.apiVersion}/job`;
    server.route(job_1.jobRoute);
});
exports.default = setRoutes;
//# sourceMappingURL=index.js.map