import Joi from "joi";

export const ProfileSchema = Joi.object({
	avatar: Joi.string(),

	birthday: Joi.date().required().messages({
		'any.required': 'Please provide birthday',
	}),

	country: Joi.string().required().messages({
		'any.required': 'Please provide country',
	}),

	state: Joi.string().required().messages({
		'any.required': 'Please provide state',
	}),

	city: Joi.string().required().messages({
		'any.required': 'Please provide city',
	}),

	address: Joi.string().required().messages({
		"any.required": "Please provide address.",
	}),

	languages: Joi.array<String>().required().messages({
		"any.required": "Please provide languages",
	}),

	social_media: Joi.object(),

	payment_verify: Joi.boolean(),

});