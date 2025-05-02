const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('../models/userModel');

beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.TEST_MONGODB_URI);
});

afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('Auth Controller', () => {
    let user;

    beforeEach(async () => {
        // Create test user
        user = await User.create({
            name: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
        });
    });

    afterEach(async () => {
        // Clean up test data
        await User.deleteMany();
    });

    test('POST /api/auth/register - Register a new user', async () => {
        const newUser = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123',
        };
        const res = await request(app).post('/api/auth/register').send(newUser);
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe(1);
        expect(res.body.data.username).toBe('newuser');
    });

    test('POST /api/auth/login - Login with valid credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'testuser@example.com',
            password: 'password123',
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(1);
        expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login - Return 401 for invalid credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'testuser@example.com',
            password: 'wrongpassword',
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.status).toBe(0);
        expect(res.body.message).toBe('Invalid credentials');
    });

    test('POST /api/auth/register - Return 400 for duplicate email', async () => {
        const duplicateUser = {
            username: 'duplicateuser',
            email: 'testuser@example.com',
            password: 'password123',
        };
        const res = await request(app).post('/api/auth/register').send(duplicateUser);
        expect(res.statusCode).toBe(400);
        expect(res.body.status).toBe(0);
        expect(res.body.message).toBe('Email already exists');
    });
});