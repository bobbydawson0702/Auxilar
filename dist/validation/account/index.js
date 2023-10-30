"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccountPasswordSchema = exports.resetAccountPasswordSchema = exports.forgotAccountPasswordSchemna = exports.changeAccountPasswordSchema = exports.signinAccountSchema = exports.createAccountSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createAccountSchema = joi_1.default.object({
    first_name: joi_1.default.string().required().messages({
        "any.required": "Please provide first name.",
    }),
    last_name: joi_1.default.string().required().messages({
        "any.required": "Please provide first name.",
    }),
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
    password: joi_1.default.string().required().min(6).messages({
        "any.required": "Please provide password.",
        "string.min": "Password must be at least 6 characters.",
    }),
    account_type: joi_1.default.string().required().messages({
        "any.requird": "Please provide account_type",
    }),
});
exports.signinAccountSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
    password: joi_1.default.string().required().min(6).messages({
        "any.required": "Please provide password.",
        "string.min": "Password must be at least 6 characters.",
    }),
});
exports.changeAccountPasswordSchema = joi_1.default.object({
    new_password: joi_1.default.string().required().min(6).messages({
        "any.required": "Please provide new password.",
        "string.min": "New password must be at least 6 characters.",
    }),
});
exports.forgotAccountPasswordSchemna = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
});
exports.resetAccountPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
    passcode: joi_1.default.string().required().messages({
        "any.required": "Please provide new password.",
    }),
});
exports.updateAccountPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
    new_password: joi_1.default.string().required().min(6).messages({
        "any.required": "Please provide new password.",
        "string.min": "New password must be at least 6 characters.",
    }),
});
//# sourceMappingURL=index.js.map