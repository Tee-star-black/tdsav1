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

function observeNonFatalErrors(page, file) {
  page.on('pageerror', error => {
    console.warn(`WARN ${path.relative(ROOT, file)} pageerror: ${error.message}`);
  });
}

async function waitForSharedNav(page, file) {
  await page.waitForFunction(() => document.body?.getAttribute('data-tds-canonical-nav-ready') === 'true', null, { timeout: 8000 });
  await page.waitForSelector('#tdsSiteNav[data-tds-canonical-nav="true"]', { state: 'attached', timeout: 3000 });
  await page.waitForFunction(() => {
    const nav = document.querySelector('#tdsSiteNav');
    if (!nav) return false;
    const style = getComputedStyle(nav);
    const rect = nav.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
  }, null, { timeout: 5000 });

  const counts = await page.evaluate(() => ({
    canonicalNavs: document.querySelectorAll('#tdsSiteNav[data-tds-canonical-nav="true"]').length,
    menuButtons: document.querySelectorAll('#tdsNavMenuButton').length,
    navLinks: document.querySelectorAll('#tdsNavLinks').length,
    offerTriggers: document.querySelectorAll('#tdsOfferTrigger').length,
    offerPanels: document.querySelectorAll('#tdsOfferPanel').length,
    backdrops: document.querySelectorAll('#tdsNavBackdrop').length,
  }));

  for (const [name, count] of Object.entries(counts)) {
    if (count !== 1) throw new Error(`${file}: expected exactly one ${name}, found ${count}`);
  }
}

async function waitForOfferVisible(page, file, mobile = false) {
  await page.waitForFunction((isMobile) => {
    const panel = document.querySelector('#tdsOfferPanel');
    if (!panel || !panel.classList.contains('is-open')) return false;
    const style = getComputedStyle(panel);
    const rect = panel.getBoundingClientRect();
    if (isMobile) return style.display !== 'none' && style.visibility !== 'hidden' && rect.height > 0;
    return style.display !== 'none' && style.visibility !== 'hidden' && style.pointerEvents !== 'none' && Number(style.opacity || 1) > 0.5 && rect.width > 0 && rect.height > 0;
  }, mobile, { timeout: 3000 }).catch(() => {
    throw new Error(`${file}: ${mobile ? 'mobile' : 'desktop'} What We Offer panel did not become visibly open`);
  });
}

async function testDesktop(browser, file) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(5000);
  observeNonFatalErrors(page, file);

  try {
    await page.goto(toUrl(file), { waitUntil: 'load', timeout: 15000 });
    await waitForSharedNav(page, file);

    await page.click('#tdsOfferTrigger');
    await waitForOfferVisible(page, file, false);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#tdsOfferPanel')?.classList.contains('is-open'), null, { timeout: 3000 });
  } finally {
    await page.close();
  }
}

async function testMobile(browser, file) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  page.setDefaultTimeout(5000);
  observeNonFatalErrors(page, file);

  try {
    await page.goto(toUrl(file), { waitUntil: 'load', timeout: 15000 });
    await waitForSharedNav(page, file);

    await page.click('#tdsNavMenuButton');
    await page.waitForFunction(() => {
      const links = document.querySelector('#tdsNavLinks');
      const style = links ? getComputedStyle(links) : null;
      return !!links && links.classList.contains('is-open') && style?.visibility !== 'hidden' && style?.pointerEvents !== 'none';
    }, null, { timeout: 3000 });

    const expanded = await page.getAttribute('#tdsNavMenuButton', 'aria-expanded');
    if (expanded !== 'true') throw new Error(`${file}: mobile menu button did not set aria-expanded=true`);

    await page.click('#tdsOfferTrigger');
    await waitForOfferVisible(page, file, true);

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#tdsNavLinks')?.classList.contains('is-open'), null, { timeout: 3000 });
  } finally {
    await page.close();
  }
}

const allFiles = await walk(ROOT);
const pages = [];
for (const file of allFiles.sort()) {
  const text = await readFile(file, 'utf8');
  if (!/<body\b/i.test(text)) continue;
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
