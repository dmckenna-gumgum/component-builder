import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api';

// Load environment variables from absolute path
const envPath = 'F:/Work/GumGum/Repos/Component Builder/component-builder/.env';
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Log environment variables (without sensitive values)
console.log('Environment variables loaded:', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***[exists]***' : '***[missing]***',
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT
});

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // React app's URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
  console.log('Accepting requests from http://localhost:3000');
});
