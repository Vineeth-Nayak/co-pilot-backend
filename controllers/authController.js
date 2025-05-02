const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

/**
 * Registers a new user in the system.
 *
 * @async
 * @function register
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing user details.
 * @param {string} req.body.name - The name of the user.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the registration status, token, and user data.
 * @throws {Error} Returns a 400 status if the email is already in use, or a 500 status for server errors.
 */
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        console.log('Registering user:', { name, email, password });
        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 0,
                message: 'Email already in use'
            });
        }

        // 2. Create new user (password gets hashed via pre-save hook)
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // 3. Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Send response
        res.status(201).json({
            status: 1,
            message: 'Registration successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            status: 0,
            message: 'Registration failed'
        });
    }
};

/**
 * Logs in an existing user.
 *
 * @async
 * @function login
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request containing login credentials.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends a JSON response with the login status, token, and user data.
 * @throws {Error} Returns a 401 status if credentials are invalid, or a 500 status for server errors.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email }).select('+password');;
        if (!user) {
            return res.status(401).json({
                status: 0,
                message: 'Invalid credentials'
            });
        }

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 0,
                message: 'Invalid credentials'
            });
        }

        // 3. Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );


        // 4. Send response
        res.json({
            status: 1,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            status: 0,
            message: 'Server error'
        });
    }
};

/**
 * Verifies the JWT token provided in the request header.
 *
 * @function verifyToken
 * @param {Object} req - The request object.
 * @param {Object} req.header - The headers of the request.
 * @param {string} req.header.Authorization - The authorization header containing the Bearer token.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void} Calls the next middleware if the token is valid, or sends a 401 status if invalid.
 * @throws {Error} Returns a 401 status if the token is missing or invalid.
 */
const verifyToken = (req, res, next) => {
    try {
        // 1. Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                status: 0,
                message: 'No token provided'
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({
            status: 0,
            message: 'Invalid token'
        });
    }
};

// Export the functions
module.exports = {
    register,
    login,
    verifyToken
};