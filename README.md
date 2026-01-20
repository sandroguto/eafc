# EA FC Proclubs API

A subscription-based API for accessing EA FC Proclubs match data and statistics. This API offers tiered access with different rate limits and features.

## 🚀 Features

- **API Key Authentication** - Secure access control with unique API keys
- **Subscription Tiers** - Free, Basic, and Premium plans
- **Rate Limiting** - Automatic rate limiting based on subscription tier
- **Payment Integration** - Stripe integration for paid subscriptions
- **Match Data** - Access to Proclubs match results and details
- **Player Statistics** - Comprehensive player performance data (Basic & Premium)
- **Advanced Analytics** - Predictive analytics and insights (Premium only)

## 📋 Subscription Plans

### Free Tier
- **Price:** $0/month
- **Rate Limit:** 10 requests/minute
- **Features:**
  - Access to basic match data
  - Limited to 10 requests per minute
  - Community support

### Basic Tier
- **Price:** $9.99/month
- **Rate Limit:** 100 requests/minute
- **Features:**
  - All Free tier features
  - Player statistics
  - Historical data access (6 months)
  - Email support

### Premium Tier
- **Price:** $29.99/month
- **Rate Limit:** 1000 requests/minute
- **Features:**
  - All Basic tier features
  - Real-time match updates
  - Advanced analytics
  - Unlimited historical data
  - Priority support
  - Webhook notifications

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/sandroguto/eafc.git
cd eafc
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=3000
NODE_ENV=development
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
API_BASE_URL=http://localhost:3000
```

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 📖 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

All protected endpoints require an API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your_api_key_here" http://localhost:3000/api/proclubs/matches
```

### Public Endpoints

#### Get API Information
```http
GET /
```

#### View API Documentation
```http
GET /api/docs
```

#### Get Subscription Plans
```http
GET /api/subscription/plans
```

**Response:**
```json
{
  "plans": [
    {
      "tier": "free",
      "price": 0,
      "currency": "USD",
      "features": [...],
      "rateLimit": "10 requests per minute"
    }
  ]
}
```

#### Subscribe to Free Tier
```http
POST /api/subscription/subscribe/free
Content-Type: application/json

{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "message": "Free API key generated successfully",
  "apiKey": "eafc_free_abc123...",
  "tier": "free",
  "features": [...],
  "rateLimit": "10 requests per minute"
}
```

#### Create Checkout Session (Basic/Premium)
```http
POST /api/subscription/subscribe/checkout
Content-Type: application/json

{
  "userId": "user_123",
  "tier": "basic"
}
```

**Response:**
```json
{
  "message": "Checkout session created",
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### Protected Endpoints

#### Get Recent Matches
```http
GET /api/proclubs/matches?limit=10
X-API-Key: your_api_key_here
```

**Access:** All tiers

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "matchId": "match_001",
      "clubName": "FC Champions",
      "opponentName": "United FC",
      "result": "W",
      "goalsFor": 3,
      "goalsAgainst": 1,
      "date": "2024-01-15",
      "competition": "Division 1"
    }
  ],
  "meta": {
    "total": 1,
    "tier": "free",
    "requestCount": 5
  }
}
```

#### Get Match Details
```http
GET /api/proclubs/matches/:matchId
X-API-Key: your_api_key_here
```

**Access:** All tiers

#### Get Player Statistics
```http
GET /api/proclubs/statistics/players
X-API-Key: your_api_key_here
```

**Access:** Basic and Premium tiers only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "playerId": "player_001",
      "playerName": "John Striker",
      "position": "ST",
      "matches": 25,
      "goals": 18,
      "assists": 7,
      "rating": 8.5
    }
  ]
}
```

#### Get Advanced Analytics
```http
GET /api/proclubs/analytics/advanced
X-API-Key: your_api_key_here
```

**Access:** Premium tier only

**Response:**
```json
{
  "success": true,
  "data": {
    "winRate": 0.68,
    "avgGoalsFor": 2.3,
    "avgGoalsAgainst": 1.2,
    "form": ["W", "W", "L", "W", "D"],
    "topScorer": {...},
    "predictionNextMatch": {
      "confidence": 0.72,
      "predictedResult": "W"
    }
  }
}
```

## 🔐 Security

- API keys are generated using UUID v4
- Rate limiting prevents abuse
- Stripe handles all payment processing securely
- Environment variables protect sensitive data

## 💳 Payment Integration

This API uses Stripe for payment processing. To set up payments:

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add the keys to your `.env` file
4. Configure webhook endpoints in Stripe Dashboard pointing to `/api/subscription/webhook`

## 🧪 Testing

To test the API:

1. Start the server:
```bash
npm run dev
```

2. Get a free API key:
```bash
curl -X POST http://localhost:3000/api/subscription/subscribe/free \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123"}'
```

3. Use the API key to make requests:
```bash
curl -H "X-API-Key: your_api_key_here" \
  http://localhost:3000/api/proclubs/matches
```

## 📝 Example Usage

### JavaScript/Node.js
```javascript
const axios = require('axios');

const apiKey = 'eafc_free_abc123...';
const baseURL = 'http://localhost:3000';

async function getMatches() {
  try {
    const response = await axios.get(`${baseURL}/api/proclubs/matches`, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

getMatches();
```

### Python
```python
import requests

api_key = 'eafc_free_abc123...'
base_url = 'http://localhost:3000'

headers = {
    'X-API-Key': api_key
}

response = requests.get(f'{base_url}/api/proclubs/matches', headers=headers)
print(response.json())
```

### cURL
```bash
curl -H "X-API-Key: eafc_free_abc123..." \
  http://localhost:3000/api/proclubs/matches
```

## 🚦 Rate Limiting

Rate limits are enforced per API key based on subscription tier:

- **Free:** 10 requests/minute
- **Basic:** 100 requests/minute  
- **Premium:** 1000 requests/minute

When you exceed the rate limit, you'll receive a 429 status code:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded for free tier. Maximum 10 requests per minute.",
  "tier": "free",
  "limit": 10,
  "upgrade": "Upgrade to Basic or Premium for higher limits"
}
```

## 🛣️ Roadmap

- [ ] Database integration for persistent storage
- [ ] User dashboard for managing API keys
- [ ] Webhook support for real-time notifications
- [ ] Additional analytics endpoints
- [ ] Multi-language support
- [ ] GraphQL API option

## 📄 License

MIT

## 👥 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

- **Free Tier:** Community support via GitHub issues
- **Basic Tier:** Email support
- **Premium Tier:** Priority email support

For questions or support, please open an issue on GitHub.
