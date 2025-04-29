// import Author model
const Author = require('../models/authorModel.js');

// import mongoose for ObjectId validation
const mongoose = require('mongoose');

// function to get all authors and return them in JSON format
const getAuthors = async (req, res) => {
    try {
        const authors = await Author.find().select('-__v');
        res.json({
            status: 1,
            message: 'success',
            data: { authors }
        });
    } catch (err) {
        console.error('Error fetching authors:', err);
        res.status(500).json({
            status: 0,
            message: 'Server error',
            error: err.message
        });
    }
};


// function to get a single author by ID and return it in JSON format
const getAuthorById = async (req, res) => {
    try {
        // Validate the authorId parameter
        if (!req.params.id) {
            return res.status(400).json({
                status: 0,
                message: 'Author ID is required'
            });
        }
        let author = null;

        // Check if the authorId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            try {
                author = await Author.findOne({ authorId: req.params.id });
            } catch (err) {
                console.error('Error fetching author by authorId:', err);
                return res.status(500).json({
                    status: 0,
                    message: 'Server error',
                    error: err.message
                });
            }
        } else {
            try {
                author = await Author.findById(req.params.id);
            } catch (err) {
                console.error('Error fetching author by ObjectId:', err);
                return res.status(500).json({
                    status: 0,
                    message: 'Server error',
                    error: err.message
                });
            }
        }


        if (!author) {
            return res.status(404).json({
                status: 0,
                message: 'Author not found'
            });
        }

        res.json({
            status: 1,
            message: 'success',
            data: author
        });
    } catch (err) {
        console.error('Error fetching author:', err);
        res.status(500).json({
            status: 0,
            message: 'Server error',
            error: err.message
        });
    }
};

// function to create a new author and return it in JSON format
const createAuthor = async (req, res) => {
    try {
        const { authorName, authorImage, description } = req.body;
        const newAuthor = await Author.create({ authorName, authorImage, description });

        res.status(201).json({
            status: 1,
            message: 'Author created successfully',
            data: newAuthor
        });
    } catch (err) {
        console.error('Error creating author:', err);
        res.status(400).json({
            status: 0,
            message: 'Validation failed',
            error: err.message
        });
    }
}

// function to update an author by ID and return the updated author in JSON format
const updateAuthorById = async (req, res) => {
    try {
        const { authorName, authorImage, description } = req.body;

        let updatedAuthor = null;

        if (mongoose.isValidObjectId(req.params.id)) {
            updatedAuthor = await Author.findByIdAndUpdate(
                req.params.id,
                { authorName, authorImage, description },
                { new: true }
            );
        } else {
            updatedAuthor = await Author.findOneAndUpdate(
                { authorId: req.params.id },
                { authorName, authorImage, description },
                { new: true }
            );
        }

        if (!updatedAuthor) {
            return res.status(404).json({
                status: 0,
                message: 'Author not found'
            });
        }

        res.json({
            status: 1,
            message: 'Author updated successfully',
            data: updatedAuthor
        });
    } catch (err) {
        console.error('Error updating author:', err);
        res.status(400).json({
            status: 0,
            message: 'Validation failed',
            error: err.message
        });
    }
};

//export the functions to be used in routes
module.exports = {
    getAuthors,
    getAuthorById,
    createAuthor,
    updateAuthorById
};