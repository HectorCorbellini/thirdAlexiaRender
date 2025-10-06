# SCRIPTS_OVERVIEW.md

This document describes the project scripts, their locations, and usage patterns.

---

## **/scripts/backend/**

- **restart-backend.sh**: Cleanly restarts the backend (kills Node, cleans dist, rebuilds, restarts)
- **cleanup.sh**: General cleanup utilities for the backend environment
- **debug_auth.sh**: Tools for debugging authentication flows
- **start.sh**: Main backend startup script
- **stop.sh**: Stops the backend server gracefully

## **/scripts/telegram/**

- **get-chat-id.js**: Utility to capture your Telegram chat/user ID
- **simple-telegram-test.js**: Basic connectivity test for Telegram bot
- **test-telegram-bot.js**: Comprehensive Telegram bot test suite

---

## **Best Practices**
- Run all scripts from the project root for consistent path resolution
- Use `restart-backend.sh` after major backend or .env changes
- Use Telegram scripts for bot testing/configuration only
- See `TELEGRAM_INTEGRATION_RECOMMENDATIONS.md` for Telegram-specific reliability tips

---

**This structure keeps scripts organized, discoverable, and easy to maintain.**
