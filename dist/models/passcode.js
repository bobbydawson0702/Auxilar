"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PasscodeSchema = new Schema({
    email: {
        type: String,
    },
    passcode: {
        type: String,
    },
});
const Passcode = mongoose.model('passcode', PasscodeSchema);
exports.default = Passcode;
//# sourceMappingURL=passcode.js.map