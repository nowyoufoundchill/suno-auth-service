import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware to verify API key
 */
export const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
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