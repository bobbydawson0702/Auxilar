import Joi from 'joi';

export const updateAccountStatusSchema = Joi.object({
  active: Joi.boolean().required().messages({
    "any.required": "Please provide active status"
  })
})