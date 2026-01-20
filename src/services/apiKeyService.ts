import { v4 as uuidv4 } from 'uuid';
import { ApiKey, SubscriptionTier } from '../models/types';

class ApiKeyService {
  private apiKeys: Map<string, ApiKey> = new Map();

  generateApiKey(userId: string, tier: SubscriptionTier): ApiKey {
    const key = `eafc_${tier}_${uuidv4().replace(/-/g, '')}`;
    const apiKey: ApiKey = {
      key,
      tier,
      userId,
      createdAt: new Date(),
      isActive: true,
      requestCount: 0
    };
    this.apiKeys.set(key, apiKey);
    return apiKey;
  }

  validateApiKey(key: string): ApiKey | null {
    const apiKey = this.apiKeys.get(key);
    if (!apiKey || !apiKey.isActive) {
      return null;
    }
    return apiKey;
  }

  incrementRequestCount(key: string): void {
    const apiKey = this.apiKeys.get(key);
    if (apiKey) {
      apiKey.requestCount++;
      apiKey.lastUsed = new Date();
      this.apiKeys.set(key, apiKey);
    }
  }

  deactivateApiKey(key: string): boolean {
    const apiKey = this.apiKeys.get(key);
    if (apiKey) {
      apiKey.isActive = false;
      this.apiKeys.set(key, apiKey);
      return true;
    }
    return false;
  }

  getApiKeyInfo(key: string): ApiKey | null {
    return this.apiKeys.get(key) || null;
  }

  getAllApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values());
  }

  upgradeSubscription(key: string, newTier: SubscriptionTier): boolean {
    const apiKey = this.apiKeys.get(key);
    if (apiKey) {
      apiKey.tier = newTier;
      this.apiKeys.set(key, apiKey);
      return true;
    }
    return false;
  }
}

export default new ApiKeyService();
