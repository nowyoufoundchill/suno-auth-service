import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { googleOAuthService } from '../services/googleOAuth.service';
import { apiKeyAuth } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// Schema for authentication request
const authRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Schema for session verification request
const sessionVerifySchema = z.object({
  sessionData: z.string()
});

/**
 * @route   POST /auth/google
 * @desc    Authenticate with Google OAuth for Suno
 * @access  Private (API Key)
 */
router.post('/google', apiKeyAuth, async (req: Request, res: Response) => {
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
    logger.info(`Starting Google OAuth authentication for ${email}...`);
    const result = await googleOAuthService.authenticate(email, password);
    
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
  } catch (error: any) {
    logger.error('Error in Google OAuth authentication:', error);
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
router.post('/verify', apiKeyAuth, async (req: Request, res: Response) => {
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
    const isValid = await googleOAuthService.verifySession(sessionData);
    
    return res.status(200).json({
      success: true,
      valid: isValid
    });
  } catch (error: any) {
    logger.error('Error verifying session:', error);
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
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

export default router;