"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentInfoSchema = exports.updateSocialMediaSchema = exports.updatePersonalInfoSchema = exports.updateAvatarSchema = exports.updateSummarySchema = exports.ProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.ProfileSchema = joi_1.default.object({
    avatar: joi_1.default.string(),
    birthday: joi_1.default.date().required().messages({
        "any.required": "Please provide birthday",
    }),
    country: joi_1.default.string().required().messages({
        "any.required": "Please provide country",
    }),
    state: joi_1.default.string().required().messages({
        "any.required": "Please provide state",
    }),
    city: joi_1.default.string().required().messages({
        "any.required": "Please provide city",
    }),
    address: joi_1.default.string().required().messages({
        "any.required": "Please provide address.",
    }),
    languages: joi_1.default.array().required().messages({
        "any.required": "Please provide languages",
    }),
    summary: joi_1.default.string().required().messages({
        "any.required": "Please provide summary",
    }),
    social_media: joi_1.default.object(),
    payment_verify: joi_1.default.boolean(),
});
exports.updateSummarySchema = joi_1.default.object({
    summary: joi_1.default.string().required().messages({
        "any.required": "Please provide summary",
    }),
});
exports.updateAvatarSchema = joi_1.default.object({
    avatar: joi_1.default.string().required().messages({
        "any.required": "Please provide avatar",
    }),
});
exports.updatePersonalInfoSchema = joi_1.default.object({
    country: joi_1.default.string().required().messages({
        "any.required": "Please provide country",
    }),
    state: joi_1.default.string().required().messages({
        "any.required": "Please provide state",
    }),
    city: joi_1.default.string().required().messages({
        "any.required": "Please provide city",
    }),
    address: joi_1.default.string().required().messages({
        "any.required": "Please provide address",
    }),
    languages: joi_1.default.array().required().messages({
        "any.required": "Please provide languages",
    }),
});
exports.updateSocialMediaSchema = joi_1.default.object({
    social_media: joi_1.default.object().required().messages({
        "any.required": "Please provide social media",
    }),
});
exports.updatePaymentInfoSchema = joi_1.default.object({
    payment_info: joi_1.default.string().required().messages({
        "any.required": "Please provide payment information",
    }),
});
//# sourceMappingURL=client.js.map