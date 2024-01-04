"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProposalSchema = exports.ProposalSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const milestone = joi_1.default.object().keys({
    step_number: joi_1.default.number().required().messages({
        "any.required": "Please provide step_number",
    }),
    from: joi_1.default.date(),
    to: joi_1.default.date(),
    // title: Joi.string().required().messages({
    //   "any.required": "Pleas provide title",
    // }),
    description: joi_1.default.string().required().messages({
        "any.required": "Please provide description",
    }),
    amount: joi_1.default.number().required().messages({
        "any.required": "Please provide amount",
    }),
});
const custom = joi_1.default.extend({
    type: "object",
    base: joi_1.default.object(),
    coerce: {
        from: "string",
        method(value, helpers) {
            if (typeof value !== "string" ||
                (value[0] !== "{" && !/^\s*\[/.test(value))) {
                return;
            }
            try {
                return { value: JSON.parse(value) };
            }
            catch (ignoreErr) { }
        },
    },
});
exports.ProposalSchema = joi_1.default.object({
    proposalData: custom.object({
        cover_letter: joi_1.default.string().required().messages({
            "any.required": "Please provide cover_letter.",
        }),
        total_amount: joi_1.default.number().required().messages({
            "any.required": "Please provide total_amount.",
        }),
        mentors: joi_1.default.array().allow(""),
        milestones: joi_1.default.array().items(milestone).required().messages({
            "any.required": "Please provide milestones",
        }),
        proposal_status: joi_1.default.number().allow(null),
    }),
    attached_files: joi_1.default.array()
        .allow(null)
        .allow("")
        .meta({ swaggerType: "file" }),
});
exports.updateProposalSchema = joi_1.default.object({
    proposalData: custom.object({
        cover_letter: joi_1.default.string().required().messages({
            "any.required": "Please provide cover_letter.",
        }),
        total_amount: joi_1.default.number().required().messages({
            "any.required": "Please provide total_amount.",
        }),
        mentors: joi_1.default.array().allow(""),
        milestones: joi_1.default.array().items(milestone).required().messages({
            "any.required": "Please provide milestones",
        }),
        proposal_status: joi_1.default.number().allow(null),
    }),
    attached_files: joi_1.default.array()
        .allow(null)
        .allow("")
        .meta({ swaggerType: "file" }),
});
//# sourceMappingURL=proposal.js.map