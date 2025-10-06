import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';

// Services
import { botManager } from './services/BotManager';

// Routes
import authRoutes from './routes/auth';
import whatsappRoutes from './routes/whatsapp';
import businessRoutes from './routes/business';
import campaignRoutes from './routes/campaign';
import leadRoutes from './routes/lead';
import analyticsRoutes from './routes/analytics';
import dataAlexiaRoutes from './routes/dataAlexia';
import botsRoutes from './routes/bots';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma
export const prisma = new PrismaClient();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost on any port and 127.0.0.1 on any port
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://your-domain.com',
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/data-alexia', dataAlexiaRoutes);
app.use('/api/bots', botsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Load bots from database using BotManager
    logger.info('Loading bots from database...');
    await botManager.loadBotsFromDatabase();
    logger.info('Bot manager initialized');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Active bots: ${botManager.getActiveBots().length}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await botManager.stopAllBots();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await botManager.stopAllBots();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();