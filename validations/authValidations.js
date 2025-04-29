const Joi = require('joi');

exports.loginValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

exports.registerValidation = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
        .messages({ 'any.only': 'Passwords do not match' })
});