const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Assuming JWT is used for authentication

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]; // Bearer token
        if (!token) {
            return res.status(401).json({ message: 'Authentication token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        const user = await User.findById(decoded.id); // Find user by ID

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            // Get user ID from request (this would typically come from authentication middleware)
            // For now, we'll assume user ID is passed in headers or params
            const userId = req.headers['x-user-id'] || req.params.userId;
            
            if (!userId) {
                return res.status(401).json({ message: 'User ID required' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (!user.isActive) {
                return res.status(403).json({ message: 'User account is deactivated' });
            }

            if (!roles.includes(user.accountType)) {
                return res.status(403).json({ 
                    message: 'Access denied. Insufficient permissions.' 
                });
            }

            req.user = user; // Attach user to request object
            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};

module.exports = { authenticate, requireRole };
