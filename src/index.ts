import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subscriptionRoutes from './routes/subscription';
import proclubsRoutes from './routes/proclubs';
import { authenticateApiKey } from './middleware/auth';
import { dynamicRateLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'EA FC Proclubs API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/docs',
    subscription: '/api/subscription/plans'
  });
});

// API Documentation
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    endpoints: {
      public: {
        '/': 'API information',
        '/api/docs': 'API documentation',
        'GET /api/subscription/plans': 'Get subscription plans',
        'POST /api/subscription/subscribe/free': 'Get free API key',
        'POST /api/subscription/subscribe/checkout': 'Create checkout session for paid plans'
      },
      authenticated: {
        'GET /api/proclubs/matches': 'Get recent matches (all tiers)',
        'GET /api/proclubs/matches/:matchId': 'Get match details (all tiers)',
        'GET /api/proclubs/statistics/players': 'Get player statistics (Basic & Premium)',
        'GET /api/proclubs/analytics/advanced': 'Get advanced analytics (Premium only)'
      }
    },
    authentication: {
      method: 'API Key',
      header: 'X-API-Key',
      example: 'X-API-Key: eafc_free_abc123...'
    },
    rateLimit: {
      free: '10 requests/minute',
      basic: '100 requests/minute',
      premium: '1000 requests/minute'
    }
  });
});

// Subscription routes (public)
app.use('/api/subscription', subscriptionRoutes);

// Protected API routes (require authentication and rate limiting)
app.use('/api/proclubs', authenticateApiKey, dynamicRateLimiter, proclubsRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    documentation: '/api/docs'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 EA FC Proclubs API is running on port ${PORT}`);
    console.log(`📖 Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`💳 Subscription plans: http://localhost:${PORT}/api/subscription/plans`);
  });
}

export default app;
