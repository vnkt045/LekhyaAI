const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Allow port to be passed as argument (node check-integrity.js 3000)
const port = process.argv[2] || 3001;
const BASE_URL = `http://localhost:${port}`;

async function checkUrl(url, expectedStatus = 200, name) {
    try {
        const res = await fetch(url);
        if (res.status === expectedStatus) {
            console.log(`✅ [PASS] ${name}: ${url} returned ${res.status}`);
            return true;
        } else {
            console.error(`❌ [FAIL] ${name}: ${url} returned ${res.status} (Expected ${expectedStatus})`);
            return false;
        }
    } catch (e) {
        console.error(`❌ [FAIL] ${name}: ${url} unreachable - ${e.message}`);
        return false;
    }
}

async function checkDatabase() {
    try {
        const userCount = await prisma.user.count();
        const companyCount = await prisma.company.count();
        console.log(`✅ [PASS] Database Connection: Connected`);
        console.log(`   - Users: ${userCount}`);
        console.log(`   - Companies: ${companyCount}`);
        return true;
    } catch (e) {
        console.error(`❌ [FAIL] Database Connection: Failed - ${e.message}`);
        return false;
    }
}

async function runIntegrityCheck() {
    console.log('🔄 Starting System Integrity Check...\n');

    let allPassed = true;

    // 1. Database Check
    if (!await checkDatabase()) allPassed = false;

    // 2. Server Health Check
    if (!await checkUrl(`${BASE_URL}/api/health`, 200, 'API Health')) allPassed = false;

    // 3. Public Pages Check
    if (!await checkUrl(`${BASE_URL}/login`, 200, 'Login Page')) allPassed = false;
    if (!await checkUrl(`${BASE_URL}/`, 200, 'Home Page Redirects/Loads')) allPassed = false;

    // 4. Security Check (Protected Routes should return 401 Unauthorized)
    if (!await checkUrl(`${BASE_URL}/api/vouchers`, 401, 'Security: Vouchers API')) allPassed = false;
    if (!await checkUrl(`${BASE_URL}/api/accounts`, 401, 'Security: Accounts API')) allPassed = false;
    if (!await checkUrl(`${BASE_URL}/api/reports/trial-balance`, 401, 'Security: Reports API')) allPassed = false;

    console.log('\n----------------------------------------');
    if (allPassed) {
        console.log('✅ SYSTEM INTEGRITY VERIFIED: All checks passed.');
    } else {
        console.error('❌ SYSTEM INTEGRITY FAILED: Some checks failed.');
        process.exit(1);
    }

    await prisma.$disconnect();
}

runIntegrityCheck();
