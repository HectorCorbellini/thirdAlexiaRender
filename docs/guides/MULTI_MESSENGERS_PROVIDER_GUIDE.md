# Multi-Messaging Provider System - Implementation Guide

## 📋 Overview

The ALEXIA platform now supports multiple messaging platforms, allowing you to switch between different communication channels (WhatsApp, Telegram) based on your business needs, user preferences, and technical requirements.

## 🎯 Supported Messaging Providers

### 1. **WhatsApp Business API** (Default)
- **API**: Meta WhatsApp Business API
- **Strengths**: Enterprise-grade, business-focused, rich media support
- **Cost**: Free for basic usage, pay-per-message for high volume
- **Speed**: Reliable, established infrastructure
- **Best for**: Business communication, customer service, enterprise deployments

### 2. **Telegram Bot API** (New!)
- **API**: Telegram Bot API
- **Strengths**: Free, fast, highly customizable, media-rich
- **Cost**: Completely free (no usage limits)
- **Speed**: Excellent (near-instantaneous)
- **Best for**: Development, testing, cost-sensitive deployments, media-heavy interactions

## 🏗️ Architecture

### Provider Pattern Implementation

```
backend/src/services/messaging/
├── MessagingProvider.ts       # Abstract base class
├── WhatsAppProvider.ts       # WhatsApp implementation
├── TelegramProvider.ts       # Telegram implementation
└── providerFactory.ts        # Factory for provider selection
```

### Key Components

1. **MessagingProvider (Abstract Class)**
   - Defines the contract all providers must implement
   - Main methods: `sendMessage()`, `onMessage()`, `initialize()`
   - Returns: Unified message interface across platforms

2. **ProviderFactory**
   - Creates the appropriate provider based on `MESSAGING_PLATFORM` env variable
   - Handles fallback to WhatsApp if provider not found
   - Centralized configuration management

3. **AIService (Platform-Agnostic)**
   - Works with any messaging provider
   - Uses factory to instantiate provider
   - No direct dependency on any specific messaging API

## ⚙️ Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Messaging Platform Selection
MESSAGING_PLATFORM=whatsapp  # Options: whatsapp, telegram

# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_WEBHOOK_URL=https://your-domain.com/api/whatsapp/webhook

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
TELEGRAM_POLLING=true  # true for polling, false for webhook-only
TELEGRAM_POLLING_INTERVAL=30000  # Polling interval in milliseconds
```

### Getting API Credentials

#### WhatsApp Business API
1. Visit https://developers.facebook.com/products/whatsapp
2. Create a Meta Business Account
3. Set up WhatsApp Business API
4. Generate access token and phone number ID

#### Telegram Bot API
1. Message @BotFather on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token
4. (Optional) Set up webhook URL

## 🚀 Usage

### Switching Providers

Simply change the `MESSAGING_PLATFORM` environment variable and restart the server:

```bash
# Use WhatsApp (enterprise, business-focused)
MESSAGING_PLATFORM=whatsapp ./start.sh

# Use Telegram (free, fast, media-rich)
MESSAGING_PLATFORM=telegram ./start.sh
```

### Programmatic Usage

The `AIService` automatically uses the configured messaging provider:

```typescript
import { AIService } from './services/ai';

const aiService = new AIService();

// This will use whichever messaging platform is configured
const response = await aiService.processMessage(message, user, conversation);
```

### Message Format

All messaging providers use a unified message format:

```typescript
interface Message {
  chatId: string;
  text: string;
  userId: string;
  platform: string;
  timestamp: Date;
  metadata?: {
    [platform: string]: any; // Platform-specific data
  };
}
```

## 📊 Platform Comparison

| Provider | Cost | Setup Complexity | Media Support | Rate Limits | Best For |
|----------|------|------------------|---------------|-------------|----------|
| WhatsApp | Pay-per-message | Medium | ⭐⭐⭐⭐⭐ | 1000/day | Enterprise, Business |
| Telegram | Completely Free | Low | ⭐⭐⭐⭐⭐ | Unlimited | Development, Media |

## 🎯 Use Case Recommendations

### Use **WhatsApp** when:
- ✅ You need enterprise-grade messaging
- ✅ Business communication is primary use case
- ✅ You want rich media support with business features
- ✅ Compliance and reliability are critical
- ✅ You're handling customer service workflows

### Use **Telegram** when:
- ✅ You want completely free messaging
- ✅ Speed and real-time communication are priorities
- ✅ You're in development or testing phase
- ✅ You need rich media support (photos, documents, etc.)
- ✅ Cost is a major consideration

## 🔧 Adding New Providers

To add a new messaging provider (e.g., Discord, Slack):

1. **Create Provider Class**
   ```typescript
   // backend/src/services/messaging/DiscordProvider.ts
   import { MessagingProvider, Message } from './MessagingProvider';

   export class DiscordProvider extends MessagingProvider {
     async sendMessage(chatId: string, text: string): Promise<boolean> {
       // Discord API implementation
     }

     async onMessage(handler: (message: Message) => Promise<void>): void {
       // Discord webhook/message handling
     }
   }
   ```

2. **Update Factory**
   ```typescript
   // backend/src/services/messaging/providerFactory.ts
   import { DiscordProvider } from './DiscordProvider';

   export function createMessagingProvider(): MessagingProvider {
     switch (platform.toLowerCase()) {
       case 'discord':
         return new DiscordProvider();
       // ... other cases
     }
   }
   ```

3. **Add Environment Variables**
   ```bash
   MESSAGING_PLATFORM=discord
   DISCORD_BOT_TOKEN=...
   DISCORD_WEBHOOK_URL=...
   ```

## 🧪 Testing

### Test Provider Availability

```bash
# Check if messaging platform is configured correctly
curl http://localhost:3001/health

# Send a test message
curl -X POST http://localhost:3001/test/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test the messaging provider", "platform": "telegram"}'
```

### Monitor Provider Performance

Check logs for provider information:
```bash
tail -f backend.log | grep "messaging provider"
```

## 🔍 Troubleshooting

### Issue: "TELEGRAM_BOT_TOKEN not configured"
**Solution**: Add your Telegram bot token to `.env` file

### Issue: WhatsApp messages not sending
**Solution**: Verify `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in `.env`

### Issue: Provider switching not working
**Solution**: Check `MESSAGING_PLATFORM` value in `.env` (case-sensitive)

### Issue: Webhook verification failing
**Solution**: Ensure webhook URLs are publicly accessible and match configuration

## 📈 Future Enhancements

Planned features for the Multi-Messaging Provider system:

1. **Automatic Failover**: If primary provider fails, automatically switch to backup
2. **Message Queuing**: Queue messages when provider is unavailable
3. **Provider Analytics**: Track message volume, success rates, and performance
4. **Smart Routing**: Route messages based on content type or user preference
5. **Bulk Messaging**: Support for sending to multiple users simultaneously
6. **Message Templates**: Pre-defined message templates for common scenarios

---

## 🌐 Scalable Multi-Bot, Business-Centric Management Architecture

To support thousands of bots (Telegram, WhatsApp, etc.) for many businesses, use this scalable, standardized approach:

### 1. Database-Driven Bot Registry
- Create a `Bots` table: `id`, `businessId`, `platform`, `botToken`, `status`, `lastActive`, `config`, etc.
- Each row = one bot instance, linked to a business (not a user or phone).
- Store all config in the DB, not in static env files.

### 2. API-First Bot Lifecycle Management
- REST endpoints for bot CRUD and control:
  - `POST /api/bots` (register new bot)
  - `GET /api/bots` (list/filter all bots)
  - `PATCH /api/bots/:id` (update config/status)
  - `POST /api/bots/:id/control` (start/stop/restart)
  - `GET /api/bots/:id/logs` (fetch logs/activity)
- All endpoints role-protected (JWT, business ownership, etc).

### 3. Dashboard: Multi-Bot Management UI
- "Messaging Integrations" section lists all bots for the logged-in business.
- Admins can add/configure/enable/disable/monitor any bot.
- No per-phone or per-user UI; everything is business/bot-centric.
- Bulk actions and aggregate stats possible.

### 4. Backend: Bot Orchestration Layer
- Bot manager service loads bot configs from DB at startup.
- Each bot runs as a managed process/worker (not a global singleton).
- Scalable to thousands of bots (with queue/workers or microservices if needed).
- No hardcoded tokens or static config.

### 5. Extensible for Any Platform
- `platform` field allows for multiple providers (Telegram, WhatsApp, Discord, etc.).
- Shared interfaces for bot lifecycle, config, and metrics.

---

**This approach keeps your stack modular, scalable, and business-focused—ready for SaaS and multi-tenant growth.**

## 🎓 Best Practices

1. **Choose WhatsApp** for production business applications
2. **Use Telegram** for development, testing, and media-rich interactions
3. **Configure Both** for maximum flexibility and redundancy
4. **Monitor Performance** regularly across platforms
5. **Test Thoroughly** when switching providers
6. **Have Backup Plans** for critical messaging scenarios

## 📚 Additional Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Telegram Bot API Reference](https://core.telegram.org/bots/api)
- [Messaging Platform Comparison](https://www.twilio.com/blog/whatsapp-vs-sms-vs-mms)

---

**Last Updated**: 2025-10-02
**Version**: 2.5.0
**Status**: ✅ Production Ready
