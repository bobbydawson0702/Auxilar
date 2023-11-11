"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const CategorySchema = new Schema({
    name: {
        type: String,
    },
});
const Category = mongoose.model('category', CategorySchema);
exports.default = Category;
//# sourceMappingURL=category.js.map