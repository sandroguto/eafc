import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ProclubsMatch, PlayerStatistics, SubscriptionTier } from '../models/types';

const router = Router();

// Mock data for demonstration
const mockMatches: ProclubsMatch[] = [
  {
    matchId: 'match_001',
    clubName: 'FC Champions',
    opponentName: 'United FC',
    result: 'W',
    goalsFor: 3,
    goalsAgainst: 1,
    date: new Date('2024-01-15'),
    competition: 'Division 1'
  },
  {
    matchId: 'match_002',
    clubName: 'FC Champions',
    opponentName: 'City Rovers',
    result: 'D',
    goalsFor: 2,
    goalsAgainst: 2,
    date: new Date('2024-01-18'),
    competition: 'Division 1'
  },
  {
    matchId: 'match_003',
    clubName: 'FC Champions',
    opponentName: 'Athletic Club',
    result: 'L',
    goalsFor: 1,
    goalsAgainst: 2,
    date: new Date('2024-01-20'),
    competition: 'Division 1'
  }
];

const mockPlayerStats: PlayerStatistics[] = [
  {
    playerId: 'player_001',
    playerName: 'John Striker',
    position: 'ST',
    matches: 25,
    goals: 18,
    assists: 7,
    cleanSheets: 0,
    rating: 8.5
  },
  {
    playerId: 'player_002',
    playerName: 'Mike Midfielder',
    position: 'CM',
    matches: 25,
    goals: 5,
    assists: 12,
    cleanSheets: 0,
    rating: 7.8
  }
];

// Get recent matches (available to all tiers)
router.get('/matches', (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const matches = mockMatches.slice(0, limit);

  res.json({
    success: true,
    data: matches,
    meta: {
      total: matches.length,
      tier: req.apiKey?.tier,
      requestCount: req.apiKey?.requestCount
    }
  });
});

// Get match by ID (available to all tiers)
router.get('/matches/:matchId', (req: AuthenticatedRequest, res: Response) => {
  const { matchId } = req.params;
  const match = mockMatches.find(m => m.matchId === matchId);

  if (!match) {
    res.status(404).json({
      error: 'Not Found',
      message: 'Match not found'
    });
    return;
  }

  res.json({
    success: true,
    data: match
  });
});

// Get player statistics (requires Basic or Premium tier)
router.get('/statistics/players', (req: AuthenticatedRequest, res: Response) => {
  if (req.apiKey?.tier === SubscriptionTier.FREE) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Player statistics are only available to Basic and Premium subscribers',
      upgrade: 'Upgrade your plan to access this feature'
    });
    return;
  }

  res.json({
    success: true,
    data: mockPlayerStats,
    meta: {
      total: mockPlayerStats.length,
      tier: req.apiKey?.tier
    }
  });
});

// Get advanced analytics (requires Premium tier)
router.get('/analytics/advanced', (req: AuthenticatedRequest, res: Response) => {
  if (req.apiKey?.tier !== SubscriptionTier.PREMIUM) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Advanced analytics are only available to Premium subscribers',
      currentTier: req.apiKey?.tier,
      upgrade: 'Upgrade to Premium to access this feature'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      winRate: 0.68,
      avgGoalsFor: 2.3,
      avgGoalsAgainst: 1.2,
      form: ['W', 'W', 'L', 'W', 'D'],
      topScorer: mockPlayerStats[0],
      predictionNextMatch: {
        confidence: 0.72,
        predictedResult: 'W'
      }
    },
    meta: {
      tier: req.apiKey?.tier,
      premiumFeature: true
    }
  });
});

export default router;
