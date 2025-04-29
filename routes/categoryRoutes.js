const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categories - Get all categories
router.get('/', categoryController.getCategories);

// POST /api/categories - Create new category (for CMS)
router.post('/', categoryController.createCategory);

// GET /api/categories/:id - Get category by ID (for CMS)
router.get('/:id', categoryController.getCategoryById);

// PUT /api/categories/:id - Update category by ID (for CMS)
router.put('/:id', categoryController.updateCategoryById);

module.exports = router;