"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPostedJobSchema = exports.updateJobSchema = exports.JobSchema = void 0;
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
        "any.required": "Please provide end_date of proposal",
    }),
    // expire_date: Joi.date().required().messages({
    //   "any.required": "Please provide expire_date of proposal",
    // }),
    category: joi_1.default.array().required().messages({
        "any.required": "Please provide category",
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set",
    }),
    job_type: joi_1.default.string().required().valid("public", "private").messages({
        "any.required": "Please provdie job_type",
    }),
    project_duration: joi_1.default.string()
        .required()
        .valid("lessthan1month", "between1and3months", "between3and6months", "morethan6months")
        .messages({
        "any.required": "Please provdie project duration",
    }),
    hours_per_week: joi_1.default.string()
        .required()
        .valid("lessthan10", "between10and20", "between20and30", "morethan30")
        .messages({
        "any.required": "Please provide hours per week",
    }),
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
        "any.required": "Please provide end_date of proposal",
    }),
    expire_date: joi_1.default.date().required().messages({
        "any.required": "Please provide expire_date of proposal",
    }),
    state: joi_1.default.number().required().messages({
        "any.required": "Please provide state",
    }),
    category: joi_1.default.array().required().messages({
        "any.required": "Please provide category",
    }),
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill_set",
    }),
    job_type: joi_1.default.string().required().valid("public", "private").messages({
        "any.required": "Please provdie job_type",
    }),
    project_duration: joi_1.default.string()
        .required()
        .valid("lessthan1month", "between1and3months", "between3and6months", "morethan6months")
        .messages({
        "any.required": "Please provdie project duration",
    }),
    hours_per_week: joi_1.default.string()
        .required()
        .valid("lessthan10", "between10and20", "between20and30", "morethan30")
        .messages({
        "any.required": "Please provide hours per week",
    }),
    invited_expert: joi_1.default.array(),
});
exports.findPostedJobSchema = joi_1.default.object({
    // and
    skill_set: joi_1.default.array().required().messages({
        "any.required": "Please provide skill set",
    }),
    category: joi_1.default.array().required().messages({
        "any.required": "Please provide category",
    }),
    title: joi_1.default.string().required().messages({
        "any.required": "Please provide title",
    }),
    // or
    budget_type: joi_1.default.object({
        hourly: joi_1.default.object({
            ishourly: joi_1.default.boolean().required().messages({
                "any.required": "Please provide ishourly",
            }),
            hourly_range: joi_1.default.array().required().messages({
                "any.required": "Please provide hourly range",
            }),
        }),
        fixed: joi_1.default.object({
            isfixed: joi_1.default.boolean().required().messages({
                "any.required": "Please provide isfixed",
            }),
            fixed_range: joi_1.default.array().required().messages({
                "any.required": "Please provide fixed range",
            }),
        }),
    })
        .required()
        .messages({
        "any.required": "Please provide budget_type",
    }),
    number_of_proposals: joi_1.default.array().required().messages({
        "any.required": "Please provide range of number of proposals",
    }),
    client_info: joi_1.default.object({
        payment_verified: joi_1.default.boolean(),
        payment_unverified: joi_1.default.boolean(),
    }),
    hours_per_week: joi_1.default.array().required().messages({
        "any.required": "Please provide range hours per week",
    }),
    project_duration: joi_1.default.array().required().messages({
        "any.required": "Please provide range of project_duration",
    }),
    jobs_per_page: joi_1.default.number().required().messages({
        "any.required": "Please provide number of jobs per page",
    }),
    page_index: joi_1.default.number().required().messages({
        "any.required": "Please provide page index",
    }),
});
//# sourceMappingURL=job.js.map