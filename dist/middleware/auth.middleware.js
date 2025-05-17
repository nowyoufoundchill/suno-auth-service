"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const logger_1 = require("../utils/logger");
/**
 * Middleware to verify API key for service authentication
 */
const apiKeyAuth = (req, res, next) => {
    // Get API key from header, query, or body
    const apiKey = req.headers['x-api-key'] ||
        req.query.apiKey ||
        req.body?.apiKey;
    // Check if API key is provided
    if (!apiKey) {
        logger_1.logger.warn('API key missing in request');
        return res.status(401).json({
            success: false,
            error: 'API key is required'
        });
    }
    // Verify API key matches our configured key
    const expectedApiKey = process.env.API_KEY;
    if (apiKey !== expectedApiKey) {
        logger_1.logger.warn('Invalid API key provided');
        return res.status(401).json({
            success: false,
            error: 'Invalid API key'
        });
    }
    // API key is valid, proceed
    next();
};
exports.apiKeyAuth = apiKeyAuth;
//# sourceMappingURL=auth.middleware.js.map