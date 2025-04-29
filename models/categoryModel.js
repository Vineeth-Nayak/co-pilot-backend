// import mongoose
const mongoose = require("mongoose");

// create a schema for the category model with the following fields
// categoryId, categoryName

const categorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
        unique: true,
        // Generate a unique id for the categoryId field
        default: function () {
            return `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        },
    },
    categoryName: {
        type: String,
        required: true,
        trim: true,
    },
}, { timestamps: true });

// index the categoryName field for better search performance
categorySchema.index({ categoryName: 1 }, { unique: true });

// export the model
module.exports = mongoose.model("Category", categorySchema);