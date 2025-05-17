import { Router } from 'express';
import { authenticateWithGoogle } from '../services/googleOAuth.service';
import { verifyApiKey } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate with Google through Suno
 * @access  Private (requires API key)
 */
router.post('/login', verifyApiKey, async (req, res) => {
  try {
    const token = await authenticateWithGoogle();
    
    return res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
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
router.get('/verify', verifyApiKey, (req, res) => {
  // For initial testing, return mock verification
  return res.status(200).json({
    success: true,
    message: 'Token verification endpoint ready'
  });
});

export default router;

// Add this import
import { getDebugInfo } from '../services/debug.service';

// Add this route
router.get('/debug', verifyApiKey, async (req, res) => {
  try {
    const debugInfo = await getDebugInfo();
    return res.status(200).json(debugInfo);
  } catch (error) {
    console.error('Debug info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get debug info',
      error: error.message || 'Unknown error'
    });
  }
});