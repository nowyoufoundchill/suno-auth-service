// Import necessary dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // Only import once
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(cors());
app.use(helmet()); // Use helmet for security headers
app.use(morgan('dev'));
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.send('Suno Auth Service is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount the auth routes at /api/auth
app.use('/api/auth', authRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Export for testing
export default app;