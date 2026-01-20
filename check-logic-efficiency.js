const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function measureTime(label, fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    console.log(`⏱️ [EFFICIENCY] ${label}: ${duration}ms`);
    return result;
}

async function checkLogic() {
    console.log('\n🧠 STARTING LOGICAL INTEGRITY CHECK...');
    let passed = true;

    // 1. Double Entry Rule (Total Debits = Total Credits)
    const vouchers = await measureTime('Fetch All Vouchers', () =>
        prisma.voucher.findMany({ include: { entries: true } })
    );

    console.log(`   Checking ${vouchers.length} vouchers for Double-Entry consistency...`);
    for (const v of vouchers) {
        let debit = 0;
        let credit = 0;
        v.entries.forEach(e => {
            debit += e.debit;
            credit += e.credit;
        });

        // Allow tiny floating point differences
        if (Math.abs(debit - credit) > 0.01) {
            console.error(`❌ [FAIL] Voucher ${v.voucherNumber}: Debits (${debit}) != Credits (${credit})`);
            passed = false;
        }
    }
    if (passed) console.log('✅ [PASS] All Vouchers are balanced.');

    // 2. Inventory Consistency (Current Stock = Sum of Movements)
    const items = await measureTime('Fetch Inventory Items & Movements', () =>
        prisma.inventoryItem.findMany({ include: { movements: true } })
    );

    console.log(`   Checking ${items.length} inventory items for Stock consistency...`);
    for (const item of items) {
        let calculatedStock = item.openingStock;
        item.movements.forEach(m => {
            if (m.type === 'IN') calculatedStock += m.quantity;
            else if (m.type === 'OUT') calculatedStock -= m.quantity;
            else if (m.type === 'ADJUST') calculatedStock += m.quantity; // adjustment can be positive or negative
        });

        if (Math.abs(calculatedStock - item.currentStock) > 0.01) {
            console.error(`❌ [FAIL] Item ${item.name} (${item.code}): DB Stock (${item.currentStock}) != Calculated (${calculatedStock})`);
            passed = false;
        }
    }
    if (passed) console.log('✅ [PASS] All Inventory Levels are consistent.');

    return passed;
}

async function checkEfficiency() {
    console.log('\n🚀 STARTING EFFICIENCY INTEGRITY CHECK...');

    // 1. Database Response Time
    await measureTime('Simple DB Query (User Count)', () => prisma.user.count());

    // 2. Complex Query (Trial Balance Simulation)
    await measureTime('Complex Query (Trial Balance Calculation)', async () => {
        const accounts = await prisma.account.findMany({
            include: { entries: true }
        });
        // Simulate calculation
        accounts.forEach(acc => {
            let balance = 0;
            acc.entries.forEach(e => {
                // Determine DR/CR based on account type generally, but just iterating is the workload
                balance += (e.debit - e.credit);
            });
        });
    });

    console.log('✅ [PASS] Efficiency metrics collected.');
}

async function run() {
    try {
        await checkLogic();
        await checkEfficiency();
        console.log('\n✨ INTEGRITY CHECKS COMPLETED.');
    } catch (e) {
        console.error('Fatal Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
