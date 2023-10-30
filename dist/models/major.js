"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MajorSchema = new Schema({
    name: {
        type: String,
    },
});
const Major = mongoose.model('major', MajorSchema);
exports.default = Major;
//# sourceMappingURL=major.js.map