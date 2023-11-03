"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.JobSchema = joi_1.default.object({
    title: joi_1.default.string().required().messages({
        "any.required": "Please provide title.",
    }),
    description: joi_1.default.string().required().messages({
        "any.required": "Please provide description.",
    }),
    budget_type: joi_1.default.number().required().messages({
        "any.required": "Please provide budget_type",
    }),
    budget_amount: joi_1.default.number().required().messages({
        "any.required": "Please provide budget_amount",
    }),
    end_date: joi_1.default.date().required().messages({
        'any.required': 'Please provide end_date of proposal',
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set"
    }),
    job_type: joi_1.default.string().required().messages({
        "any.required": "Please provdie job_type",
    }),
    // file: Joi.any().meta({ swaggerType: "file" })
});
//# sourceMappingURL=job.js.map