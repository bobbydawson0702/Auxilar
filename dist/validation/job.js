"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.JobSchema = joi_1.default.object({
// title: Joi.string().required().messages({
//   "any.required": "Please provide title.",
// }),
// description: Joi.string().required().messages({
//   "any.required": "Please provide description.",
// }),
// budget_type: Joi.number().required().messages({
//   "any.required": "Please provide budget_type",
// }),
// budget_amount: Joi.number().required().messages({
//   "any.required": "Please provide budget_amount",
// }),
// skill_set: Joi.array<string>().required().messages({
//   "any.required": "Please provide skill_set"
// }),
// job_type: Joi.string().required().messages({
//   "any.required": "Please provdie job_type",
// }),
});
//# sourceMappingURL=job.js.map