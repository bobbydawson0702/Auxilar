const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  chat: {
    sender: {
      type: Schema.Types.ObjectId,
    },
    recevier: {
      type: Schema.Types.ObjectId,
    },
    job: {
      type: Schema.Types.ObjectId,
    },
    proposal: {
      type: Schema.Types.ObjectId,
    },

    messages: [
      {
        sender: {
          type: Schema.Types.ObjectId,
        },
        parent_message_id: {
          type: Schema.Types.ObjectId,
        },
        message_body: {
          type: String,
        },
        create_date: {
          type: Date,
        },
        expire_date: {
          type: Date,
        },
      },
    ],
  },
});

const Conversation = mongoose.model("job", ConversationSchema);
export default Conversation;
