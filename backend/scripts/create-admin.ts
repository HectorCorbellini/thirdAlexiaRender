import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultBusiness() {
  try {
    // Check if any business exists
    const existingBusiness = await prisma.business.findFirst();

    if (existingBusiness) {
      console.log('✓ Default business already exists');
      console.log(`Name: ${existingBusiness.name}`);
      console.log(`ID: ${existingBusiness.id}`);
      return existingBusiness;
    }

    // Create default business
    const business = await prisma.business.create({
      data: {
        name: 'Default Business',
        description: 'Default business for bot management and operations',
        category: 'General',
        isActive: true,
        settings: {}
      }
    });

    console.log('✓ Default business created successfully!');
    console.log(`Name: ${business.name}`);
    console.log(`ID: ${business.id}`);
    return business;
  } catch (error) {
    console.error('Error creating default business:', error);
    throw error;
  }
}

async function createAdminUser(businessId: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@alexia.com' }
    });

    if (existingUser) {
      console.log('✓ Admin user already exists');
      console.log(`Email: admin@alexia.com`);
      console.log(`Role: ${existingUser.role}`);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@alexia.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'SUPERADMIN',
        isActive: true,
        businessId
      }
    });

    console.log('✓ Admin user created successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Password: admin123456`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

async function initialize() {
  try {
    console.log('🚀 Initializing Alexia...\n');
    
    // Step 1: Create default business
    console.log('📊 Step 1: Creating default business...');
    const business = await createDefaultBusiness();
    console.log('');
    
    // Step 2: Create admin user
    console.log('👤 Step 2: Creating admin user...');
    await createAdminUser(business.id);
    console.log('');
    
    console.log('✅ Initialization complete!');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initialize();
