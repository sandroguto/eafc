import { Request, Response, NextFunction } from 'express';
import apiKeyService from '../services/apiKeyService';
import { ApiKey } from '../models/types';

export interface AuthenticatedRequest extends Request {
  apiKey?: ApiKey;
}

export const authenticateApiKey = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Please include it in the X-API-Key header.'
    });
    return;
  }

  const validatedKey = apiKeyService.validateApiKey(apiKey);

  if (!validatedKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or inactive API key.'
    });
    return;
  }

  apiKeyService.incrementRequestCount(apiKey);
  req.apiKey = validatedKey;
  next();
};
