const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  client_email: {
    type: String,
  },
  client_avatar: {
    type: String,
  },
  expert_email: {
    type: String,
    required: true,
  },
  expert_avatar: {
    type: String,
    required: true,
  },
  mentor_email: {
    type: String,
  },
  mentor_avatar: {
    type: String,
  },
  job: {
    id: {
      type: Schema.Types.ObjectId,
    },
    title: {
      type: String,
    },
  },
  proposal: {
    id: {
      type: Schema.Types.ObjectId,
    },
  },

  messages: [
    {
      sender: {
        type: String,
      },
      message_type: {
        type: String,
      },
      message_body: {
        type: String,
      },
      parent_message_id: {
        type: Schema.Types.ObjectId,
      },
      attached_files: [
        {
          name: {
            type: String,
          },
          file_id: {
            type: Schema.Types.ObjectId,
          },
        },
      ],
      created_date: {
        type: Date,
      },
      expire_date: {
        type: Date,
      },
    },
  ],
});

const Conversation = mongoose.model("conversation", ConversationSchema);
export default Conversation;
