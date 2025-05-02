// import Author model
const Author = require('../models/authorModel.js');

// import mongoose for ObjectId validation
const mongoose = require('mongoose');

/**
 * Retrieves all authors from the database.
 *
 * @async
 * @function getAuthors
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the list of authors or an error message.
 * @throws {Error} Returns a 500 status if a server error occurs.
 */
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

/**
 * Retrieves a single author by ID from the database.
 *
 * @async
 * @function getAuthorById
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the author to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the author data or an error message.
 * @throws {Error} Returns a 400 status if the ID is invalid, a 404 status if the author is not found, or a 500 status for server errors.
 */
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

/**
 * Creates a new author in the database.
 *
 * @async
 * @function createAuthor
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing author details.
 * @param {string} req.body.authorName - The name of the author.
 * @param {string} req.body.authorImage - The URL of the author's image.
 * @param {string} [req.body.description] - A description of the author (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the created author data or an error message.
 * @throws {Error} Returns a 400 status if validation fails, or a 500 status for server errors.
 */
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

/**
 * Updates an existing author by ID in the database.
 *
 * @async
 * @function updateAuthorById
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the author to update.
 * @param {Object} req.body - The body of the request containing updated author details.
 * @param {string} [req.body.authorName] - The updated name of the author (optional).
 * @param {string} [req.body.authorImage] - The updated URL of the author's image (optional).
 * @param {string} [req.body.description] - The updated description of the author (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the updated author data or an error message.
 * @throws {Error} Returns a 404 status if the author is not found, a 400 status if validation fails, or a 500 status for server errors.
 */
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