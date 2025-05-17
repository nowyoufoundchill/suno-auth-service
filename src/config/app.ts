import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from '../routes/auth.routes';
import { logger } from '../utils/logger';

/**
 * Initialize and configure Express application
 */
export function initializeApp(): Express {
  // Create Express app
  const app = express();
  
  // Apply middleware
  app.use(helmet()); // Security headers
  app.use(cors()); // Enable CORS
  app.use(express.json()); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
  
  // Setup logging
  app.use(morgan('dev', { 
    stream: { 
      write: (message: string) => logger.http(message.trim()) 
    } 
  }));
  
  // Routes
  app.use('/api/auth', authRoutes);
  
  // Default route
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Suno Authentication Service',
      version: '1.0.0',
      status: 'online'
    });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  });
  
  return app;
}