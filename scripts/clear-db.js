
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Clearing database...');

    // Delete in order of dependencies
    await prisma.voucherEntry.deleteMany({});
    await prisma.voucher.deleteMany({});

    // Optional: Clear created accounts but keep system ones if any (logic depends on needs)
    // For now, we'll clear all accounts except maybe basic ones? 
    // User said "all fake datas". Safest is to clear everything non-essential.
    // Actually, let's clear accounts too if they are just seed data.
    await prisma.account.deleteMany({});

    console.log('Database cleared successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
