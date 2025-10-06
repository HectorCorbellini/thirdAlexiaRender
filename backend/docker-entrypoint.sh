#!/bin/sh
# =============================================================================
# Backend Docker Entrypoint - Handles migrations and initialization
# =============================================================================

set -e

echo "🚀 Starting ALEXIA Backend..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until nc -z localhost 5432; do
  echo "   PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Check if admin user exists, if not create it
echo "👤 Checking for admin user..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function ensureAdminUser() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@alexia.com' }
    });

    if (existingUser) {
      console.log('✅ Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    await prisma.user.create({
      data: {
        email: 'admin@alexia.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'SUPERADMIN',
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@alexia.com');
    console.log('   Password: admin123456');
  } catch (error) {
    console.error('❌ Error ensuring admin user:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

ensureAdminUser();
"

echo "🎉 Initialization complete!"
echo ""

# Start the application
echo "🚀 Starting backend server..."
exec node dist/index.js
