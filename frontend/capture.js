import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] });
    const page = await browser.newPage();

    // Screenshot 1: Desktop View - Splash Screen
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3001/TECHBOY-AI/', { waitUntil: 'networkidle0' });

    await delay(1000);
    await page.screenshot({ path: 'public/screenshot_1.png' });

    // Wait for splash screen to disappear naturally (10-12 seconds)
    console.log("Waiting for splash screen to disappear...");
    await delay(11000);

    // Screenshot 2: Chat UI Display
    await page.screenshot({ path: 'public/screenshot_2.png' });
    console.log("Captured screenshot 2");

    // Screenshot 3: Mobile Dashboard View
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await delay(1000);
    // Open sidebar on mobile
    try {
        const caps = await page.$$('button');
        for (let i = 0; i < 3; i++) {
            let class_attr = await page.evaluate(el => el.className, caps[i]);
            if (class_attr && class_attr.includes('hover:scale-110')) {
                await caps[i].click();
                break;
            }
        }
    } catch (e) { }
    await delay(1500);
    await page.screenshot({ path: 'public/screenshot_3.png' });
    console.log("Captured screenshot 3");

    // Switch back to desktop for Interactive UI
    await page.setViewport({ width: 1280, height: 800 });
    await delay(1000);
    // Click body to close sidebar
    await page.mouse.click(1000, 400);
    await delay(1000);

    // Focus input and add some text to show interaction
    try {
        await page.type('textarea, input[type="text"]', 'Tell me about Chimata Raghu Ram\'s skills.');
        await delay(500);
    } catch (e) { }

    // Screenshot 4: Interactive UI / Input element focused
    await page.screenshot({ path: 'public/screenshot_4.png' });
    console.log("Captured screenshot 4");

    await browser.close();
})();
