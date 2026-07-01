import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = '/home/yahir/.gemini/antigravity/brain/070a3cdc-97d2-4cff-a2f6-3906228a9e32';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
    executablePath: '/usr/bin/google-chrome-stable',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  const filePath = resolve(__dirname, 'index.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for fonts and images to load
  await page.waitForFunction(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000)); // Let animations settle

  // Screenshot 1: Full page
  await page.screenshot({
    path: resolve(outputDir, 'screenshot_fullpage.png'),
    fullPage: true,
  });
  console.log('✅ Full page screenshot saved');

  // Screenshot 2: Hero section (viewport top)
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: resolve(outputDir, 'screenshot_hero.png'),
  });
  console.log('✅ Hero section screenshot saved');

  // Screenshot 3: Scroll to middle (skills/experience cards)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: resolve(outputDir, 'screenshot_middle.png'),
  });
  console.log('✅ Middle section screenshot saved');

  // Screenshot 4: Scroll to bottom (education + hobbies)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: resolve(outputDir, 'screenshot_bottom.png'),
  });
  console.log('✅ Bottom section screenshot saved');

  await browser.close();
  console.log('Done!');
})();
