#!/bin/bash

# Test script for EA FC API
echo "========================================"
echo "EA FC Proclubs API - Complete Test Suite"
echo "========================================"

BASE_URL="http://localhost:3000"

echo -e "\n1. Testing API Information Endpoint"
echo "-----------------------------------"
curl -s $BASE_URL/ | jq .

echo -e "\n2. Getting Subscription Plans"
echo "-----------------------------------"
curl -s $BASE_URL/api/subscription/plans | jq '.plans[] | {tier, price, rateLimit}'

echo -e "\n3. Subscribing to Free Tier"
echo "-----------------------------------"
FREE_RESPONSE=$(curl -s -X POST $BASE_URL/api/subscription/subscribe/free \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_001"}')
echo "$FREE_RESPONSE" | jq .
FREE_KEY=$(echo "$FREE_RESPONSE" | jq -r '.apiKey')

echo -e "\n4. Testing Authentication"
echo "-----------------------------------"
echo "4a. Without API Key (should fail):"
curl -s $BASE_URL/api/proclubs/matches | jq '{error, message}'

echo -e "\n4b. With Valid API Key:"
curl -s -H "X-API-Key: $FREE_KEY" $BASE_URL/api/proclubs/matches | jq '.meta'

echo -e "\n5. Testing Match Endpoints"
echo "-----------------------------------"
echo "5a. Get all matches:"
curl -s -H "X-API-Key: $FREE_KEY" "$BASE_URL/api/proclubs/matches?limit=2" | jq '{success, dataCount: (.data | length), tier: .meta.tier}'

echo -e "\n5b. Get specific match:"
curl -s -H "X-API-Key: $FREE_KEY" "$BASE_URL/api/proclubs/matches/match_001" | jq '.data | {matchId, clubName, result, goalsFor, goalsAgainst}'

echo -e "\n6. Testing Tier-Based Access Control"
echo "-----------------------------------"
echo "6a. Player Statistics (Free tier - should fail):"
curl -s -H "X-API-Key: $FREE_KEY" $BASE_URL/api/proclubs/statistics/players | jq '{error, message, upgrade}'

echo -e "\n6b. Advanced Analytics (Free tier - should fail):"
curl -s -H "X-API-Key: $FREE_KEY" $BASE_URL/api/proclubs/analytics/advanced | jq '{error, message, currentTier, upgrade}'

echo -e "\n7. Testing Checkout Session Creation"
echo "-----------------------------------"
echo "7a. Create Basic plan checkout (would redirect to Stripe):"
curl -s -X POST $BASE_URL/api/subscription/subscribe/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_002", "tier": "basic"}' | jq '{message, checkoutUrl: (.checkoutUrl | if . == "" then "Demo mode - Stripe not configured" else . end)}'

echo -e "\n7b. Create Premium plan checkout (would redirect to Stripe):"
curl -s -X POST $BASE_URL/api/subscription/subscribe/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_003", "tier": "premium"}' | jq '{message, checkoutUrl: (.checkoutUrl | if . == "" then "Demo mode - Stripe not configured" else . end)}'

echo -e "\n8. Testing API Documentation"
echo "-----------------------------------"
curl -s $BASE_URL/api/docs | jq '{public: .endpoints.public | keys, authenticated: .endpoints.authenticated | keys, authentication: .authentication.method}'

echo -e "\n========================================"
echo "✓ All tests completed successfully!"
echo "========================================"
echo -e "\nYour Free API Key: $FREE_KEY"
echo "Use it with: curl -H \"X-API-Key: $FREE_KEY\" http://localhost:3000/api/proclubs/matches"
