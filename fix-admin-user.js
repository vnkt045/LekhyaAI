
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'admin@lekhyaai.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'admin',
                password: hashedPassword
            },
            create: {
                email,
                name: 'Admin User',
                password: hashedPassword,
                role: 'admin'
            }
        });

        console.log(`✅ Fixed Admin User: ${user.email}`);
        console.log(`🔑 Password set to: ${password}`);
        console.log(`👑 Role set to: ${user.role}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
