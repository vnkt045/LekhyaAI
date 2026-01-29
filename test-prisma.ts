import { db } from './src/lib/db';

async function main() {
    try {
        console.log('Testing Prisma Client...');
        // Try to filter by companyId. Value doesn't matter, we just want to see if it throws "Unknown argument"
        const account = await db.account.findFirst({
            where: {
                companyId: 'cuid_test_123'
            }
        });
        console.log('Prisma Client accepted companyId!');
    } catch (error) {
        console.error('Prisma Client Error:', error);
    }
}

main();
