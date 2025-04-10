import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api.js';
import path from 'path';
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('Environment variables loaded:', {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***[exists]***' : '***[missing]***',
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
});
const app = express();
const port = process.env.PORT || 3001;
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use('/api', apiRoutes);
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
app.listen(port, () => {
    console.log(`API server running on port ${port}`);
    console.log('Accepting requests from http://localhost:3000');
});
//# sourceMappingURL=index.js.map