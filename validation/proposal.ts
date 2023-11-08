import Joi from "joi";
import Account from "../models/account";

const milestone = Joi.object().keys({
  step_number: Joi.number().required().messages({
    "any.required": "Please provide step_number",
  }),
  from: Joi.date(),
  to: Joi.date(),
  title: Joi.string().required().messages({
    "any.required": "Pleas provide title",
  }),
  description: Joi.string().required().messages({
    "any.required": "Please provide description",
  }),
  ammount: Joi.number().required().messages({
    "any.required": "Please provide ammount",
  }),
});

export const ProposalSchema = Joi.object({
  cover_letter: Joi.string().required().messages({
    "any.required": "Please provide cover_letter.",
  }),
  attached_file: Joi.string().messages({
    "any.required": "Please provide attached_file.",
  }),
  milestones: Joi.array().items(milestone).required().messages({
    "any.required": "Please provide milestones",
  }),
});

export const updateProposalSchema = Joi.object({
  cover_letter: Joi.string().required().messages({
    "any.required": "Please provide cover_letter.",
  }),
  attached_file: Joi.string().messages({
    "any.required": "Please provide attached_file.",
  }),
  milestones: Joi.array().items(milestone).required().messages({
    "any.required": "Please provdie milestones",
  }),
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
  state: Joi.number().required().messages({
    "any.required": "Please provide state",
  }),
  skill_set: Joi.array<string>().required().messages({
    "any.required": "Please provide skill_set",
  }),
  job_type: Joi.string().required().valid("public", "private").messages({
    "any.required": "Please provdie job_type",
  }),
  invited_expert: Joi.array<Object>(),
});
