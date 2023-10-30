import Joi from "joi";

export const ProfileSchema = Joi.object({
  address: Joi.string().required().messages({
    "any.required": "Please provide address.",
  }),
  post_number: Joi.string().required().messages({
    "any.required": "Please provide post_number.",
  }),
  languages: Joi.array<String>().required().messages({
    "any.required": "Please provide languages",
  }),
  avatar: Joi.string(),
  rating: Joi.string().required().messages({
    "any.required": "Please provide rating.",
  }),
  summary: Joi.string().required().messages({
    "any.requird": "Please provide summary",
  }),
  verified_by: Joi.array<object>(),
  portfolios: Joi.array<object>(),
  skills: Joi.array<String>().required().messages({
    "any.requird": "Please provide skills",
  }),
  majors: Joi.array<String>().required().messages({
    
    "any.requird": "Please provide majors",
  }),
  // verified_by: Joi.any().meta({ swaggerType: "file" })
});