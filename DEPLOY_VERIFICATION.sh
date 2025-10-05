#!/bin/bash

# MiniHog Backend Deployment Verification Script
# Run this from your LOCAL machine after deployment

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${1:-http://YOUR_IP}"
API_KEY="mh_live_bf947c81aa941e864d35a23fd3fe9252"

echo "🔍 MiniHog Backend Verification"
echo "================================"
echo ""
echo "API URL: $API_URL"
echo ""

# Test 1: Health Check
echo "Test 1: Health Endpoint"
echo "-----------------------"
HEALTH=$(curl -s -w "\n%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$HEALTH" | tail -n1)
RESPONSE=$(echo "$HEALTH" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Health check successful"
    echo "   Response: $RESPONSE"
else
    echo -e "${RED}❌ FAIL${NC} - Health check failed (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 2: API Authentication
echo "Test 2: API Authentication"
echo "--------------------------"
AUTH=$(curl -s -w "\n%{http_code}" -H "X-API-Key: $API_KEY" "$API_URL/api/insights/overview")
HTTP_CODE=$(echo "$AUTH" | tail -n1)
RESPONSE=$(echo "$AUTH" | head -n-1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Authentication working"
    echo "   Got analytics data"
else
    echo -e "${RED}❌ FAIL${NC} - Authentication failed (HTTP $HTTP_CODE)"
    echo "   Response: $RESPONSE"
fi
echo ""

# Test 3: Active Users Endpoint
echo "Test 3: Active Users"
echo "--------------------"
USERS=$(curl -s -w "\n%{http_code}" -H "X-API-Key: $API_KEY" "$API_URL/api/insights/active-users?period=7d")
HTTP_CODE=$(echo "$USERS" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Active users endpoint working"
else
    echo -e "${RED}❌ FAIL${NC} - Active users failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 4: Top Events Endpoint
echo "Test 4: Top Events"
echo "------------------"
EVENTS=$(curl -s -w "\n%{http_code}" -H "X-API-Key: $API_KEY" "$API_URL/api/insights/top-events?limit=5")
HTTP_CODE=$(echo "$EVENTS" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Top events endpoint working"
else
    echo -e "${RED}❌ FAIL${NC} - Top events failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 5: Funnel Endpoint
echo "Test 5: Funnel Analysis"
echo "-----------------------"
FUNNEL=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "steps": [
      {"event": "pageview"},
      {"event": "purchase"}
    ],
    "time_window": "30d"
  }' \
  "$API_URL/api/insights/funnel")
HTTP_CODE=$(echo "$FUNNEL" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Funnel endpoint working"
else
    echo -e "${RED}❌ FAIL${NC} - Funnel failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 6: Retention Endpoint
echo "Test 6: Retention Analysis"
echo "--------------------------"
RETENTION=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "period_type": "weekly",
    "periods": 8
  }' \
  "$API_URL/api/insights/retention")
HTTP_CODE=$(echo "$RETENTION" | tail -n1)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Retention endpoint working"
else
    echo -e "${RED}❌ FAIL${NC} - Retention failed (HTTP $HTTP_CODE)"
fi
echo ""

# Test 7: CORS Check
echo "Test 7: CORS Headers"
echo "--------------------"
CORS=$(curl -s -I -H "Origin: https://example.com" "$API_URL/health" | grep -i "access-control")

if [ -n "$CORS" ]; then
    echo -e "${GREEN}✅ PASS${NC} - CORS headers present"
    echo "   $CORS"
else
    echo -e "${YELLOW}⚠️  WARNING${NC} - No CORS headers found"
    echo "   May need to configure CORS_ORIGIN"
fi
echo ""

# Summary
echo "================================"
echo "🎯 Verification Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. If all tests pass, your API is ready!"
echo "2. Use this URL in Vercel: $API_URL/api"
echo "3. Set NEXT_PUBLIC_API_URL=$API_URL/api"
echo "4. Set NEXT_PUBLIC_API_KEY=$API_KEY"
echo ""
