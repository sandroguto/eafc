import { SubscriptionTier, SubscriptionPlan } from './types';

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  [SubscriptionTier.FREE]: {
    tier: SubscriptionTier.FREE,
    price: 0,
    currency: 'USD',
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_FREE || '10')
    },
    features: [
      'Access to basic match data',
      'Limited to 10 requests per minute',
      'Community support'
    ]
  },
  [SubscriptionTier.BASIC]: {
    tier: SubscriptionTier.BASIC,
    price: 9.99,
    currency: 'USD',
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_BASIC || '100')
    },
    features: [
      'Access to all match data',
      'Player statistics',
      '100 requests per minute',
      'Email support',
      'Historical data access (6 months)'
    ]
  },
  [SubscriptionTier.PREMIUM]: {
    tier: SubscriptionTier.PREMIUM,
    price: 29.99,
    currency: 'USD',
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: parseInt(process.env.RATE_LIMIT_PREMIUM || '1000')
    },
    features: [
      'All Basic features',
      '1000 requests per minute',
      'Real-time match updates',
      'Advanced analytics',
      'Priority support',
      'Historical data access (unlimited)',
      'Webhook notifications'
    ]
  }
};
