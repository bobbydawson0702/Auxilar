"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.ProfileSchema = joi_1.default.object({
    address: joi_1.default.string().required().messages({
        "any.required": "Please provide address.",
    }),
    post_number: joi_1.default.string().required().messages({
        "any.required": "Please provide post_number.",
    }),
    languages: joi_1.default.array().required().messages({
        "any.required": "Please provide languages",
    }),
    avatar: joi_1.default.string(),
    rating: joi_1.default.string().required().messages({
        "any.required": "Please provide rating.",
    }),
    summary: joi_1.default.string().required().messages({
        "any.requird": "Please provide summary",
    }),
    verified_by: joi_1.default.array(),
    portfolios: joi_1.default.array(),
    skills: joi_1.default.array().required().messages({
        "any.requird": "Please provide skills",
    }),
    majors: joi_1.default.array().required().messages({
        "any.requird": "Please provide majors",
    }),
    // verified_by: Joi.any().meta({ swaggerType: "file" })
});
//# sourceMappingURL=expert.js.map