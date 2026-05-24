import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/errorHandler';

// Import routes (we will create these later)
import authRoutes from './modules/auth/auth.routes';
import groupRoutes from './modules/groups/groups.routes';
import billRoutes from './modules/bills/bills.routes';
import settlementRoutes from './modules/settlements/settlements.routes';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev', {
  stream: { write: (message) => logger.http(message.trim()) }
}));

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1', billRoutes); // Bill routes include /groups/:groupId/expenses
app.use('/api/v1', settlementRoutes); // Settlement routes include /groups/:groupId/settlements

// Error Handling Middleware
app.use(errorHandler);

export default app;
