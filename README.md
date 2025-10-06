# Alexia - AI-Powered Multi-Platform Business Messaging Platform

**Version 3.0.0** - Enterprise Multi-Bot Orchestration
<div align="center">
  <img src="https://raw.githubusercontent.com/lovable-community/alexia/main/public/logo.png" alt="Alexia Logo" width="150">
</div>

<p align="center">
  <strong>A production-ready full-stack platform for managing multi-platform business messaging with enterprise-grade bot orchestration, database-driven management, and comprehensive dashboard control.</strong>
</p>

---

### ✅ Project Status: Audit & Dockerization Complete (October 2025)

This project has undergone a complete code audit and has been fully containerized with Docker. Key improvements include:

-   **Full Code Refactor**: Modernized architecture, removed dead code, and cleaned up dependencies.
-   **Dockerized Deployment**: The entire application (backend, frontend) now runs in Docker, solving previous deployment inconsistencies and ensuring a stable, reproducible environment.
-   **Ready for Production**: The application is stable and can be reliably deployed to any cloud provider that supports Docker.

**To get started with the recommended Docker setup, see the [Docker Deployment](#-docker-deployment-recommended) section below.**

---

**📦 [GitHub Repository](https://github.com/HectorCorbellini/first-Alexia-for-Render) | 🚀 [Live Deployment](#) | 📚 [Documentation](#)**

---

> 📚 **[Backend Integration Analysis](./BACKEND_INTEGRATION_ANALYSIS.md)** | 🏗️ **[Architecture Review](./ARCHITECTURE_REVIEW.md)** | 📝 **[Session Summary](./SUMMARIES/SESSION_SUMMARY.md)** | 📋 **[Changelog](./CHANGELOG.md)** | 🤖 **[AI System Guide](./MULTI_AI_PROVIDER_GUIDE.md)**

## ✨ Key Features
### 🚀 **Enterprise Multi-Bot Orchestration**
- **Database-Driven Bot Management**: Centralized bot configuration and lifecycle management
- **Multi-Platform Support**: WhatsApp, Telegram, Discord, Slack (extensible)
- **BotManager Service**: Centralized bot lifecycle with start/stop/restart controls
- **REST API**: Complete CRUD operations for bot management
- **Real-time Dashboard**: Live bot status monitoring and control

### 🤖 **Enterprise AI System**
- **Intelligent Intent Detection**: 12 specialized categories for fashion/retail businesses
- **Centralized Prompt Management**: Dynamic, context-aware prompt system
- **Advanced Conversation Context**: Maintains conversation history and context
- **Robust Fallback System**: Graceful degradation when AI providers fail

### 📱 **Multi-Platform Messaging**
- **WhatsApp Integration**: Meta Business Cloud API for business messaging
- **Telegram Integration**: Full Telegram Bot API support with media handling
- **Provider Abstraction**: Hot-swappable messaging platforms via environment configuration
- **Unified Message Interface**: Consistent message format across all platforms
- **Enhanced Error Handling**: Robust fallback and retry mechanisms

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: JWT with [bcrypt](https://www.npmjs.com/package/bcryptjs)
- **Validation**: [Joi](https://joi.dev/)
- **Logging**: [Winston](https://github.com/winstonjs/winston)
- **AI Providers**: [OpenAI API](https://openai.com/) + [Groq API](https://groq.com/) (ultra-fast inference)
- **Messaging**: [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp) + [Telegram Bot API](https://core.telegram.org/bots/api)

### Frontend
- **Framework**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) with [Vite](https://vitejs.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) built on [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Deployment

### 🐳 Docker Deployment (Recommended)

The easiest and most reliable way to deploy ALEXIA is using Docker. Everything is automated - database setup, migrations, and admin user creation happen automatically!

**Option 1: Using the quick start script (Recommended)**
```bash
./docker-start.sh
```

**Option 2: Manual Docker Compose**
```bash
# Copy and configure environment variables
cp .env.docker.example .env
# Edit .env with your configuration (JWT_SECRET, bot tokens, API keys)

# Build and start all services
docker compose up -d --build
```

**Services included:**
- ✅ PostgreSQL database (with automatic migrations)
- ✅ Backend API server (with auto admin user creation)
- ✅ Frontend dashboard

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

**Default Admin Credentials:**
- Email: `admin@alexia.com`
- Password: `admin123456`

📚 **[Complete Docker Guide](./DOCKER_README.md)** - Detailed instructions, troubleshooting, and production tips.

#### Why Docker? (Solves Previous Deployment Issues)

Docker deployment provides several critical advantages over traditional platform deployments:

- **✅ Environment Consistency**: Eliminates "works on my machine" problems - same environment everywhere
- **✅ No Missing Files**: All dependencies and files are packaged together in the container
- **✅ Reproducible Builds**: Every deployment is identical, preventing backend-frontend inconsistencies
- **✅ Isolated Dependencies**: No conflicts with system packages or Node.js versions
- **✅ Easy Rollback**: Can quickly revert to previous working versions
- **✅ Platform Independence**: Deploy to any cloud provider that supports Docker (AWS, GCP, Azure, DigitalOcean, Fly.io, Railway, etc.)
- **✅ Local Development Parity**: Development environment matches production exactly

**Previous deployment issues with Render/Vercel (now solved):**
- ❌ Files missing after git clone → ✅ All files packaged in Docker image
- ❌ Backend-frontend version mismatches → ✅ Both built together with locked versions
- ❌ Environment-specific bugs → ✅ Consistent environment across all deployments

---

### Multi-Platform Deployment Abstraction

This project uses a **deployment abstraction layer** that makes it easy to deploy to different platforms without code changes:

```
deployments/
├── render/           # Render-specific configuration
│   ├── render.yaml
│   └── deploy-to-render.sh
└── railway/          # Railway-specific configuration
    ├── railway.toml
    └── deploy-to-railway.sh
```

### Quick Deployment

**Deploy to any platform with one command:**
```bash
./deploy.sh
```

This script will:
- ✅ Detect available deployment platforms
- ✅ Copy configuration files to root directory
- ✅ Run platform-specific setup instructions

---

### Render (Production)

**🚀 [Deploy to Render](https://dashboard.render.com)**

#### **Services Deployed:**
- **Backend API** (`alexia-backend`) - Node.js/Express server
- **PostgreSQL Database** (`alexia-db`) - Managed database
- **Frontend Dashboard** (`alexia-frontend`) - React/Vite application

#### **Quick Deploy:**
1. **Run**: `./deploy.sh` and select **"render"**
2. **Go to Render Dashboard** and connect your GitHub repository
3. **Set Environment Variables**:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `GROQ_API_KEY`: Your Groq AI API key
   - `OPENAI_API_KEY`: Your OpenAI API key (optional)

#### **Access URLs (After Deployment):**
- **Frontend Dashboard**: `https://alexia-frontend.onrender.com`
- **Backend API**: `https://alexia-backend.onrender.com`
- **Database**: Internal PostgreSQL service

---

### Repository Information

**📦 GitHub**: [https://github.com/HectorCorbellini/first-Alexia-for-Render](https://github.com/HectorCorbellini/first-Alexia-for-Render)

**🔄 Last Updated**: Version 3.0.0 - Enterprise Multi-Bot Orchestration

**📊 Repository Size**: ~15MB (includes all dependencies and documentation)

**🏗️ Architecture**: Monorepo with backend/frontend separation using pnpm workspaces

**🚀 Deployment**: Multi-platform abstraction layer supporting Render, Railway, and more

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v8 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd alexia-
    ```

2.  **Install dependencies:**
    ```sh
    pnpm install
    ```

3.  **Configure environment variables:**
    ```sh
    # Backend
    cp backend/.env.example backend/.env
    # Edit backend/.env with your database credentials and API keys

    # Frontend
    cp frontend/.env.example frontend/.env
    ```

4.  **Set up the database:**
    ```sh
    cd backend
    npx prisma generate
    npx prisma migrate dev
    cd ..
    ```

5.  **Start both servers:**
    ```sh
    ./start.sh
    ```

    This will start:
    - Backend API on `http://localhost:3001`
    - Frontend on `http://localhost:3000`

6.  **Login credentials:**
    - Email: `admin@alexia.com`
    - Password: `admin123456`

### Alternative: Manual Start

```sh
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

### ⚠️ Important Notes

-   **Log Files**: The application, particularly the backend, can generate large log files over time (e.g., `backend/logs/` and `backend.log`). These files are correctly ignored by Git but can consume significant disk space on your local machine. It's good practice to periodically clear these files if you notice they are growing too large.

## 🤖 AI System Configuration

### Multi-Provider Setup

Alexia supports multiple AI providers for maximum flexibility:

#### **Groq (Recommended - Ultra Fast)**
```sh
# In backend/.env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_your_groq_key_here
GROQ_MODEL=llama3-8b-8192
```

#### **OpenAI (High Quality)**
```sh
# In backend/.env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

### AI Features
- **🎯 Intent Detection**: 12 specialized categories for fashion/retail
- **📝 Smart Prompts**: Context-aware prompt management
- **💬 Conversation Memory**: Maintains context across messages
- **🛡️ Fallback System**: Robust error handling and fallbacks
- **⚡ Performance**: 0.2-0.5s responses with Groq vs 2-5s with OpenAI

## 📱 Messaging Platform Configuration

### Multi-Platform Setup

ALEXIA supports multiple messaging platforms for maximum flexibility:

#### **Telegram (Bot API)**
```sh
# In backend/.env
MESSAGING_PLATFORM=telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
TELEGRAM_POLLING=true
TELEGRAM_POLLING_INTERVAL=30000
```

#### **WhatsApp (Business API)**
```sh
# In backend/.env
MESSAGING_PLATFORM=whatsapp
WHATSAPP_ACCESS_TOKEN=your_meta_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

### Messaging Features
- **📨 Message Handling**: Unified interface across all platforms
- **🖼️ Media Support**: Photo, document, audio, video handling
- **🛡️ Error Recovery**: Network failures, rate limits, retry logic
- **📊 Statistics**: Provider status and performance monitoring

## Project Structure

### Scripts Organization

All utility and admin scripts are now organized under the `/scripts/` directory:

- `/scripts/backend/` — Backend/server/admin scripts (restart, cleanup, start, stop, debug)
- `/scripts/telegram/` — Telegram utility and testing scripts
- `/scripts/SCRIPTS_OVERVIEW.md` — Documentation describing all scripts and usage

See [SCRIPTS_OVERVIEW.md](scripts/SCRIPTS_OVERVIEW.md) for details and usage instructions.

The project follows a monorepo structure with separate backend and frontend:

```
alexia-/
{{ ... }}
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic (AI, WhatsApp, Location)
│   │   │   ├── ai/             # 🆕 Enhanced AI System
│   │   │   │   ├── AIAgent.ts          # Main AI orchestrator
│   │   │   │   ├── IntentDetector.ts   # Intent classification
│   │   │   │   ├── PromptManager.ts    # Prompt management
│   │   │   │   └── providers/          # AI provider implementations
│   │   │   │       ├── AIProvider.ts   # Abstract provider interface
│   │   │   │       ├── GroqProvider.ts # Groq implementation
│   │   │   │       └── OpenAIProvider.ts # OpenAI implementation
│   │   ├── routes/             # API endpoints
│   │   ├── middlewares/        # Auth, validation, error handling
│   │   └── utils/              # Helpers and utilities
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── scripts/                # Utility scripts
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── contexts/           # Global state (AuthContext)
│   │   ├── services/           # API client
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route pages
│   │   └── types/              # TypeScript interfaces
│   └── public/                 # Static assets
├── SUMMARIES/                  # Session summaries and reports
├── MULTI_AI_PROVIDER_GUIDE.md  # 🆕 AI system documentation
├── pnpm-workspace.yaml         # pnpm workspace config
├── start.sh                    # Startup script
└── stop.sh                     # Shutdown script
```

## 🔮 Roadmap

### ✅ Completed (v3.0.0)
- [x] **Backend Multi-Bot Orchestration**: Database-driven bot management with BotManager service
- [x] **Multi-Platform Messaging**: Telegram integration with scalable architecture
- [x] **REST API for Bots**: Complete CRUD operations and lifecycle control
- [x] **Real-time Dashboard**: Live bot status monitoring and control
- [x] **Multi-AI Provider System**: Hot-swappable OpenAI/Groq integration
- [x] **AIAgent Class**: Main AI orchestrator with intent detection
- [x] **Enhanced Intent Detection**: 12 specialized categories for fashion/retail
- [x] **Centralized Prompt Management**: Dynamic, context-aware prompts
- [x] **Backend API**: Full RESTful API with Express + PostgreSQL
- [x] **Authentication**: JWT-based auth with role-based access control
- [x] **Database**: 9 models with Prisma ORM
- [x] **API Integration**: 3/5 major components migrated to real API
- [x] **Security**: bcrypt, JWT, CORS, Helmet.js, input validation

### 🔄 In Progress
- [ ] **Complete API Migration**: Migrate remaining 2 components (SimpleAnalytics, WhatsAppSimulator)
- [ ] **CRUD Operations**: Add create/edit/delete forms for businesses
- [ ] **TypeScript Improvements**: Create proper interfaces matching Prisma models

### 📋 Planned
- [ ] **Testing**: Add unit tests, component tests, and E2E tests
- [ ] **WhatsApp Migration**: Replace whatsapp-web.js with Meta Business Cloud API
- [ ] **Complete Core Modules**: Finalize `Campaigns`, `CRM Connections`, and `Billing` sections
- [ ] **API Documentation**: Add Swagger/OpenAPI documentation
- [ ] **Performance**: Add caching layer (Redis) and rate limiting

## 🔧 Troubleshooting

### Login Fails with "Login failed. Please check your credentials."

**Symptoms:**
- The backend API is running and healthy
- Credentials are correct (`admin@alexia.com` / `admin123456`)
- Login works with `curl` but fails in the browser

**Cause:**
This is a CORS (Cross-Origin Resource Sharing) issue. When `NODE_ENV=production`, the backend was configured to only allow requests from `https://your-domain.com`, blocking requests from `http://localhost:3000`.

**Solution:**
The CORS configuration in `backend/src/index.ts` has been updated to allow localhost connections in all environments:

```typescript
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://your-domain.com',
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

**To apply the fix:**
```bash
docker compose up -d --build backend
```

### Other Common Issues

For more troubleshooting help, see the [Docker README](./DOCKER_README.md) troubleshooting section.

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or want to report a bug, please open an issue.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
