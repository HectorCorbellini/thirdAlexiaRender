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

# Initialize default business and admin user
echo "🔧 Initializing default data..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDefaultBusiness() {
  try {
    const existingBusiness = await prisma.business.findFirst();
    if (existingBusiness) {
      console.log('✅ Default business already exists');
      return existingBusiness;
    }

    const business = await prisma.business.create({
      data: {
        name: 'Default Business',
        description: 'Default business for bot management and operations',
        category: 'General',
        isActive: true,
        settings: {}
      }
    });

    console.log('✅ Default business created successfully!');
    return business;
  } catch (error) {
    console.error('❌ Error creating default business:', error.message);
    throw error;
  }
}

async function ensureAdminUser(businessId) {
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
        isActive: true,
        businessId
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@alexia.com');
    console.log('   Password: admin123456');
  } catch (error) {
    console.error('❌ Error ensuring admin user:', error.message);
  }
}

async function initialize() {
  try {
    const business = await createDefaultBusiness();
    await ensureAdminUser(business.id);
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

initialize();
"

echo "🎉 Initialization complete!"
echo ""

# Start the application
echo "🚀 Starting backend server..."
exec node dist/index.js
