import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';
const pages = ['index.html','ecg247.html','virtual-consultations.html','doctors.html','nurses.html','patients.html','teledoctorsa-app.html','ehr.html','contact-us.html','shop.html'];
const browser = await chromium.launch({ headless: true });
await mkdir('website-screenshots', { recursive: true });
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    for (const file of pages) {
      await page.goto(`${base}/${file}`, { waitUntil: 'load' });
      await page.waitForSelector('#tdsSiteNav');
      await page.waitForFunction(() => getComputedStyle(document.body).getPropertyValue('--deep-navy').trim() === '#352638');
      const report = await page.evaluate(() => {
        const heading = document.querySelector('h1');
        const rect = heading?.getBoundingClientRect();
        const hero = document.querySelector('.core-highlights-slider,.hero-section,.hero-card,.hero');
        return {
          width: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          headingVisible: rect && rect.width > 0 && rect.x >= -1 && rect.right <= innerWidth + 1,
          headingColor: heading && getComputedStyle(heading).color,
          heroBackgroundImage: hero && getComputedStyle(hero).backgroundImage,
        };
      });
      assert.ok(report.documentWidth <= width + 1, `${file} overflows at ${width}px: ${JSON.stringify(report)}`);
      assert.ok(report.headingVisible, `${file} heading escapes viewport at ${width}px`);
      if (report.heroBackgroundImage) assert.equal(report.heroBackgroundImage, 'none', `${file} still uses a gradient hero`);

      if (file === 'index.html') {
        assert.equal(await page.locator('.core-slider-actions > a').count(), 2);
        assert.equal(await page.locator('#services .card').count(), 4);
        assert.equal(await page.locator('#services .card img').count(), 4);
        assert.equal(await page.locator('.tds-audience-links a').count(), 3);
        assert.equal(await page.locator('.tds-ecg-actions a').last().getAttribute('href'), 'https://ecg247.com/en/how-to-use-ecg247/');
        await page.getByRole('link', { name: 'Book a demo', exact: true }).click();
        await page.locator('#contactModal').waitFor({ state: 'visible' });
        assert.equal(await page.locator('#service').inputValue(), 'practice-demo');
        await page.keyboard.press('Escape');
        await page.locator('#contactModal').waitFor({ state: 'hidden' });
        const cards = await page.locator('#services .card').evaluateAll(cards => cards.map(el => {
          const r = el.getBoundingClientRect(); return { left: r.left, right: r.right };
        }));
        assert.ok(cards.every(r => r.left >= 0 && r.right <= width + 1), `Care cards escape viewport at ${width}px`);
      }
      if ([1440,390].includes(width) && ['index.html','ecg247.html','virtual-consultations.html','doctors.html','teledoctorsa-app.html'].includes(file)) {
        // Visit the full page to reveal scroll animations and load lazy images.
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < height; y += 700) { await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(70); }
        await page.evaluate(() => scrollTo(0,0));
        await page.waitForTimeout(200);
        await page.screenshot({ path: `website-screenshots/${file.replace('.html','')}-${width}.png`, fullPage: true });
      }
      console.log(`PASS refined design ${file} at ${width}px`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
