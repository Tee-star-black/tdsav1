import { chromium } from 'playwright';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BASE_URL = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(full);
  }
  return files;
}

function toUrl(file) {
  const relative = path.relative(ROOT, file).split(path.sep).map(encodeURIComponent).join('/');
  return `${BASE_URL}/${relative}`;
}

async function waitForSharedNav(page, file) {
  await page.waitForSelector('body[data-tds-canonical-nav-ready="true"]', { timeout: 8000 });
  await page.waitForSelector('nav[data-tds-canonical-nav="true"]', { timeout: 3000 });
  await page.waitForFunction(() => {
    const nav = document.querySelector('nav[data-tds-canonical-nav="true"]');
    const panel = document.querySelector('#sidePanel');
    return !!nav && !!panel && panel.dataset.tdsMegaReady === 'true';
  }, null, { timeout: 5000 });

  const counts = await page.evaluate(() => ({
    canonicalNavs: document.querySelectorAll('nav[data-tds-canonical-nav="true"]').length,
    hamburgerButtons: document.querySelectorAll('#hamburgerBtn').length,
    navLinks: document.querySelectorAll('#navLinks').length,
    offerTriggers: document.querySelectorAll('#openPanelBtn').length,
    offerPanels: document.querySelectorAll('#sidePanel').length,
  }));

  for (const [name, count] of Object.entries(counts)) {
    if (count !== 1) throw new Error(`${file}: expected exactly one ${name}, found ${count}`);
  }
}

async function testDesktop(browser, file) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    await page.goto(toUrl(file), { waitUntil: 'domcontentloaded', timeout: 12000 });
    await waitForSharedNav(page, file);

    await page.click('#openPanelBtn');
    await page.waitForFunction(() => document.querySelector('#sidePanel')?.classList.contains('active'), null, { timeout: 3000 });

    const visible = await page.$eval('#sidePanel', el => {
      const style = getComputedStyle(el);
      return style.visibility !== 'hidden' && style.pointerEvents !== 'none' && Number(style.opacity || 1) > 0;
    });
    if (!visible) throw new Error(`${file}: desktop What We Offer panel did not become visible`);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#sidePanel')?.classList.contains('active'), null, { timeout: 3000 });

    if (errors.length) throw new Error(`${file}: browser errors: ${errors.join(' | ')}`);
  } finally {
    await page.close();
  }
}

async function testMobile(browser, file) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    await page.goto(toUrl(file), { waitUntil: 'domcontentloaded', timeout: 12000 });
    await waitForSharedNav(page, file);

    await page.click('#hamburgerBtn');
    await page.waitForFunction(() => document.querySelector('#navLinks')?.classList.contains('active'), null, { timeout: 3000 });

    const expanded = await page.getAttribute('#hamburgerBtn', 'aria-expanded');
    if (expanded !== 'true') throw new Error(`${file}: mobile hamburger did not set aria-expanded=true`);

    await page.click('#openPanelBtn');
    await page.waitForFunction(() => document.querySelector('#sidePanel')?.classList.contains('active'), null, { timeout: 3000 });

    const mobilePanelVisible = await page.$eval('#sidePanel', el => getComputedStyle(el).display !== 'none');
    if (!mobilePanelVisible) throw new Error(`${file}: mobile What We Offer panel did not open`);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#navLinks')?.classList.contains('active'), null, { timeout: 3000 });

    if (errors.length) throw new Error(`${file}: browser errors: ${errors.join(' | ')}`);
  } finally {
    await page.close();
  }
}

const allFiles = await walk(ROOT);
const pages = [];
for (const file of allFiles.sort()) {
  const text = await readFile(file, 'utf8');
  if (!/<body\b/i.test(text)) continue;
  // Tiny redirect shim pages are not independently interactive; their destination is tested separately.
  if (/http-equiv=["']refresh["']/i.test(text)) continue;
  pages.push(file);
}

if (!pages.length) throw new Error('No HTML pages found for navbar verification');

const browser = await chromium.launch({ headless: true });
const failures = [];
try {
  for (const file of pages) {
    const rel = path.relative(ROOT, file);
    try {
      await testDesktop(browser, file);
      await testMobile(browser, file);
      console.log(`PASS ${rel}`);
    } catch (error) {
      failures.push(`${rel}: ${error.message}`);
      console.error(`FAIL ${rel}: ${error.message}`);
    }
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error('\nNavbar verification failures:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log(`\nNavbar verification passed on ${pages.length} interactive HTML pages at desktop and mobile widths.`);
