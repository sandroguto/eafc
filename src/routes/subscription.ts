import { Router, Request, Response } from 'express';
import { SUBSCRIPTION_PLANS } from '../models/subscriptions';
import apiKeyService from '../services/apiKeyService';
import paymentService from '../services/paymentService';
import { SubscriptionTier } from '../models/types';

const router = Router();

// Get all subscription plans
router.get('/plans', (req: Request, res: Response) => {
  res.json({
    plans: Object.values(SUBSCRIPTION_PLANS).map(plan => ({
      tier: plan.tier,
      price: plan.price,
      currency: plan.currency,
      features: plan.features,
      rateLimit: `${plan.rateLimit.maxRequests} requests per minute`
    }))
  });
});

// Generate a free API key
router.post('/subscribe/free', (req: Request, res: Response): void => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'userId is required'
    });
    return;
  }

  const apiKey = apiKeyService.generateApiKey(userId, SubscriptionTier.FREE);

  res.status(201).json({
    message: 'Free API key generated successfully',
    apiKey: apiKey.key,
    tier: apiKey.tier,
    features: SUBSCRIPTION_PLANS[SubscriptionTier.FREE].features,
    rateLimit: `${SUBSCRIPTION_PLANS[SubscriptionTier.FREE].rateLimit.maxRequests} requests per minute`
  });
});

// Create checkout session for paid plans
router.post('/subscribe/checkout', async (req: Request, res: Response): Promise<void> => {
  const { userId, tier } = req.body;

  if (!userId || !tier) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'userId and tier are required'
    });
    return;
  }

  if (tier === SubscriptionTier.FREE) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Use /subscribe/free endpoint for free tier'
    });
    return;
  }

  if (!Object.values(SubscriptionTier).includes(tier)) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid subscription tier'
    });
    return;
  }

  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const checkoutUrl = await paymentService.createCheckoutSession(
      userId,
      tier,
      `${baseUrl}/api/subscription/success`,
      `${baseUrl}/api/subscription/cancel`
    );

    res.json({
      message: 'Checkout session created',
      checkoutUrl
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to create checkout session'
    });
  }
});

// Stripe webhook endpoint
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;

  try {
    await paymentService.handleWebhook(JSON.stringify(req.body), signature);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({
      error: 'Webhook Error',
      message: error instanceof Error ? error.message : 'Webhook validation failed'
    });
  }
});

// Success/Cancel redirect handlers
router.get('/success', (req: Request, res: Response) => {
  res.send(`
    <html>
      <head><title>Subscription Successful</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>✓ Subscription Successful!</h1>
        <p>Your API key has been generated and sent to your email.</p>
        <p><a href="/">Return to Home</a></p>
      </body>
    </html>
  `);
});

router.get('/cancel', (req: Request, res: Response) => {
  res.send(`
    <html>
      <head><title>Subscription Canceled</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Subscription Canceled</h1>
        <p>Your subscription was not completed.</p>
        <p><a href="/api/subscription/plans">View Plans Again</a></p>
      </body>
    </html>
  `);
});

export default router;
