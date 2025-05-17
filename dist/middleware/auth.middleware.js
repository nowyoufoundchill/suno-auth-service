"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyApiKey = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Middleware to verify API key
 */
const verifyApiKey = (req, res, next) => {
    // Get API key from environment variables
    const validApiKey = process.env.API_KEY;
    // Get API key from request headers
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    // Check if API key is valid
    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid API key'
        });
    }
    // API key is valid, proceed to the next middleware/route handler
    next();
};
exports.verifyApiKey = verifyApiKey;
//# sourceMappingURL=auth.middleware.js.map