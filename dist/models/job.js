"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        required: true,
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
        enum: [
            "lessthan1month",
            "between1and3months",
            "between3and6months",
            "morethan6months",
        ],
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
            expert: {
                id: {
                    type: Schema.Types.ObjectId,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                },
            },
            cover_letter: {
                type: String,
                required: true,
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
            viewed_by_client: {
                type: Number,
                default: 0,
            },
            mentor_check: [
                {
                    mentor: {
                        type: String,
                    },
                    checked: {
                        type: Boolean,
                        default: 0, // 0: not check or not apply mentor, 1: mentor check
                    },
                },
            ],
            proposal_status: {
                type: Number,
                default: 0,
                enum: [0, 1, 2], // 1: visible to client, 0: withdraw(deleted), 2: pending status
            },
            pub_date: {
                type: Date,
                default: Date.now,
            },
            total_amount: {
                type: Number,
                required: true,
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
                    amount: {
                        type: Number,
                        required: true,
                    },
                },
            ],
            chart: [
                {
                    conversation: {
                        sender: {
                            type: Schema.Types.ObjectId
                        },
                        recevier: {
                            type: Schema.Types.ObjectId
                        },
                        messages: [
                            {
                                sender: {
                                    type: Schema.Types.ObjectId
                                },
                                parent_message_id: {
                                    type: Schema.Types.ObjectId
                                },
                                message_body: {
                                    type: String,
                                },
                                create_date: {
                                    type: Date
                                },
                                expire_date: {
                                    type: Date
                                },
                            }
                        ]
                    }
                }
            ]
        },
    ],
});
const Job = mongoose.model("job", JobSchema);
exports.default = Job;
//# sourceMappingURL=job.js.map