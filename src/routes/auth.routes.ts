import { Router } from 'express';
import { authenticateWithGoogle } from '../services/googleOAuth.service';
import { verifyApiKey } from '../middleware/auth.middleware';
import { testBrowser } from '../services/browser.service';
import { getDebugInfo } from '../services/debug.service';

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
  } catch (error: any) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
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

/**
 * @route   GET /api/auth/test-browser
 * @desc    Test if browser can be launched
 * @access  Private (requires API key)
 */
router.get('/test-browser', verifyApiKey, async (req, res) => {
  try {
    const result = await testBrowser();
    return res.status(200).json({
      success: true,
      message: result
    });
  } catch (error: any) {
    console.error('Browser test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Browser test failed',
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

/**
 * @route   GET /api/auth/debug
 * @desc    Get debug information about the environment
 * @access  Private (requires API key)
 */
router.get('/debug', verifyApiKey, async (req, res) => {
  try {
    const debugInfo = await getDebugInfo();
    return res.status(200).json(debugInfo);
  } catch (error: any) {
    console.error('Debug info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get debug info',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;