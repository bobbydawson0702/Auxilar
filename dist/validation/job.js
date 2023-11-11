"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
<<<<<<< HEAD
exports.findPostedJobSchema = exports.updateJobSchema = exports.JobSchema = void 0;
=======
exports.updateJobSchema = exports.JobSchema = void 0;
>>>>>>> c0fac13a95db9fa562724f2fd60dbfe3f4b7a9b6
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
<<<<<<< HEAD
        "any.required": "Please provide end_date of proposal",
    }),
    expire_date: joi_1.default.date().required().messages({
        "any.required": "Please provide expire_date of proposal",
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set",
=======
        'any.required': 'Please provide end_date of proposal',
    }),
    expire_date: joi_1.default.date().required().messages({
        'any.required': 'Please provide expire_date of proposal',
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set"
>>>>>>> c0fac13a95db9fa562724f2fd60dbfe3f4b7a9b6
    }),
    job_type: joi_1.default.string().required().valid("public", "private").messages({
        "any.required": "Please provdie job_type",
    }),
<<<<<<< HEAD
    hours_per_week: joi_1.default.string().required().valid("more", "less").messages({
        "any.required": "Please provide hours per week",
    }),
=======
>>>>>>> c0fac13a95db9fa562724f2fd60dbfe3f4b7a9b6
    invited_expert: joi_1.default.array(),
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
<<<<<<< HEAD
        "any.required": "Please provide end_date of proposal",
    }),
    expire_date: joi_1.default.date().required().messages({
        "any.required": "Please provide expire_date of proposal",
    }),
    state: joi_1.default.number().required().messages({
        "any.required": "Please provide state",
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set",
=======
        'any.required': 'Please provide end_date of proposal',
    }),
    expire_date: joi_1.default.date().required().messages({
        'any.required': 'Please provide expire_date of proposal',
    }),
    state: joi_1.default.number().required().messages({
        "any.required": "Please provide state"
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set"
>>>>>>> c0fac13a95db9fa562724f2fd60dbfe3f4b7a9b6
    }),
    job_type: joi_1.default.string().required().valid("public", "private").messages({
        "any.required": "Please provdie job_type",
    }),
<<<<<<< HEAD
    hours_per_week: joi_1.default.string().required().valid("more", "less").messages({
        "any.required": "Please provide hours per week",
    }),
    invited_expert: joi_1.default.array(),
});
exports.findPostedJobSchema = joi_1.default.object({
    // and
    skill_set: joi_1.default.array(),
    title: joi_1.default.string(),
    // or
    budget_type: joi_1.default.object({
        hourly: joi_1.default.object({
            min_value: joi_1.default.number(),
            max_value: joi_1.default.number(),
        }),
        fixed_budget: joi_1.default.object({
            lessthan100: joi_1.default.boolean(),
            between100and500: joi_1.default.boolean(),
            between500and1000: joi_1.default.boolean(),
            between1000and5000: joi_1.default.boolean(),
            morethan5000: joi_1.default.boolean(),
            min_max: joi_1.default.object({
                min_value: joi_1.default.number().required().messages({
                    "any.required": "Please provide min value",
                }),
                max_value: joi_1.default.number().required().messages({
                    "any.required": "Please provide max value",
                }),
            }),
        }),
    }),
    number_of_proposals: joi_1.default.object({
        lessthan5: joi_1.default.boolean(),
        between5and10: joi_1.default.boolean(),
        between10and15: joi_1.default.boolean(),
        between15and20: joi_1.default.boolean(),
        between20and50: joi_1.default.boolean(),
    }),
    client_info: joi_1.default.object({
        payment_verified: joi_1.default.boolean(),
        payment_unverified: joi_1.default.boolean(),
    }),
    hours_per_week: joi_1.default.object({
        lessthan30: joi_1.default.boolean(),
        morethan30: joi_1.default.boolean(),
    }),
    jobs_per_page: joi_1.default.number().required().messages({
        "any.required": "Please provide number of jobs per page",
    }),
    page_index: joi_1.default.number().required().messages({
        "any.required": "Please provide page index",
    }),
});
=======
    invited_expert: joi_1.default.array(),
});
>>>>>>> c0fac13a95db9fa562724f2fd60dbfe3f4b7a9b6
//# sourceMappingURL=job.js.map