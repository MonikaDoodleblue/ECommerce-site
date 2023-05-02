const jwt = require('jsonwebtoken');
const statusCode = require('../validation/status');
const messages = require('../validation/message');
const nodemailer = require('nodemailer');
require('dotenv').config();
const db = require("../models/index");
const Info = db.Info;

const generateToken = (user) => {
    const tokenPayload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '2h' });
    return { token, role: user.role };
};

const authenticate = (roles) => async (req, res, next) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(statusCode.badRequest).json({ status: messages.false, message: messages.tokenMissing, token: null });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;
        if (decoded.role === 'ADMIN' && roles.includes('ADMIN')) {
            user = await Info.findOne({ where: { id: decoded.id, role: 'ADMIN' } });
        } else if (decoded.role === 'USER' && roles.includes('USER')) {
            user = await Info.findOne({ where: { id: decoded.id, role: 'USER' } });
        } else {
            return res.status(statusCode.badRequest).json({ status: messages.false, message: messages.role });
        }

        if (!user) {
            return res.status(statusCode.badRequest).json({ status: messages.false, message: messages.unauthorized });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        if (roles.length && !roles.includes(user.role)) {
            return res.status(statusCode.badRequest).json({ status: messages.false, error: `Access denied. You do not have ${user.role} privileges.` });
        }
        next();

    } catch (error) {
        console.error(error);
        return res.status(statusCode.unauthorized).json({ status: messages.false, error: messages.unauthorized });
    }
};

const mailService = async (to, subject, html, attachment) => {
    try {
        // Create transporter for sending email
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORTNO,
            secure: process.env.SECURE,
            auth: {
                user: process.env.FROM,
                pass: process.env.PASSWORD,
            }
        });

        // Create email options
        const mailOptions = {
            from: process.env.FROM,
            to: to,
            subject: subject,
            html: html,
            attachments: attachment ? [attachment] : undefined,
        };

        // Send email
        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error(error);
        logger.error('Error sending email', { error });
    }
};

module.exports = {
    generateToken,
    authenticate,
    mailService
};