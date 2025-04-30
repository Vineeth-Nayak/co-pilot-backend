const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');


// register fucntion
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

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

// ... keep existing login and verifyToken methods ...

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