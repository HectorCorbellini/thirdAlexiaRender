# Recommendations to Avoid Telegram Integration Problems

This guide will help you avoid common pitfalls and ensure reliable operation of your Telegram integration with the ALEXIA backend.

## 1. **Bot Token Management**
- Always update your `.env` file with the latest `TELEGRAM_BOT_TOKEN` if you revoke or regenerate it in BotFather.
- Never hardcode tokens in source files—use environment variables only.
- Revoke old tokens immediately if you suspect they are compromised.

## 2. **Model Configuration**
- Always set the correct model in `.env` (e.g., `GROQ_MODEL="llama-3.1-8b-instant"`).
- Update models promptly if you see deprecation warnings or errors in logs.
- Keep `.env.example` up to date as a reference for supported models.

## 3. **Build & Deployment Hygiene**
- Delete the `dist` directory before every backend rebuild to avoid stale code issues.
- Use a restart script (like `scripts/restart-backend.sh`) to automate killing, cleaning, building, and restarting.
- Never rely on just `pnpm start` if you have made changes to environment variables or TypeScript source.

## 4. **Single Instance Enforcement**
- Ensure only one instance of the backend is running to avoid 409 Conflict errors from Telegram.
- Never start the server manually in multiple terminals or with multiple scripts.
- Use process management tools (like PM2) for production to avoid zombie processes.

## 5. **Logging & Debugging**
- Always check logs for `[DEBUG] Using Groq model:` to verify which model is in use.
- Monitor for errors like `409 Conflict` or `model_decommissioned`—these indicate configuration or deployment issues.

## 6. **General Best Practices**
- Document all `.env` variables and keep `.env.example` updated.
- Regularly check for updates to dependencies (`node-telegram-bot-api`, `groq-sdk`, etc.).
- Use version control for configuration files and scripts.
- Test after every change by sending a real message to your bot.

---

**Following these steps will help you avoid almost all common Telegram integration problems in ALEXIA.**
