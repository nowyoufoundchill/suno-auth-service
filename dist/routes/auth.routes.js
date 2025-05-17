"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const googleOAuth_service_1 = require("../services/googleOAuth.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Schema for authentication request
const authRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1)
});
// Schema for session verification request
const sessionVerifySchema = zod_1.z.object({
    sessionData: zod_1.z.string()
});
/**
 * @route   POST /auth/google
 * @desc    Authenticate with Google OAuth for Suno
 * @access  Private (API Key)
 */
router.post('/google', auth_middleware_1.apiKeyAuth, async (req, res) => {
    try {
        // Validate request body
        const validationResult = authRequestSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request body',
                details: validationResult.error.errors
            });
        }
        const { email, password } = validationResult.data;
        // Authenticate with Google
        logger_1.logger.info(`Starting Google OAuth authentication for ${email}...`);
        const result = await googleOAuth_service_1.googleOAuthService.authenticate(email, password);
        if (!result.success) {
            return res.status(401).json({
                success: false,
                error: result.error || 'Authentication failed'
            });
        }
        // Store the session data securely (in a real app, this might be in a database)
        const sessionId = `session_${Date.now()}`;
        return res.status(200).json({
            success: true,
            message: 'Authentication successful',
            sessionId,
            sessionData: result.sessionData,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
        });
    }
    catch (error) {
        logger_1.logger.error('Error in Google OAuth authentication:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication service error',
            message: error.message
        });
    }
});
/**
 * @route   POST /auth/verify
 * @desc    Verify session is still valid
 * @access  Private (API Key)
 */
router.post('/verify', auth_middleware_1.apiKeyAuth, async (req, res) => {
    try {
        // Validate request body
        const validationResult = sessionVerifySchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request body',
                details: validationResult.error.errors
            });
        }
        const { sessionData } = validationResult.data;
        // Verify session
        const isValid = await googleOAuth_service_1.googleOAuthService.verifySession(sessionData);
        return res.status(200).json({
            success: true,
            valid: isValid
        });
    }
    catch (error) {
        logger_1.logger.error('Error verifying session:', error);
        return res.status(500).json({
            success: false,
            error: 'Session verification error',
            message: error.message
        });
    }
});
/**
 * @route   GET /auth/health
 * @desc    Check if authentication service is running
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Authentication service is running',
        version: '1.0.0',
        timestamp: new Date()
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map