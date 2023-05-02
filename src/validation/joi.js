const Joi = require('joi');
const status = require('../validation/status')

const joiRegister = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).required(),
        role: Joi.string().valid('ADMIN', 'USER').required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ message: error.details[0].message });
    }
    next();
};

const joiLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ message: error.details[0].message });
    }
    next();
};

const joiQuery = (req, res, next) => {
    const schema = Joi.object({
        limit: Joi.number().integer().positive().optional(),
        page: Joi.number().integer().positive().optional(),
        id: Joi.number().optional(),
        userId: Joi.number().optional(),
        productName: Joi.string().optional(),
        productBrand: Joi.string().optional(),
    });
    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(status.badRequest).json({ message: error.details[0].message });
    }
    next();
};

const joiBody = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().optional(),
        password: Joi.string().pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{4,}$')).optional(),
        userId: Joi.number().optional(),
        productId: Joi.number().optional(),
        productName: Joi.string().optional(),
        productBrand: Joi.string().optional(),
        productQuantity: Joi.number().optional(),
        totalCost: Joi.number().optional(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(status.badRequest).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    joiRegister,
    joiLogin,
    joiQuery,
    joiBody
}