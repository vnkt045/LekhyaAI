import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdminUser() {
    console.log('🔐 Creating default admin user...');

    const hashedPassword = await bcrypt.hash('admin@123', 10);

    const adminUser = await prisma.adminUser.upsert({
        where: { username: 'superadmin' },
        update: {},
        create: {
            username: 'superadmin',
            email: 'superadmin@lekhyaai.com',
            password: hashedPassword,
            role: 'super_admin',
            isActive: true,
        },
    });

    console.log('✅ Admin user created:');
    console.log('   Username:', adminUser.username);
    console.log('   Email:', adminUser.email);
    console.log('   Password: admin@123');
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');
}

createDefaultAdminUser()
    .catch((e) => {
        console.error('Error creating admin user:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
