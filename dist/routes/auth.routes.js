"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const googleOAuth_service_1 = require("../services/googleOAuth.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/login
 * @desc    Authenticate with Google through Suno
 * @access  Private (requires API key)
 */
router.post('/login', auth_middleware_1.verifyApiKey, async (req, res) => {
    try {
        const token = await (0, googleOAuth_service_1.authenticateWithGoogle)();
        return res.status(200).json({
            success: true,
            token
        });
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
});
/**
 * @route   GET /api/auth/verify
 * @desc    Verify authentication token
 * @access  Private (requires API key)
 */
router.get('/verify', auth_middleware_1.verifyApiKey, (req, res) => {
    // For initial testing, return mock verification
    return res.status(200).json({
        success: true,
        message: 'Token verification endpoint ready'
    });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map