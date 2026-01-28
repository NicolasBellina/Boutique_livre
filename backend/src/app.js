import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import booksRouter from './routes/books.js';
import ordersRouter from './routes/orders.js';
import eventsRouter from './routes/events.js';
import errorHandler from './middlewares/errorHandler.js';
import loggingMiddleware from './middlewares/logging.js';

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));
app.use(express.json());
app.use(loggingMiddleware);

// Routes
app.use('/api/books', booksRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/events', eventsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware (doit être en dernier)
app.use(errorHandler);

// Start server only when appropriate
// - Ne pas écouter automatiquement en environnement de test
// - Permettre de désactiver l'écoute en définissant LISTEN=false (utile pour serverless)
const shouldListen = process.env.NODE_ENV !== 'test' && process.env.LISTEN !== 'false';

if (shouldListen) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 API available at http://localhost:${PORT}/api`);
    console.log(`🔍 Health check at http://localhost:${PORT}/health`);
  });
}

export default app;
