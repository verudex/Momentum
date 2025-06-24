import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import calculateRoutes from './routes/calculate';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/calculate', calculateRoutes);

// Health check route (optional)
app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running.');
});

// Error-handling middleware (important!)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
