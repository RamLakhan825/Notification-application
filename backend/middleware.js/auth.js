const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // replace with env var in production
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = authMiddleware;
