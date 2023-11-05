"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEducationSchema = exports.updatePersonDetailSchema = exports.updateResumeSchema = exports.updateVerifierSchema = exports.addPortfolioItemSchema = exports.updatePortfolioItemSchema = exports.updatePortfolioSchema = exports.updateSummarySchema = exports.updateBaseInfoSchema = exports.ProfileSchema = void 0;
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
    hourly_rate: joi_1.default.string().required().messages({
        "any.required": "Please provide hourly_rate.",
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
    resume: joi_1.default.string(),
    profile_links: joi_1.default.array(),
    linkedin: joi_1.default.string(),
    education: joi_1.default.object().required().messages({
        "any.required": "Please provide education"
    })
});
exports.updateBaseInfoSchema = joi_1.default.object({
    avatar: joi_1.default.string().required().messages({
        "any.required": "Please provie avatar",
    }),
    hourly_rate: joi_1.default.string().required().messages({
        "any.required": "Please provide hourly_rate.",
    }),
});
exports.updateSummarySchema = joi_1.default.object({
    summary: joi_1.default.string().required().messages({
        "any.requird": "Please provide summary",
    }),
});
exports.updatePortfolioSchema = joi_1.default.object({
    portfolios: joi_1.default.array().required().messages({
        "any.requird": "Please provide portfolio",
    }),
});
exports.updatePortfolioItemSchema = joi_1.default.object({
    content: joi_1.default.string().required().messages({
        "any.required": "Please provide content",
    }),
    text: joi_1.default.string().required().messages({
        "any.required": "Please provide text",
    }),
});
exports.addPortfolioItemSchema = joi_1.default.object({
    content: joi_1.default.string().required().messages({
        "any.required": "Please provide content",
    }),
    text: joi_1.default.string().required().messages({
        "any.required": "Please provide text",
    }),
});
exports.updateVerifierSchema = joi_1.default.object({
    verified_by: joi_1.default.array().required().messages({
        "any.requird": "Please provide verifier",
    }),
});
exports.updateResumeSchema = joi_1.default.object({
    resume: joi_1.default.string().required().messages({
        "any.requird": "Please provide resume",
    }),
});
exports.updatePersonDetailSchema = joi_1.default.object({
    address: joi_1.default.string(),
    post_number: joi_1.default.string(),
    languages: joi_1.default.array(),
    skills: joi_1.default.array(),
    majors: joi_1.default.array(),
    reviews: joi_1.default.array(),
    active_status: joi_1.default.boolean(),
    account_status: joi_1.default.number(),
    profile_links: joi_1.default.array(),
    linkedin: joi_1.default.string(),
});
exports.updateEducationSchema = joi_1.default.object({
    education: joi_1.default.object().required().messages({
        "any.required": "Please provide education"
    })
});
//# sourceMappingURL=expert.js.map