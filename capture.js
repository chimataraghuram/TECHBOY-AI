import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
// Use explicit delays
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] });
    const page = await browser.newPage();

    // Screenshot 1: Desktop View - Splash Screen
    await page.setViewport({ width: 1280, height: 800 });
    // Navigate to the app
    await page.goto('http://localhost:3000/TECHBOY-AI/', { waitUntil: 'networkidle0' });

    // As soon as it loads, the splash screen should be visible
    await page.waitForSelector('video', { timeout: 10000 }).catch(() => { });
    await delay(1000); // Wait for animations to smooth out
    await page.screenshot({ path: 'public/screenshot_1.png' });

    // Wait for splash screen to disappear. The splash screen button often says "Enter Experience"
    try {
        await page.waitForSelector('button', { timeout: 15000 });
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('ENTER EXPERIENCE')) {
                await btn.click();
                break;
            }
        }
    } catch (e) { }

    await delay(4000); // Wait for chat UI to load

    // Screenshot 2: Chat UI Display
    await page.screenshot({ path: 'public/screenshot_2.png' });

    // Screenshot 3: Mobile Dashboard View
    // Change viewport to mobile
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await delay(1000);
    // Click sidebar toggle if closed
    try {
        const caps = await page.$$('button');
        // The first button in the header is usually the sidebar toggle. Let's just click the top-left one.
        // It has PanelLeft icon
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

    // Switch back to desktop for Interactive Jelly UI
    await page.setViewport({ width: 1280, height: 800 });
    await delay(1000);
    // Click body to close sidebar
    await page.mouse.click(1000, 400);
    await delay(1000);

    // Focus input
    try {
        await page.type('textarea, input[type="text"]', 'Hello, tell me about your projects!');
    } catch (e) { }
    await delay(500);
    // Screenshot 4: Interactive Jelly UI / Input element focused
    await page.screenshot({ path: 'public/screenshot_4.png' });

    await browser.close();
})();
