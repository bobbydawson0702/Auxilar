
const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const MentorSchema = new Schema({
  account: {
    type: Schema.Types.ObjectId,
    ref: 'account'
  },

  email: {
    type: String,
  },

  avatar: {
    type: String,
  },

  birthday: {
    type: Date,
    required: true,
  },

  country: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true
  },

  languages: [
    {
      language: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        enum: ["Basic", "Conversational", "Fluent", "Native"],
        default: "Basic",
        required: true,
      }
    }
  ],

  ongoing_project: [
    {
      project: {
        type: Schema.Types.ObjectId
      }
    }
  ],

  reviews: [
    {
      reviewer: {
        type: String,
      },
      reviewe: {
        type: String,
      },
      rate: {
        type: Number,
      }
    }
  ],

  social_media: {
    twitter: {
      type: String,
    },
    youtube: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },

  account_status: {
    type: Number,
    default: 0
  },

  payment_verify: {
    type: Boolean,
    default: false,
  },

  professional_background: {
    type: String,
  }

});

const Mentor = mongoose.model('mentor', MentorSchema);
export default Mentor;
