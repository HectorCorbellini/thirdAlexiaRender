import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
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
        isActive: true
      }
    });

    console.log('✓ Admin user created successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Password: admin123456`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
