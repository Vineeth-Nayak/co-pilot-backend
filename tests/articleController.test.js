require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Article = require('../models/articleModel');
const Category = require('../models/categoryModel');
const Author = require('../models/authorModel');

beforeAll(async () => {
    // Disconnect the default connection
    await mongoose.disconnect();

    // Connect to the test database
    await mongoose.connect(process.env.TEST_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('Article Controller', () => {
    let category, author, article;

    beforeEach(async () => {
        // Create test data
        category = await Category.create({ categoryName: 'Test Category' });
        author = await Author.create({ authorName: 'Test Author' });
        article = await Article.create({
            title: 'Test Article',
            subtitle: 'Test Subtitle',
            articleImage: 'http://example.com/image.jpg',
            articleType: 'text',
            description: 'Test Description',
            category: category._id,
            tags: ['test', 'article'],
            author: author._id,
        });
    });

    afterEach(async () => {
        // Clean up test data
        await Article.deleteMany();
        await Category.deleteMany();
        await Author.deleteMany();
    });

    test('GET /api/articles - Fetch all articles', async () => {
        const res = await request(app).get('/api/articles');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(1);
        expect(res.body.data.articles).toHaveLength(1);
    });

    test('GET /api/articles/:id - Fetch article by ID', async () => {
        const res = await request(app).get(`/api/articles/${article._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(1);
        expect(res.body.data.title).toBe('Test Article');
    });

    test('POST /api/articles - Create a new article', async () => {
        const newArticle = {
            title: 'New Article',
            subtitle: 'New Subtitle',
            articleImage: 'http://example.com/new-image.jpg',
            articleType: 'text',
            description: 'New Description',
            category: category._id,
            tags: ['new', 'article'],
            author: author._id,
        };
        const res = await request(app).post('/api/articles').send(newArticle);
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe(1);
        expect(res.body.data.title).toBe('New Article');
    });

    test('PUT /api/articles/:id - Update an article', async () => {
        const updatedData = { title: 'Updated Article' };
        const res = await request(app).put(`/api/articles/${article._id}`).send(updatedData);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(1);
        expect(res.body.data.title).toBe('Updated Article');
    });

    test('GET /api/articles - Return 404 if no articles found', async () => {
        await Article.deleteMany();
        const res = await request(app).get('/api/articles');
        expect(res.statusCode).toBe(404);
        expect(res.body.status).toBe(0);
        expect(res.body.message).toBe('No articles found');
    });

    test('POST /api/articles - Return 400 for invalid data', async () => {
        const invalidArticle = {
            title: '',
            articleImage: '',
            category: '',
            author: '',
        };
        const res = await request(app).post('/api/articles').send(invalidArticle);
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe(0);
        expect(res.body.message).toBe('Please provide all required fields');
    });

    test('PUT /api/articles/:id - Return 404 for non-existent article', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).put(`/api/articles/${nonExistentId}`).send({ title: 'Non-existent Article' });
        expect(res.statusCode).toBe(404);
        expect(res.body.status).toBe(0);
        expect(res.body.message).toBe('Article not found');
    });
});