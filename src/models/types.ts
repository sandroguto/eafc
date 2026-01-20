export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium'
}

export interface ApiKey {
  key: string;
  tier: SubscriptionTier;
  userId: string;
  createdAt: Date;
  isActive: boolean;
  requestCount: number;
  lastUsed?: Date;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  price: number;
  currency: string;
  rateLimit: RateLimitConfig;
  features: string[];
}

export interface ProclubsMatch {
  matchId: string;
  clubName: string;
  opponentName: string;
  result: string;
  goalsFor: number;
  goalsAgainst: number;
  date: Date;
  competition: string;
}

export interface PlayerStatistics {
  playerId: string;
  playerName: string;
  position: string;
  matches: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  rating: number;
}
