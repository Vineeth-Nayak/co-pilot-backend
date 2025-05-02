// import mongoose and article model
const Article = require('../models/articleModel');
const Category = require('../models/categoryModel');
const { default: mongoose } = require('mongoose');

// create a async function to get all articles with filters
/**
 * Retrieves a list of articles based on various query parameters such as page, category, tag, author name, and article type.
 * Supports pagination, filtering, and formatting of the response.
 *
 * @async
 * @function getArticles
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters from the request.
 * @param {number} [req.query.page=1] - The page number for pagination (default is 1).
 * @param {string} [req.query.categoryId] - The category ID (can be a custom string or ObjectId).
 * @param {string} [req.query.tag] - The tag to filter articles by.
 * @param {string} [req.query.authorName] - The author's name to filter articles by (case-insensitive).
 * @param {string} [req.query.articleType] - The type of article to filter by (e.g., "text", "audio", "video").
 * @param {number} [req.query.limit=10] - The number of articles to return per page (default is 10).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response containing the filtered and paginated list of articles.
 *
 * @throws {Error} Returns a 404 status if no articles or category are found.
 * @throws {Error} Returns a 500 status if an internal server error occurs.
 */
const getArticles = async (req, res) => {
    try {
        const { page = 1, categoryId, tag, authorName, articleType } = req.query;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        // Handle categoryId input: can be custom string or ObjectId
        if (categoryId) {
            if (mongoose.Types.ObjectId.isValid(categoryId)) {
                query.category = categoryId;
            } else {
                const categoryDoc = await Category.findOne({ categoryId });
                if (!categoryDoc) {
                    return res.status(404).json({ status: 0, message: 'Category not found' });
                }
                query.category = categoryDoc._id;
            }
        }

        if (tag) query.tags = tag;
        if (articleType) query.articleType = articleType;

        // First, fetch articles with basic filters (except authorName)
        let articlesQuery = Article.find(query)
            .sort({ publishDate: -1 })
            .populate({
                path: 'author',
                match: authorName ? { authorName: new RegExp(`^${authorName}$`, 'i') } : {},
            })
            .populate('category')
            .select('title subtitle articleImage articleType category tags author publishDate')
            .skip(skip)
            .limit(limit);

        let articles = await articlesQuery;

        // Filter out articles with no matching author (if authorName was used)
        if (authorName) {
            articles = articles.filter(article => article.author);
        }

        if (articles.length === 0) {
            return res.status(404).json({ status: 0, message: 'No articles found' });
        }

        const totalArticles = await Article.countDocuments(query);
        const formattedArticles = articles.map(article => ({
            title: article.title,
            hero: article.articleImage,
            categoryId: article.category?.categoryId || null,
            categoryObjectId: article.category?._id || null,
            authorId: article.author?.authorId || null,
            authorObjectId: article.author?._id || null,
            articleObjectId: article._id.toString(),
            articleType: article.articleType === 'text' ? 1 : article.articleType === 'audio' ? 2 : 3,
            tags: article.tags || [],
            publishDate: article.publishDate || null,
        }));

        return res.status(200).json({
            status: 1,
            message: 'success',
            data: {
                articles: formattedArticles,
                categoryId: categoryId || null,
                tag: tag || null,
                authorName: authorName || null,
                page: Number(page),
                totalPages: Math.ceil(totalArticles / limit),
            },
        });

    } catch (error) {
        return res.status(500).json({ status: 0, message: error.message });
    }
};


// create a get route to get a single article by id
/**
 * Retrieves an article by its ID, including its author and category details.
 * 
 * @async
 * @function getArticleById
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters from the request.
 * @param {string} req.params.id - The ID of the article to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the article data if found, 
 * or an error message if not found or if an error occurs.
 * 
 * @throws {Error} Returns a 404 status if the article is not found.
 * Returns a 500 status if a server error occurs.
 */
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('author category');
        if (!article) {
            return res.status(404).json({ status: 0, message: 'Article not found' });
        }
        res.status(200).json({ status: 1, data: article });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};


// create a post route to create a new article
/**
 * Creates a new article in the database.
 *
 * @async
 * @function createArticle
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing article details.
 * @param {string} req.body.title - The title of the article (required).
 * @param {string} [req.body.subtitle] - The subtitle of the article (optional).
 * @param {string} req.body.articleImage - The URL of the article's image (required).
 * @param {string} [req.body.articleType="text"] - The type of the article, can be "text", "audio", or "video" (default is "text").
 * @param {string} [req.body.description] - The description of the article (optional).
 * @param {string} [req.body.mediaUrl] - The URL of the media associated with the article (optional).
 * @param {string} req.body.category - The ID of the category the article belongs to (required).
 * @param {Array<string>} [req.body.tags] - An array of tags associated with the article (optional).
 * @param {string} req.body.author - The ID of the author of the article (required).
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the status and the created article data or an error message.
 * @throws {Error} Returns a 400 status if required fields are missing or invalid, or a 500 status for server errors.
 */
const createArticle = async (req, res) => {
    try {
        //destructure the request body
        const { title, subtitle, articleImage, articleType = "text", description, mediaUrl, category, tags, author } = req.body;

        // check if the required fields are present
        if (!title || !articleImage || !category || !author) {
            return res.status(400).json({ status: 0, message: 'Please provide all required fields' });
        }

        // check if the articleType is valid
        const validArticleTypes = ['text', 'audio', 'video'];
        if (!validArticleTypes.includes(articleType)) {
            return res.status(400).json({ status: 0, message: 'Invalid article type' });
        }
        // check if the category and author are valid ObjectIds
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ status: 0, message: 'Invalid category ID' });
        }

        if (!mongoose.Types.ObjectId.isValid(author)) {
            return res.status(400).json({ status: 0, message: 'Invalid author ID' });
        }

        // create a request body object to create a new article
        const articleData = {
            title,
            subtitle,
            articleImage,
            articleType,
            description,
            mediaUrl,
            category,
            tags,
            author,
        };

        // create a new article instance and save it to the database

        const article = new Article(articleData);
        try {
            await article.save();
            res.status(201).json({ status: 1, data: article });
        } catch (saveError) {
            res.status(500).json({ status: 0, message: 'Error saving article', error: saveError.message });
        }
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// create a put route to update an article by id
/**
 * Updates an existing article in the database.
 *
 * @async
 * @function updateArticle
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the article to update.
 * @param {Object} req.body - The request body containing article data.
 * @param {string} req.body.title - The title of the article (required).
 * @param {string} [req.body.subtitle] - The subtitle of the article (optional).
 * @param {string} req.body.articleImage - The URL of the article's image (required).
 * @param {string} [req.body.articleType="text"] - The type of the article (default is "text").
 * @param {string} [req.body.description] - The description of the article (optional).
 * @param {string} [req.body.mediaUrl] - The URL of any associated media (optional).
 * @param {string} req.body.category - The category of the article (required).
 * @param {Array<string>} [req.body.tags] - The tags associated with the article (optional).
 * @param {string} req.body.author - The author of the article (required).
 * @param {Object} res - The response object.
 * @returns {void} Sends a JSON response with the updated article or an error message.
 * @throws {Error} Returns a 500 status code if an unexpected error occurs.
 */
const updateArticle = async (req, res) => {
    try {
        const articleId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(articleId)) {
            return res.status(400).json({ status: 0, message: 'Invalid article ID' });
        }

        // check if the required fields are present
        const { title, subtitle, articleImage, articleType = "text", description, mediaUrl, category, tags, author } = req.body;

        if (!title || !articleImage || !category || !author) {
            return res.status(400).json({ status: 0, message: 'Please provide all required fields' });
        }

        // create a request body object to update the article
        const articleData = {
            title,
            subtitle,
            articleImage,
            articleType,
            description,
            mediaUrl,
            category,
            tags,
            author,
        };

        // update the article in the database
        const article = await Article.findByIdAndUpdate(articleId, articleData, { new: true });


        if (!article) {
            return res.status(404).json({ status: 0, message: 'Article not found' });
        }
        res.status(200).json({ status: 1, data: article });
    }
    catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
}







// Export the router instance
module.exports = {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle
};