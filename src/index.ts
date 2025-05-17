import dotenv from 'dotenv';
import { initializeApp } from './config/app';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app = initializeApp();

// Get port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info('Authentication service for Suno started successfully');
});