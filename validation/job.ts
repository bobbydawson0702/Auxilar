import Joi from "joi";
import Account from "../models/account";

export const JobSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Please provide title.",
  }),

  description: Joi.string().required().messages({
    "any.required": "Please provide description.",
  }),
  budget_type: Joi.number().required().messages({
    "any.required": "Please provide budget_type",
  }),
  budget_amount: Joi.number().required().messages({
    "any.required": "Please provide budget_amount",
  }),
  end_date: Joi.date().required().messages({
    "any.required": "Please provide end_date of proposal",
  }),
  expire_date: Joi.date().required().messages({
    "any.required": "Please provide expire_date of proposal",
  }),

  category: Joi.array<string>().required().messages({
    "any.required": "Please provide category",
  }),

  skill_set: Joi.array<string>().required().messages({
    "any.required": "Please provide skill_set",
  }),

  job_type: Joi.string().required().valid("public", "private").messages({
    "any.required": "Please provdie job_type",
  }),
  project_duration: Joi.string().required().valid("lessthan1month", "between1and3months", "between3and6months", "morethan6months").messages({
    "any.required": "Please provdie project duration",
  }),
  hours_per_week: Joi.string().required().valid("lessthan10", "between10and20", "between20and30", "morethan30").messages({
    "any.required": "Please provide hours per week",
  }),
  invited_expert: Joi.array<Object>(),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Please provide title.",
  }),
  description: Joi.string().required().messages({
    "any.required": "Please provide description.",
  }),
  budget_type: Joi.number().required().messages({
    "any.required": "Please provide budget_type",
  }),
  budget_amount: Joi.number().required().messages({
    "any.required": "Please provide budget_amount",
  }),
  end_date: Joi.date().required().messages({
    "any.required": "Please provide end_date of proposal",
  }),
  expire_date: Joi.date().required().messages({
    "any.required": "Please provide expire_date of proposal",
  }),
  state: Joi.number().required().messages({
    "any.required": "Please provide state",
  }),
  category: Joi.array<string>().required().messages({
    "any.required": "Please provide category",
  }),

  skill_set: Joi.array<string>().required().messages({
    "any.required": "Please provide skill_set",
  }),

  job_type: Joi.string().required().valid("public", "private").messages({
    "any.required": "Please provdie job_type",
  }),
  project_duration: Joi.string().required().valid("lessthan1month", "between1and3months", "between3and6months", "morethan6months").messages({
    "any.required": "Please provdie project duration",
  }),
  hours_per_week: Joi.string().required().valid("lessthan10", "between10and20", "between20and30", "morethan30").messages({
    "any.required": "Please provide hours per week",
  }),
  invited_expert: Joi.array<Object>(),
});

export const findPostedJobSchema = Joi.object({
  // and
  skill_set: Joi.array<String>(),
  category: Joi.array<String>(),
  title: Joi.string(),

  // or
  budget_type: Joi.object({
    hourly: Joi.object({
      min_value: Joi.number(),
      max_value: Joi.number(),
    }),
    fixed_budget: Joi.object({
      lessthan100: Joi.boolean(),
      between100and500: Joi.boolean(),
      between500and1000: Joi.boolean(),
      between1000and5000: Joi.boolean(),
      morethan5000: Joi.boolean(),
      min_max: Joi.object({
        min_value: Joi.number().required().messages({
          "any.required": "Please provide min value",
        }),
        max_value: Joi.number().required().messages({
          "any.required": "Please provide max value",
        }),
      }),
    }),
  }),

  number_of_proposals: Joi.object({
    lessthan5: Joi.boolean(),
    between5and10: Joi.boolean(),
    between10and15: Joi.boolean(),
    between15and20: Joi.boolean(),
    between20and50: Joi.boolean(),
  }),

  client_info: Joi.object({
    payment_verified: Joi.boolean(),
    payment_unverified: Joi.boolean(),
  }),

  hours_per_week: Joi.object({
    lessthan10: Joi.boolean(),
    between10and20: Joi.boolean(),
    between20and30: Joi.boolean(),
    morethan30: Joi.boolean(),
  }),

  project_duration: Joi.object({
    lessthan1month: Joi.boolean(),
    between1and3months: Joi.boolean(),
    between3and6months: Joi.boolean(),
    morethan6months: Joi.boolean(),
  }),

  jobs_per_page: Joi.number().required().messages({
    "any.required": "Please provide number of jobs per page",
  }),
  page_index: Joi.number().required().messages({
    "any.required": "Please provide page index",
  }),
});
