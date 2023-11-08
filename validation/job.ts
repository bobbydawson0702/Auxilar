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
    'any.required': 'Please provide end_date of proposal',
  }),
  skill_set: Joi.array<string>().required().messages({
    "any.required": "Please provide skill_set"
  }),
  job_type: Joi.string().required().valid("public", "private").messages({
    "any.required": "Please provdie job_type",
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
    'any.required': 'Please provide end_date of proposal',
  }),
  state: Joi.number().required().messages({
    "any.required": "Please provide state"
  }),
  skill_set: Joi.array<string>().required().messages({
    "any.required": "Please provide skill_set"
  }),
  job_type: Joi.string().required().valid("public", "private").messages({
    "any.required": "Please provdie job_type",
  }),
  invited_expert: Joi.array<Object>(),
});