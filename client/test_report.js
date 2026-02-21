const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting automated test for Fault Reporting...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
        // 1. Login
        await page.goto('http://localhost:5173/login');
        await page.type('input[type="email"]', 'student@tms.com');
        await page.type('input[type="password"]', 'student123');
        await page.click('button[type="submit"]');

        // Wait for navigation to dashboard/report
        await page.waitForNavigation();
        console.log('Logged in successfully.');

        // 2. Navigate to Report Fault
        await page.goto('http://localhost:5173/report');
        await page.waitForSelector('form');

        // 3. Fill out the form
        await page.type('input[name="pcNumber"]', 'TEST-LAB-01');
        await page.select('select[name="issueCategory"]', 'Hardware');
        await page.select('select[name="priority"]', 'high');
        await page.type('textarea[name="description"]', 'The monitor is completely cracked.');

        // 4. Submit
        await page.click('button[type="submit"]');

        // 5. Wait for success message
        await page.waitForSelector('.bg-green-100', { timeout: 5000 });
        const successText = await page.$eval('.bg-green-100', el => el.innerText);
        console.log('Form submission result:', successText);

        if (successText.includes('successfully')) {
            console.log('✅ Automated Test Passed: Fault Reporting End-to-End');
        } else {
            console.error('❌ Automated Test Failed: Unexpected success message');
        }

    } catch (error) {
        console.error('❌ Automated Test Failed with error:', error);
    } finally {
        await browser.close();
    }
})();
