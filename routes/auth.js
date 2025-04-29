const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    loginValidation,
    registerValidation
} = require('../validations/authValidations');
const validate = require('../middlewares/validate');

// Registration route
router.post('/register', validate(registerValidation), authController.register);

// Login route
router.post('/login', validate(loginValidation), authController.login);

// Protected test route
router.get('/test-auth', authController.verifyToken, (req, res) => {
    res.json({ message: 'Authenticated successfully', user: req.user });
});

module.exports = router;