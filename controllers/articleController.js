// import mongoose and article model
const Article = require('../models/articleModel');
const { default: mongoose } = require('mongoose');

// create a async function to get all articles with filters
const getArticles = async (req, res) => {
    try {
        const { page = 1, categoryId, tag, authorName, articleType } = req.query;
        const limit = req.query.limit || 10; // Default limit is 10
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        let query = {};

        if (categoryId) query.category = categoryId;
        if (tag) query.tags = tag;
        if (authorName) query['author.authorName'] = authorName;
        if (articleType) query.articleType = articleType;

        // Create a filters object to hold the filter criteria
        const filters = {
            category: categoryId,
            tags: tag,
            'author.authorName': authorName,
            articleType: articleType,
        };


        // Apply filters
        for (const key in filters) {
            if (filters[key]) {
                query[key] = filters[key];
            }
        }

        // Sort and paginate
        const articles = await Article.find(query)
            .sort({ publishDate: -1 }) // Sort by publishDate in descending order
            .populate('author category') // Populate author and category fields
            .select('title subtitle articleImage articleType category tags author publishDate')
            .skip(skip)
            .limit(Number(limit));

        // error handling for empty articles
        if (articles.length === 0) {
            return res.status(404).json({ status: 0, message: 'No articles found' });
        }


        // Count total articles for pagination  
        const totalArticles = await Article.countDocuments(query);
        if (totalArticles === 0) {
            return res.status(404).json({ status: 0, message: 'No articles found' });
        }

        // Convert articles to the required format
        const formattedArticles = articles.map(article => ({
            title: article.title,
            hero: article.articleImage,
            categoryId: article.category?.categoryId || null,
            categoryObjectId: article.category?._id || null,
            authorId: article.author?.authorId || null,
            authorObjectId: article.author?._id || null,
            articleObjectId: article?._id?.toString(),
            articleType: article.articleType === 'text' ? 1 : article.articleType === 'audio' ? 2 : 3,
            tags: article.tags || []
        }));

        res.status(200).json({
            status: 1,
            message: "success",
            data: {
                articles: formattedArticles,
                categoryId: categoryId || null,
                tag: tag || null,
                authorName: authorName || null,
                page: Number(page),
                totalPages: Math.ceil(totalArticles / limit),
            },
            // currentPage: Number(page),
        });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// create a get route to get a single article by id
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
const createArticle = async (req, res) => {
    try {
        //destructure the request body
        const { title, subtitle, articleImage, articleType = "text", description, mediaUrl, category, tags, author } = req.body;

        // check if the required fields are present
        if (!title || !articleImage || !description || !category || !author) {
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
// Export the router instance
module.exports = {
    getArticles,
    getArticleById,
    createArticle
};