# 🐳 Docker Deployment Guide for ALEXIA Platform

This guide explains how to run the ALEXIA platform using Docker and Docker Compose.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)

## 🚀 Quick Start

### Option 1: Using the Quick Start Script (Easiest)

```bash
./docker-start.sh
```

This script will:
- ✅ Check if Docker and Docker Compose are installed
- ✅ Create `.env` file from `.env.docker.example` if it doesn't exist
- ✅ Prompt you to configure required environment variables
- ✅ Build and start all services
- ✅ Wait for services to be ready
- ✅ Show you the service status and access URLs

### Option 2: Manual Setup

#### 1. Configure Environment Variables

Copy the example environment file and configure your settings:

```bash
cp .env.docker.example .env
```

Edit the `.env` file and add your actual API keys and configuration:

```bash
nano .env  # or use your preferred editor
```

**Required variables:**
- `JWT_SECRET`: A secure random string for JWT token signing (e.g., generate with `openssl rand -base64 32`)
- `TELEGRAM_BOT_TOKEN` or `WHATSAPP_ACCESS_TOKEN`: Depending on your messaging platform
- `GROQ_API_KEY` or `OPENAI_API_KEY`: Depending on your AI provider

**Optional but recommended:**
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Database credentials (defaults are provided)

#### 2. Build and Start Services

Build and start all services (PostgreSQL, Backend, Frontend):

```bash
docker compose up -d --build
```

This command will:
- ✅ Build Docker images for backend and frontend
- ✅ Pull the PostgreSQL image
- ✅ Create Docker volumes for persistent data
- ✅ Start all services in detached mode
- ✅ **Automatically run database migrations**
- ✅ **Automatically create admin user**

#### 3. Verify Services are Running

Check the status of all services:

```bash
docker compose ps
```

You should see three services running and healthy:
- `alexia-postgres` (PostgreSQL database)
- `alexia-backend` (Node.js API server)
- `alexia-frontend` (Nginx web server)

#### 4. Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

**Default Admin Credentials:**
- Email: `admin@alexia.com`
- Password: `admin123456`

> ⚠️ **Security Note**: Change the admin password after first login in production!

## 📊 Monitoring and Logs

### View Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Service Health

```bash
docker-compose ps
```

Healthy services will show `Up` status with health check information.

## 🛠️ Common Operations

### Stop Services

```bash
docker-compose down
```

### Stop Services and Remove Volumes (⚠️ This will delete all data)

```bash
docker-compose down -v
```

### Restart a Specific Service

```bash
docker-compose restart backend
```

### Rebuild After Code Changes

```bash
docker-compose up -d --build backend
```

### Access Service Shell

```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec postgres psql -U alexia_user -d alexia_db
```

### Run Database Migrations Manually

```bash
docker-compose exec backend npx prisma migrate deploy
```

### View Database Data

```bash
docker-compose exec postgres psql -U alexia_user -d alexia_db -c "SELECT * FROM \"User\";"
```

## 🔧 Troubleshooting

### Backend Fails to Start

1. Check if database is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. View backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify environment variables:
   ```bash
   docker-compose exec backend env | grep DATABASE_URL
   ```

### Database Connection Issues

1. Ensure PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Test database connection:
   ```bash
   docker-compose exec postgres pg_isready -U alexia_user
   ```

3. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

### Port Already in Use

If you get a "port already in use" error:

1. Check what's using the port:
   ```bash
   lsof -i :3000  # or :3001, :5432
   ```

2. Stop the conflicting service or change the port in `docker-compose.yml`

### Rebuild from Scratch

If you encounter persistent issues:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose rm -f

# Rebuild and start
docker-compose up -d --build
```

## 🌐 Production Deployment

### Environment Variables for Production

For production, ensure you:

1. Use strong, unique values for:
   - `JWT_SECRET`
   - `POSTGRES_PASSWORD`

2. Set `NODE_ENV=production`

3. Configure proper webhook URLs for messaging platforms

4. Use HTTPS for all external endpoints

### Security Considerations

- Never commit `.env` files to version control
- Use Docker secrets for sensitive data in production
- Enable firewall rules to restrict database access
- Use a reverse proxy (nginx, Traefik) for SSL termination
- Regularly update Docker images for security patches

### Scaling

To run multiple backend instances:

```bash
docker-compose up -d --scale backend=3
```

Note: You'll need to configure a load balancer (e.g., nginx) to distribute traffic.

## 📦 Docker Image Sizes

Approximate sizes after build:
- Backend: ~150MB (multi-stage build with Alpine)
- Frontend: ~25MB (nginx with static files)
- PostgreSQL: ~80MB (official Alpine image)

## 🔄 Updates and Maintenance

### Update Application Code

```bash
git pull origin main
docker-compose up -d --build
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U alexia_user alexia_db > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U alexia_user -d alexia_db
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure all required ports are available
4. Review the troubleshooting section above

For more help, refer to the main [README.md](./README.md) or open an issue on GitHub.
