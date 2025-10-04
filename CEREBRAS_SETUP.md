# Cerebras API Setup Guide

## Step 1: Sign Up for Cerebras Cloud

1. Visit: https://cloud.cerebras.ai/
2. Sign up for an account
3. Use promo code: `wemakedevs` (if available for FutureStack hackathon)
4. Verify your email

## Step 2: Get API Key

1. Log in to Cerebras Cloud Dashboard
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key (it will only be shown once)

## Step 3: Add API Key to Environment

Add to `/apps/api/.env`:
```bash
CEREBRAS_API_KEY=your_cerebras_api_key_here
```

## Step 4: Available Models

Cerebras supports multiple Llama models optimized for fast inference:

- **llama3.1-8b** - Fast, efficient for most tasks
- **llama-3.3-70b** - More powerful, better for complex queries
- **llama3.1-70b** - Alternative high-performance model

## Step 5: API Documentation

- API Docs: https://inference-docs.cerebras.ai/
- Supported models: https://cloud.cerebras.ai/models
- Rate limits: Check your dashboard for current tier limits

## Step 6: Test Connection

Run the test script:
```bash
npm run test:cerebras
```

## Notes

- Cerebras provides ultra-fast inference (tokens/second)
- Great for real-time AI features like natural language to SQL
- Free tier available for hackathons
- Uses OpenAI-compatible API format
