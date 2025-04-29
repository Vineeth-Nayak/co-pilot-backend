const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 0,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = validate;