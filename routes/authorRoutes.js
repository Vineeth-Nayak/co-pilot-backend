// import author controller
const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');

// GET /api/authors - Get all authors
router.get('/', authorController.getAuthors);

// GET /api/authors/:id - Get author by ID
router.get('/:id', authorController.getAuthorById);

// POST /api/authors - Create a new author
router.post('/', authorController.createAuthor);

// PUT /api/authors/:id - Update an author by ID
router.put('/:id', authorController.updateAuthorById);

module.exports = router;