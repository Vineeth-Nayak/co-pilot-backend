// import category model
const { isValidObjectId } = require('mongoose');
const Category = require('../models/categoryModel');

/**
 * Retrieves all categories from the database.
 *
 * @async
 * @function getCategories
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the list of categories or an error message.
 * @throws {Error} Returns a 500 status if a server error occurs.
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().select('-__v -createdAt -updatedAt');
        res.json({
            status: 1,
            message: 'success',
            data: { categories }
        });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({
            status: 0,
            message: 'Server error',
            error: err.message
        });
    }
};

/**
 * Retrieves a single category by ID from the database.
 *
 * @async
 * @function getCategoryById
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the category to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the category data or an error message.
 * @throws {Error} Returns a 404 status if the category is not found, or a 500 status for server errors.
 */
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        let category = null;

        // If id starts with 'cat-', find by categoryId
        if (id.startsWith('cat-')) {
            category = await Category.findOne({ categoryId: id }).select('-__v -createdAt -updatedAt');
        } else if (isValidObjectId(id)) {
            // Else if it's a valid MongoDB ObjectId, find by _id
            category = await Category.findById(id).select('-__v -createdAt -updatedAt');
        }

        if (!category) {
            return res.status(404).json({
                status: 0,
                message: 'Category not found',
            });
        }

        return res.json({
            status: 1,
            message: 'Success',
            data: category,
        });
    } catch (err) {
        console.error('Error fetching category:', err);
        return res.status(500).json({
            status: 0,
            message: 'Server error',
            error: err.message,
        });
    }
};

/**
 * Creates a new category in the database.
 *
 * @async
 * @function createCategory
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing category details.
 * @param {string} req.body.categoryName - The name of the category.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the created category data or an error message.
 * @throws {Error} Returns a 400 status if validation fails, or a 500 status for server errors.
 */
const createCategory = async (req, res) => {
    try {
        const { categoryName } = req.body;
        const newCategory = await Category.create({ categoryName });

        res.status(201).json({
            status: 1,
            message: 'Category created successfully',
            data: newCategory
        });
    } catch (err) {
        console.error('Error creating category:', err);
        res.status(400).json({
            status: 0,
            message: 'Validation failed',
            error: err.message
        });
    }
};

/**
 * Updates an existing category by ID in the database.
 *
 * @async
 * @function updateCategoryById
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the category to update.
 * @param {Object} req.body - The body of the request containing updated category details.
 * @param {string} [req.body.categoryName] - The updated name of the category (optional).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the updated category data or an error message.
 * @throws {Error} Returns a 404 status if the category is not found, a 400 status if validation fails, or a 500 status for server errors.
 */
const updateCategoryById = async (req, res) => {

    try {
        const { id } = req.params;
        const { categoryName } = req.body;

        let updatedCategory = null;

        // If id starts with 'cat-', update by categoryId
        if (id.startsWith('cat-')) {
            updatedCategory = await Category.findOneAndUpdate(
                { categoryId: id },
                { categoryName },
                { new: true, runValidators: true }
            ).select('-__v -createdAt -updatedAt');
        } else if (isValidObjectId(id)) {
            // Else if it's a valid MongoDB ObjectId, update by _id
            updatedCategory = await Category.findByIdAndUpdate(
                id,
                { categoryName },
                { new: true, runValidators: true }
            ).select('-__v -createdAt -updatedAt');
        }

        if (!updatedCategory) {
            return res.status(404).json({
                status: 0,
                message: 'Category not found',
            });
        }

        return res.json({
            status: 1,
            message: 'Category updated successfully',
            data: updatedCategory,
        });
    } catch (err) {
        console.error('Error updating category:', err);
        return res.status(400).json({
            status: 0,
            message: 'Validation failed',
            error: err.message,
        });
    }
}

// exporting the functions to be used in routes
module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategoryById
};