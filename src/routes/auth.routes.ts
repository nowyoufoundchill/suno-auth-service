import { Router } from 'express';
import { authenticateWithGoogle } from '../services/googleOAuth.service';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate with Google through Suno
 * @access  Public
 */
router.post('/login', async (req, res) => {
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
 * @access  Public
 */
router.get('/verify', (req, res) => {
  // For initial testing, return mock verification
  return res.status(200).json({
    success: true,
    message: 'Token verification endpoint ready'
  });
});

export default router;