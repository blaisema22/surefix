const jwt = require('jsonwebtoken');

function generateToken(payload) {
    const jwtSecret = import.meta.env.VITE_JWT_SECRET || 'surefix_secret_key_change_in_production';
    return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
}
module.exports = { generateToken };