"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const JobSchema = new Schema({
    client_email: {
        type: String,
        required: true
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
        default: 0
    },
    budget_amount: {
        type: Number,
        required: true,
    },
    pub_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date,
        default: Date.now
    },
    expire_date: {
        type: Date,
        default: Date.now
    },
    state: {
        type: Number,
        default: 0
    },
    skill_set: [
        {
            skill: {
                type: String,
                required: true,
            }
        }
    ],
    job_type: {
        type: String,
        required: true,
        enum: ['public', 'private'],
        default: 'public'
    },
    proposals: [
        {
            cover_letter: {
                type: String,
                required: true
            },
            attached_files: {
                type: String,
            },
            viewed_by_client: {
                type: Number,
                default: 0
            },
            proposal_status: {
                type: Number,
                default: 0
            },
            expert_mail: {
                type: String,
                required: true,
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
                    amount: {
                        type: Number,
                        required: true,
                    }
                }
            ]
        }
    ]
});
const Job = mongoose.model('job', JobSchema);
exports.default = Job;
//# sourceMappingURL=job.js.map