# EA FC API - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Clients                              │
│                  (Web, Mobile, Desktop Apps)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │ X-API-Key Header
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express.js API Server                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Public Endpoints                             │  │
│  │  • GET /                                                  │  │
│  │  • GET /api/docs                                          │  │
│  │  • GET /api/subscription/plans                            │  │
│  │  • POST /api/subscription/subscribe/free                  │  │
│  │  • POST /api/subscription/subscribe/checkout              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Authentication Middleware                         │  │
│  │         (Validates API Key)                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Rate Limiting Middleware                          │  │
│  │         (Tier-based rate limits)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Protected Endpoints                          │  │
│  │  • GET /api/proclubs/matches                              │  │
│  │  • GET /api/proclubs/matches/:id                          │  │
│  │  • GET /api/proclubs/statistics/players (Basic+)          │  │
│  │  • GET /api/proclubs/analytics/advanced (Premium)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │      API Key Service               │
        │  (In-memory storage)               │
        │  • Key generation                  │
        │  • Key validation                  │
        │  • Usage tracking                  │
        └────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │      Payment Service               │
        │  (Stripe Integration)              │
        │  • Checkout sessions               │
        │  • Webhook handling                │
        │  • Subscription management         │
        └────────────────────────────────────┘
```

## Subscription Flow

```
┌────────────┐
│   User     │
└──────┬─────┘
       │
       │ 1. Choose subscription tier
       │
       ▼
┌────────────────────────────────┐
│  GET /api/subscription/plans   │
└────────┬───────────────────────┘
         │
         │ 2a. Free tier
         ▼
┌────────────────────────────────────┐         ┌──────────────────┐
│ POST /api/subscription/subscribe/  │────────>│  API Key         │
│      free                           │         │  Generated       │
└────────────────────────────────────┘         └──────────────────┘
         │
         │ 2b. Paid tier (Basic/Premium)
         ▼
┌────────────────────────────────────┐
│ POST /api/subscription/subscribe/  │
│      checkout                       │
└────────┬───────────────────────────┘
         │
         │ 3. Redirect to Stripe
         ▼
┌────────────────────────────────────┐
│      Stripe Checkout               │
│      (Payment Processing)          │
└────────┬───────────────────────────┘
         │
         │ 4. Webhook after payment
         ▼
┌────────────────────────────────────┐         ┌──────────────────┐
│ POST /api/subscription/webhook     │────────>│  API Key         │
│      (Stripe webhook)               │         │  Generated       │
└────────────────────────────────────┘         └──────────────────┘
```

## API Request Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. HTTP Request with X-API-Key header
     ▼
┌──────────────────────────┐
│ Authentication Middleware │
│ • Validates API key       │
│ • Checks if active        │
└────┬─────────────────────┘
     │
     │ 2. Valid? Continue
     ▼
┌──────────────────────────┐
│ Rate Limiter Middleware   │
│ • Check tier              │
│ • Enforce limits          │
│   - Free: 10/min          │
│   - Basic: 100/min        │
│   - Premium: 1000/min     │
└────┬─────────────────────┘
     │
     │ 3. Within limits? Continue
     ▼
┌──────────────────────────┐
│ Endpoint Handler          │
│ • Check tier access       │
│ • Process request         │
│ • Return data             │
└────┬─────────────────────┘
     │
     │ 4. HTTP Response
     ▼
┌─────────┐
│ Client  │
└─────────┘
```

## Tier Access Matrix

| Feature                    | Free | Basic | Premium |
|---------------------------|------|-------|---------|
| Match Data                | ✅   | ✅    | ✅      |
| Rate Limit                | 10/m | 100/m | 1000/m  |
| Player Statistics         | ❌   | ✅    | ✅      |
| Advanced Analytics        | ❌   | ❌    | ✅      |
| Historical Data           | ❌   | 6mo   | ∞       |
| Real-time Updates         | ❌   | ❌    | ✅      |
| Webhook Notifications     | ❌   | ❌    | ✅      |
| Support                   | Com. | Email | Priority|
| Price                     | Free | $9.99 | $29.99  |

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Payment**: Stripe
- **Authentication**: API Keys (UUID)
- **Rate Limiting**: express-rate-limit
- **Environment**: dotenv
- **Build Tool**: tsc (TypeScript Compiler)

## Security Features

1. **API Key Authentication**: All protected endpoints require valid API key
2. **Rate Limiting**: Prevents abuse and ensures fair usage
3. **Input Validation**: Validates all user inputs
4. **Error Handling**: Secure error messages without sensitive data exposure
5. **Environment Variables**: Sensitive data stored in environment
6. **TypeScript**: Type safety to prevent common errors
7. **Webhook Verification**: Stripe webhook signature validation

## Deployment Considerations

For production deployment:

1. **Use PostgreSQL/MongoDB** for persistent storage
2. **Implement Redis** for distributed rate limiting
3. **Add monitoring** (Prometheus, Grafana)
4. **Set up logging** (Winston, ELK stack)
5. **Use HTTPS** with valid SSL certificates
6. **Implement backup** and disaster recovery
7. **Add health checks** and readiness probes
8. **Use Docker** for containerization
9. **Deploy to cloud** (AWS, GCP, Azure)
10. **Set up CI/CD** for automated deployments
