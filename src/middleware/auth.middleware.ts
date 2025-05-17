import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to verify API key for service authentication
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  // Get API key from header, query, or body
  const apiKey = 
    req.headers['x-api-key'] || 
    req.query.apiKey || 
    req.body?.apiKey;
  
  // Check if API key is provided
  if (!apiKey) {
    logger.warn('API key missing in request');
    return res.status(401).json({ 
      success: false, 
      error: 'API key is required' 
    });
  }
  
  // Verify API key matches our configured key
  const expectedApiKey = process.env.API_KEY;
  
  if (apiKey !== expectedApiKey) {
    logger.warn('Invalid API key provided');
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid API key' 
    });
  }
  
  // API key is valid, proceed
  next();
};