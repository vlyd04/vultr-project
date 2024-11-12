const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Check if Authorization header is present
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is missing' });
        }

        // Extract token by removing "Bearer " prefix
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }

        // Verify token and decode
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user info to the request
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification failed:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
