// import mongoose
const mongoose = require('mongoose');

// create a schema for the Author model
const authorSchema = new mongoose.Schema({
    authorId: {
        type: String,
        required: true,
        unique: true,
        default: () => Math.random().toString(36).slice(2, 10)
    },
    authorName: {
        type: String,
        required: true,
        trim: true
    },
    authorImage: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model('Author', authorSchema);