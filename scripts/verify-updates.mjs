import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';
const guide = 'https://ecg247.com/en/how-to-use-ecg247/';
const browser = await chromium.launch({ headless: true });
try {
  for (const width of [1440, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(`${base}/index.html`);
    const launcher = page.locator('[data-updates-launcher]');
    const panel = page.locator('#tdsa-updates-panel');
    const notice = page.locator('[data-updates-notice]');
    await launcher.waitFor({ state: 'visible' });
    assert.equal(await panel.isVisible(), false);
    await notice.waitFor({ state: 'visible', timeout: 11000 });
    const beforeFocus = await page.evaluate(() => document.activeElement?.tagName);
    assert.notEqual(beforeFocus, 'BUTTON', 'Notice must not steal focus');
    await page.locator('[data-updates-dismiss]').click();
    assert.equal(await notice.isVisible(), false);
    await page.reload();
    await page.waitForTimeout(8200);
    assert.equal(await notice.isVisible(), false, 'Dismissed notice returned on reload');
    await launcher.click();
    await panel.waitFor({ state: 'visible' });
    assert.equal(await launcher.getAttribute('aria-expanded'), 'true');
    assert.equal(await panel.locator('a').first().getAttribute('href'), guide);
    assert.equal(await panel.locator('a').first().getAttribute('target'), '_blank');
    const bounds = await panel.boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1 && bounds.y >= 0 && bounds.y + bounds.height <= 844, 'Panel escapes viewport');
    // Native modal dialog must contain keyboard focus.
    for (let n = 0; n < 6; n++) {
      await page.keyboard.press('Tab');
      assert.ok(await panel.evaluate(el => el.contains(document.activeElement)), 'Focus escaped updates dialog');
    }
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('[data-updates-launcher]').getAttribute('aria-expanded') === 'false');
    assert.equal(await panel.isVisible(), false);
    assert.equal(await launcher.getAttribute('aria-expanded'), 'false');
    assert.ok(await launcher.evaluate(el => document.activeElement === el));
    await launcher.click();
    await page.locator('[data-updates-close]').click();
    assert.equal(await panel.isVisible(), false);
    await launcher.click();
    await page.mouse.click(2, 2);
    assert.equal(await panel.isVisible(), false, 'Backdrop did not close updates');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await notice.waitFor({ state: 'visible', timeout: 11000 });
    await page.locator('[data-updates-view]').click();
    assert.equal(await panel.isVisible(), true, 'Notification did not open updates');
    assert.equal(await notice.isVisible(), false);

    await page.goto(`${base}/ecg247.html`);
    const heroGuide = page.locator('.ecg-hero-actions a').filter({ hasText: 'View ECG247 Setup Guide' });
    await heroGuide.waitFor({ state: 'visible' });
    assert.equal(await heroGuide.getAttribute('href'), guide);
    assert.equal(await heroGuide.getAttribute('target'), '_blank');
    assert.match(await heroGuide.getAttribute('rel'), /noopener/);
    const ctaBounds = await heroGuide.boundingBox();
    assert.ok(ctaBounds.x >= 0 && ctaBounds.x + ctaBounds.width <= width + 1, 'ECG247 hero guide overflows');
    console.log(`PASS updates notice, persistence, dialog controls, keyboard focus and ECG247 hero guide at ${width}px`);
    await page.close();
  }
} finally {
  await browser.close();
}
