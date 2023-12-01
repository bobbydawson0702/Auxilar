import Joi from "joi";

export const ConversationSchema = Joi.object({
  client_email: Joi.string().allow(null).allow(""),
  expert_email: Joi.string().required().messages({
    "any.required": "Please provide expert id",
  }),
  mentor_email: Joi.string().allow(null).allow(""),
  job: Joi.object({
    id: Joi.string().required().messages({
      "any.required": "Please provide job id",
    }),
    title: Joi.string().required().messages({
      "any.required": "Please provide job title",
    }),
  }).allow(null),
  proposal: Joi.object({
    id: Joi.string().required().messages({
      "any.required": "Please provide proposal id",
    }),
  }).allow(null),
});

const custom = Joi.extend({
  type: "object",
  base: Joi.object(),
  coerce: {
    from: "string",
    method(value, helpers) {
      if (
        typeof value !== "string" ||
        (value[0] !== "{" && !/^\s*\[/.test(value))
      ) {
        return;
      }

      try {
        return { value: JSON.parse(value) };
      } catch (ignoreErr) {}
    },
  },
});

export const putMessageToConversationSchema = Joi.object({
  messageData: custom
    .object({
      from: Joi.string().required().messages({
        "any.required": "Please provide sender email.",
      }),
      to: Joi.string().required().messages({
        "any.required": "Please provide receiver email.",
      }),
      message_type: Joi.string().required().messages({
        "any.required": "Please provide message_type",
      }),
      message_body: Joi.string().required().messages({
        "any.required": "Please provide message_body",
      }),
      parent_message_id: Joi.string().allow(null).allow(""),
      job: Joi.object({
        id: Joi.string().required().messages({
          "any.required": "Please provide job id",
        }),
        title: Joi.string().required().messages({
          "any.required": "Please provide job title",
        }),
      }).allow(null),
    })
    .required()
    .messages({
      "any.required": "Please provide message data",
    }),
  attached_files: Joi.array()
    .allow(null)
    .allow("")
    .meta({ swaggerType: "file" }),
});

export const updateMessageSchema = Joi.object({
  messageData: custom
    .object({
      from: Joi.string().required().messages({
        "any.required": "Please provide sender email.",
      }),
      to: Joi.string().required().messages({
        "any.required": "Please provide receiver email.",
      }),
      message_type: Joi.string().required().messages({
        "any.required": "Please provide message_type",
      }),
      message_body: Joi.string().required().messages({
        "any.required": "Please provide message_body",
      }),
      parent_message_id: Joi.string().allow(null).allow(""),
      job: Joi.object({
        id: Joi.string().required().messages({
          "any.required": "Please provide job id",
        }),
        title: Joi.string().required().messages({
          "any.required": "Please provide job title",
        }),
      }).allow(null),
    })
    .required()
    .messages({
      "any.required": "Please provide message data",
    }),
  attached_files: Joi.array()
    .allow(null)
    .allow("")
    .meta({ swaggerType: "file" }),
});
