# Multi-AI Provider System - Implementation Guide

## 📋 Overview

The ALEXIA platform now supports multiple AI providers, allowing you to switch between different Large Language Models (LLMs) based on your needs for speed, cost, and capabilities.

## 🎯 Supported AI Providers

### 1. **OpenAI** (Default)
- **Models**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Strengths**: High quality responses, excellent reasoning
- **Cost**: Moderate to high
- **Speed**: Good
- **Best for**: Complex queries, nuanced conversations

### 2. **Groq** (New!)
- **Models**: llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768
- **Strengths**: Extremely fast inference (up to 10x faster than OpenAI)
- **Cost**: Very low (generous free tier)
- **Speed**: Excellent (near-instantaneous)
- **Best for**: Real-time chat, high-volume scenarios, cost-sensitive deployments

## 🏗️ Architecture

### Provider Pattern Implementation

```
backend/src/services/ai/providers/
├── AIProvider.ts              # Abstract base class
├── OpenAIProvider.ts          # OpenAI implementation
├── GroqProvider.ts            # Groq implementation
└── AIProviderFactory.ts       # Factory for provider selection
```

### Key Components

1. **AIProvider (Abstract Class)**
   - Defines the contract all providers must implement
   - Main method: `generateResponse(systemPrompt, userMessage, context)`
   - Returns: `{ response: string, tokensUsed: number, model: string }`

2. **AIProviderFactory**
   - Creates the appropriate provider based on `AI_PROVIDER` env variable
   - Handles fallback to OpenAI if provider not found
   - Centralized configuration management

3. **AIService (Refactored)**
   - Now provider-agnostic
   - Uses factory to instantiate provider
   - No direct dependency on any specific AI SDK

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:

```bash
# AI Provider Selection
AI_PROVIDER=groq  # Options: openai, groq

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo

# Groq Configuration
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama3-8b-8192
```

### Getting API Keys

#### OpenAI
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add billing information (required for production use)

#### Groq
1. Visit https://console.groq.com/keys
2. Sign up (free, no credit card required)
3. Create an API key
4. Enjoy generous free tier limits

## 🚀 Usage

### Switching Providers

Simply change the `AI_PROVIDER` environment variable and restart the server:

```bash
# Use Groq (fast and free)
AI_PROVIDER=groq ./start.sh

# Use OpenAI (high quality)
AI_PROVIDER=openai ./start.sh
```

### Programmatic Usage

The `AIService` automatically uses the configured provider:

```typescript
import { AIService } from './services/ai';

const aiService = new AIService();

// This will use whichever provider is configured
const response = await aiService.processMessage(message, user, conversation);
```

## 📊 Performance Comparison

| Provider | Avg Response Time | Cost per 1M tokens | Quality | Free Tier |
|----------|------------------|-------------------|---------|-----------|
| OpenAI GPT-3.5 | 2-5 seconds | $0.50 - $1.50 | ⭐⭐⭐⭐⭐ | Limited |
| OpenAI GPT-4 | 5-15 seconds | $30 - $60 | ⭐⭐⭐⭐⭐ | Limited |
| Groq Llama3-8b | 0.2-0.5 seconds | ~$0.05 | ⭐⭐⭐⭐ | Generous |
| Groq Llama3-70b | 0.5-1 second | ~$0.50 | ⭐⭐⭐⭐⭐ | Generous |

## 🎯 Use Case Recommendations

### Use **Groq** when:
- ✅ You need real-time, instant responses
- ✅ You're handling high message volumes
- ✅ You want to minimize costs
- ✅ You're in development/testing phase
- ✅ Response quality is "good enough"

### Use **OpenAI** when:
- ✅ You need the highest quality responses
- ✅ Complex reasoning is required
- ✅ Brand reputation depends on AI quality
- ✅ Budget is not a primary concern
- ✅ You need specific GPT-4 capabilities

## 🔧 Adding New Providers

To add a new AI provider (e.g., Anthropic Claude, Cohere):

1. **Create Provider Class**
   ```typescript
   // backend/src/services/ai/providers/ClaudeProvider.ts
   import { AIProvider, AIProviderConfig, AIResponse } from './AIProvider';
   
   export class ClaudeProvider extends AIProvider {
     async generateResponse(systemPrompt: string, userMessage: string): Promise<AIResponse> {
       // Implementation here
     }
   }
   ```

2. **Update Factory**
   ```typescript
   // backend/src/services/ai/providers/AIProviderFactory.ts
   import { ClaudeProvider } from './ClaudeProvider';
   
   export function createAIProvider(providerType?: string): AIProvider {
     switch (type.toLowerCase()) {
       case 'claude':
         return new ClaudeProvider(config);
       // ... other cases
     }
   }
   ```

3. **Add Environment Variables**
   ```bash
   AI_PROVIDER=claude
   CLAUDE_API_KEY=...
   CLAUDE_MODEL=claude-3-opus
   ```

## 🧪 Testing

### Test Provider Availability

```bash
# Check if Groq is configured correctly
curl http://localhost:3001/health

# Send a test message
curl -X POST http://localhost:3001/test/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test the AI provider"}'
```

### Monitor Provider Performance

Check logs for provider information:
```bash
tail -f backend.log | grep "AI provider"
```

## 🔍 Troubleshooting

### Issue: "GROQ_API_ERROR: Invalid API key"
**Solution**: Verify your `GROQ_API_KEY` in `.env` file

### Issue: Provider falls back to OpenAI unexpectedly
**Solution**: Check `AI_PROVIDER` value in `.env` (case-sensitive)

### Issue: Slow responses with Groq
**Solution**: Check your internet connection; Groq should be very fast

### Issue: TypeScript errors after adding provider
**Solution**: Run `pnpm install` to ensure all dependencies are installed

## 📈 Future Enhancements

Planned features for the Multi-AI Provider system:

1. **Automatic Failover**: If primary provider fails, automatically switch to backup
2. **Load Balancing**: Distribute requests across multiple providers
3. **Provider Analytics**: Track usage, costs, and performance per provider
4. **Smart Routing**: Automatically select best provider based on query type
5. **Caching Layer**: Cache common responses to reduce API calls
6. **Rate Limiting**: Prevent hitting provider rate limits

## 🎓 Best Practices

1. **Development**: Use Groq for fast iteration and testing
2. **Production**: Consider OpenAI for customer-facing interactions
3. **Hybrid Approach**: Use Groq for simple queries, OpenAI for complex ones
4. **Monitor Costs**: Track token usage across providers
5. **Test Thoroughly**: Ensure quality is acceptable before switching providers
6. **Have Fallbacks**: Always configure at least two providers

## 📚 Additional Resources

- [Groq Documentation](https://console.groq.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [LLM Comparison Guide](https://artificialanalysis.ai/)

---

**Last Updated**: 2025-10-02  
**Version**: 2.3.0  
**Status**: ✅ Production Ready
