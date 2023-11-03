"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.ProfileSchema = joi_1.default.object({
    avatar: joi_1.default.string(),
    birthday: joi_1.default.date().required().messages({
        'any.required': 'Please provide birthday',
    }),
    country: joi_1.default.string().required().messages({
        'any.required': 'Please provide country',
    }),
    state: joi_1.default.string().required().messages({
        'any.required': 'Please provide state',
    }),
    city: joi_1.default.string().required().messages({
        'any.required': 'Please provide city',
    }),
    address: joi_1.default.string().required().messages({
        "any.required": "Please provide address.",
    }),
    languages: joi_1.default.array().required().messages({
        "any.required": "Please provide languages",
    }),
    social_media: joi_1.default.object(),
    payment_verify: joi_1.default.boolean(),
});
//# sourceMappingURL=client.js.map