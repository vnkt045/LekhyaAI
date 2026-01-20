const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Allow port to be passed as argument (node scripts/capture.js 3000)
const port = process.argv[2] || 3001;
const BASE_URL = `http://127.0.0.1:${port}`;
const OUTPUT_DIR = path.join(__dirname, '../screenshots');

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const PAGES = [
    { name: '01_Login', path: '/login', public: true },
    { name: '02_Dashboard', path: '/', public: false },
    { name: '03_Vouchers_List', path: '/vouchers', public: false },
    { name: '04_Voucher_Create', path: '/vouchers/new', public: false },
    { name: '05_Ledger_List', path: '/masters/ledger', public: false },
    { name: '06_Employees', path: '/masters/payroll-info/employees/display', public: false },
    { name: '07_Report_ProfitLoss', path: '/reports/profit-loss', public: false },
    { name: '08_Report_TrialBalance', path: '/reports/trial-balance', public: false },
    { name: '09_Report_StockAging', path: '/reports/stock-aging', public: false },
    { name: '10_Settings', path: '/settings', public: false },
    { name: '11_System_Report', path: '/settings/system-report', public: false },
    { name: '12_Owner_Dashboard', path: '/owner', public: true, special: 'owner' },

    // New Modules
    { name: '13_GST_Reports', path: '/gst', public: false },
    { name: '14_Balance_Sheet', path: '/reports/balance-sheet', public: false },
    { name: '15_Stock_Summary', path: '/reports/stock-summary', public: false },
    { name: '16_Ratio_Analysis', path: '/reports/ratio-analysis', public: false },
    { name: '17_Banking', path: '/banking', public: false },
    { name: '18_Chart_of_Accounts', path: '/masters/accounts-info', public: false },
    { name: '19_Day_Book', path: '/daybook', public: false },
    { name: '20_Godowns', path: '/masters/godowns', public: false },
    { name: '21_Stock_Item_Create', path: '/masters/inventory/items/create', public: false },
    { name: '22_Activate_Page', path: '/activate', public: true }
];

(async () => {
    console.log('📸 Starting Screenshot Capture (Expanded)...');
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1920, height: 1080 }
    });
    const page = await browser.newPage();

    // 1. Login
    console.log('🔑 Logging in...');
    await page.goto(`${BASE_URL}/login`);

    // Check if we are already on dashboard (cookie persistence?)
    if (page.url().includes('/login')) {
        await page.type('input[type="email"]', 'admin@lekhyaai.com');
        await page.type('input[type="password"]', 'admin123');

        await Promise.all([
            page.waitForNavigation(),
            page.click('button[type="submit"]') // Adjust selector if needed
        ]);
    }
    console.log('✅ Logged in!');

    // 2. Iterate Pages
    for (const p of PAGES) {
        console.log(`📸 Capturing ${p.name}...`);
        try {
            await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle0', timeout: 60000 });

            // Special handling for Owner Page
            if (p.special === 'owner') {
                const isLocked = await page.$('input[type="password"]');
                if (isLocked) {
                    await page.type('input[type="password"]', 'LekhyaOwner2026');
                    const buttons = await page.$$('button');
                    for (const btn of buttons) {
                        const text = await page.evaluate(el => el.textContent, btn);
                        if (text.includes('Access')) {
                            await btn.click();
                            break;
                        }
                    }
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            // Waiting a bit for animations
            await new Promise(r => setTimeout(r, 2000));

            await page.screenshot({
                path: path.join(OUTPUT_DIR, `${p.name}.png`),
                fullPage: true
            });
        } catch (e) {
            console.error(`❌ Failed to capture ${p.name}:`, e.message);
        }
    }

    console.log('🎉 Capture Complete! Check the /screenshots folder.');
    await browser.close();
})();
