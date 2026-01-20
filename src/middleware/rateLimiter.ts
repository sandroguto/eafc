import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { SUBSCRIPTION_PLANS } from '../models/subscriptions';
import { SubscriptionTier } from '../models/types';
import { AuthenticatedRequest } from './auth';

export const createRateLimiter = (tier: SubscriptionTier) => {
  const config = SUBSCRIPTION_PLANS[tier].rateLimit;
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.maxRequests,
    message: {
      error: 'Too Many Requests',
      message: `Rate limit exceeded for ${tier} tier. Maximum ${config.maxRequests} requests per minute.`,
      tier,
      limit: config.maxRequests
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const authReq = req as AuthenticatedRequest;
      return authReq.apiKey?.key || req.ip || 'unknown';
    },
    handler: (req: Request, res: Response) => {
      const authReq = req as AuthenticatedRequest;
      const tier = authReq.apiKey?.tier || SubscriptionTier.FREE;
      const config = SUBSCRIPTION_PLANS[tier].rateLimit;
      
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${tier} tier. Maximum ${config.maxRequests} requests per minute.`,
        tier,
        limit: config.maxRequests,
        upgrade: tier === SubscriptionTier.FREE 
          ? 'Upgrade to Basic or Premium for higher limits'
          : tier === SubscriptionTier.BASIC
          ? 'Upgrade to Premium for higher limits'
          : 'You are already on the highest tier'
      });
    }
  });
};

export const dynamicRateLimiter = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const tier = req.apiKey?.tier || SubscriptionTier.FREE;
  const limiter = createRateLimiter(tier);
  limiter(req, res, next);
};
