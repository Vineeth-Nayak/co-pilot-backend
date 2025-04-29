const mongoose = require("mongoose");

// create a schema for the article model with the following fields
// title, subtitle, articleImage, articleType, description, mediaUrl, category, tags, author, publishDate
const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
    },
    articleImage: {
        type: String,
        required: true,
    },
    articleType: {
        type: String,
        enum: ["text", "audio", "video"],
        default: "text"
    },
    description: {
        type: String,
        required: true,
    },
    mediaUrl: {
        type: String

    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    tags: [
        {
            type: String
        },
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: true,
    },
    publishDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

module.exports = mongoose.model("Article", articleSchema);