import Joi from "joi";

export const ProfileSchema = Joi.object({
  address: Joi.string().required().messages({
    "any.required": "Please provide address.",
  }),

  country: Joi.string().required().messages({
    "any.required": "Please provide country",
  }),

  state: Joi.string().required().messages({
    "any.required": "Please provide state",
  }),

  city: Joi.string().required().messages({
    "any.required": "Please provide city",
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

  notification_preferences: Joi.array<String>(),

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

export const addPortfolioItemSchema = Joi.object({
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
  address: Joi.string().required().messages({
    "any.required": "Please provde address"
  }),
  post_number: Joi.string().required().messages({
    "any.required": "Please provde post_number"
  }),
  languages: Joi.array<Object>().required().messages({
    "any.required": "Please provde languages"
  }),
  skills: Joi.array<String>().required().messages({
    "any.required": "Please provde skills"
  }),
  majors: Joi.array<String>().required().messages({
    "any.required": "Please provde majors"
  }),
  notification_preferences: Joi.array<String>().required().messages({
    "any.required": "Please provde notification_preferences"
  }),
  reviews: Joi.array<Object>().required().messages({
    "any.required": "Please provde reviews"
  }),
  active_status: Joi.boolean().required().messages({
    "any.required": "Please provde active_status"
  }),
  account_status: Joi.number().required().messages({
    "any.required": "Please provde account_status"
  }),
  profile_links: Joi.array<String>().required().messages({
    "any.required": "Please provde profile_links"
  }),
  linkedin: Joi.string().required().messages({
    "any.required": "Please provde linkedin"
  }),
});
export const updateEducationSchema = Joi.object({
  education: Joi.object().required().messages({
    "any.required": "Please provide education"
  })
});
