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

  hourly_rate: Joi.string().required().messages({
    "any.required": "Please provide hourly_rate.",
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

  resume: Joi.string(),

  profile_links: Joi.array<String>(),

  linkedin: Joi.string(),

  education: Joi.object().required().messages({
    "any.required": "Please provide education"
  })
});

export const updateBaseInfoSchema = Joi.object({
  avatar: Joi.string().required().messages({
    "any.required": "Please provie avatar",
  }),

  hourly_rate: Joi.string().required().messages({
    "any.required": "Please provide hourly_rate.",
  }),
});

export const updateSummarySchema = Joi.object({
  summary: Joi.string().required().messages({
    "any.requird": "Please provide summary",
  }),
});

export const updatePortfolioSchema = Joi.object({
  portfolios: Joi.array<Object>().required().messages({
    "any.requird": "Please provide portfolio",
  }),
});

export const updatePortfolioItemSchema = Joi.object({
  content: Joi.string().required().messages({
    "any.required": "Please provide content",
  }),
  text: Joi.string().required().messages({
    "any.required": "Please provide text",
  }),
});

export const updateVerifierSchema = Joi.object({
  verified_by: Joi.array<Object>().required().messages({
    "any.requird": "Please provide verifier",
  }),
});

export const updateResumeSchema = Joi.object({
  resume: Joi.string().required().messages({
    "any.requird": "Please provide resume",
  }),
});
export const updatePersonDetailSchema = Joi.object({
  address: Joi.string(),
  post_number: Joi.string(),
  languages: Joi.array<Object>(),
  skills: Joi.array<String>(),
  majors: Joi.array<String>(),
  reviews: Joi.array<Object>(),
  active_status: Joi.boolean(),
  account_status: Joi.number(),
  profile_links: Joi.array<String>(),
  linkedin: Joi.string(),
});
export const updateEducationSchema = Joi.object({
  education: Joi.object().required().messages({
    "any.required": "Please provide education"
  })
});
