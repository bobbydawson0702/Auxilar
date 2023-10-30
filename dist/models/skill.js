"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SkillSchema = new Schema({
    name: {
        type: String,
    },
});
const Skill = mongoose.model('skill', SkillSchema);
exports.default = Skill;
//# sourceMappingURL=skill.js.map