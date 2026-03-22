const jwt = require('jsonwebtoken');

// FIX: must use the same fallback secret as auth.js, otherwise tokens signed
// with the fallback will fail verification when JWT_SECRET env var is missing.
const JWT_SECRET = process.env.JWT_SECRET || 'surefix_secret_key_change_in_production';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;