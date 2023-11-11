"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJobSchema = exports.updateProposalSchema = exports.ProposalSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const milestone = joi_1.default.object().keys({
    step_number: joi_1.default.number().required().messages({
        "any.required": "Please provide step_number",
    }),
    from: joi_1.default.date(),
    to: joi_1.default.date(),
    title: joi_1.default.string().required().messages({
        "any.required": "Pleas provide title",
    }),
    description: joi_1.default.string().required().messages({
        "any.required": "Please provide description",
    }),
    ammount: joi_1.default.number().required().messages({
        "any.required": "Please provide ammount",
    }),
});
exports.ProposalSchema = joi_1.default.object({
    cover_letter: joi_1.default.string().required().messages({
        "any.required": "Please provide cover_letter.",
    }),
    attached_file: joi_1.default.string().messages({
        "any.required": "Please provide attached_file.",
    }),
    milestones: joi_1.default.array().items(milestone).required().messages({
        "any.required": "Please provide milestones",
    }),
});
exports.updateProposalSchema = joi_1.default.object({
    cover_letter: joi_1.default.string().required().messages({
        "any.required": "Please provide cover_letter.",
    }),
    attached_file: joi_1.default.string().messages({
        "any.required": "Please provide attached_file.",
    }),
    milestones: joi_1.default.array().items(milestone).required().messages({
        "any.required": "Please provdie milestones",
    }),
});
exports.updateJobSchema = joi_1.default.object({
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
        "any.required": "Please provide end_date of proposal",
    }),
    state: joi_1.default.number().required().messages({
        "any.required": "Please provide state",
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set",
    }),
    job_type: joi_1.default.string().required().valid("public", "private").messages({
        "any.required": "Please provdie job_type",
    }),
    invited_expert: joi_1.default.array(),
});
//# sourceMappingURL=proposal.js.map