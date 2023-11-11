const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: "client",
  },
  client_email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budget_type: {
    type: Number,
    required: true,
    enum: [0, 1],
    default: 0,
  },
  budget_amount: {
    type: Number,
    required: true,
  },
  pub_date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  end_date: {
    type: Date,
    // default: Date.now,
    required: true,
  },
  expire_date: {
    type: Date,
    // default: Date.now
  },
  state: {
    type: Number,
    default: 0,
  },

  category: {
    type: [String],
    required: true
  },

  skill_set: {
    type: [String],
    required: true,
  },
  job_type: {
    type: String,
    required: true,
    enum: ["public", "private"],
    default: "public",
  },
  hours_per_week: {
    type: String,
    required: true,
    enum: ["lessthan10", "between10and20", "between20and30", "morethan30"],
    default: "morethan30",
  },
  
  project_duration: {
    type: String,
    required: true,
    enum: ["lessthan1month", "between1and3months", "between3and6months", "morethan6months"],
    default: "morethan6months",
  },

  invited_expert: [
    {
      first_name: {
        type: String,
      },
      last_name: {
        type: String,
      },
      email: {
        type: String,
      },
      mentors: [
        {
          mentor: {
            first_name: {
              type: String,
            },
            last_name: {
              type: String,
            },
            email: {
              type: String,
            },
          },
        },
      ],
    },
  ],

  proposals: [
    {
      expert_email: {
        type: String,
        required: true,
      },
      cover_letter: {
        type: String,
        required: true,
      },
      attached_file: {
        type: String,
      },
      viewed_by_client: {
        type: Number,
        default: 0,
      },
      proposal_status: {
        type: Number,
        default: 0,
      },
      pub_date: {
        type: Date,
        default: Date.now,
      },
      milestones: [
        {
          step_number: {
            type: Number,
            required: true,
          },
          from: {
            type: Date,
            default: Date.now,
          },
          to: {
            type: Date,
            default: Date.now,
          },
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          ammount: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  ],
});

const Job = mongoose.model("job", JobSchema);
export default Job;
