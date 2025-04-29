// This file defines the routes for the article-related API endpoints.
// It includes routes for getting all articles with filters and getting a single article by ID.
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// GET /api/articles - Get all articles with filters
router.get('/', articleController.getArticles);

// GET /api/articles/:id - Get single article
router.get('/:id', articleController.getArticleById);

// create a new article
router.post('/', articleController.createArticle);

// update an article    
router.put('/:id', articleController.updateArticle);

module.exports = router;