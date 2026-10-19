import { chromium } from 'playwright';

const BASE_URL = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';
const pages = ['teledoctorsa-app.html', 'app.html'];
const viewports = [
  { label: 'desktop', width: 1440, height: 900, mobile: false, expectedColumns: 2 },
  { label: 'tablet', width: 820, height: 1024, mobile: false, expectedColumns: 2 },
  { label: 'mobile', width: 390, height: 844, mobile: true, expectedColumns: 1 },
  { label: 'small mobile', width: 320, height: 700, mobile: true, expectedColumns: 1 }
];

const browser = await chromium.launch({ headless: true });
try {
  for (const pageFile of pages) {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.mobile,
        hasTouch: viewport.mobile
      });
      try {
        await page.goto(BASE_URL + '/' + pageFile, { waitUntil: 'load', timeout: 20000 });
        await page.waitForSelector('#tdsSiteNav[data-tds-canonical-nav="true"]', { state: 'attached', timeout: 10000 });
        await page.waitForSelector('.app-editorial-hero', { state: 'visible', timeout: 10000 });
        await page.locator('.app-editorial-visuals').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.querySelectorAll('.app-editorial-visuals img')]
          .every(img => img.complete && img.naturalWidth > 0), null, { timeout: 8000 });

        const result = await page.evaluate(() => {
          const hero = document.querySelector('.app-editorial-hero');
          const nav = document.querySelector('#tdsSiteNav');
          const heading = hero?.querySelector('h1');
          const capGrid = document.querySelector('.app-capability-grid');
          const story = document.querySelector('.app-story');
          const heroImages = [...document.querySelectorAll('.app-editorial-visuals img')];
          if (!nav || !hero || !heading || !capGrid || !story) {
            return { error: 'Required app editorial elements are missing' };
          }
          const rect = element => element.getBoundingClientRect();
          const siteSections = [...document.querySelectorAll('.app-editorial-hero, .app-story, .app-device-section, .app-journey-section, .app-sales-book')];
          return {
            heroBelowNav: rect(heading).top + window.scrollY - rect(nav).height >= -1,
            heroCssApplied: getComputedStyle(hero).backgroundColor === 'rgb(247, 246, 242)',
            capabilities: document.querySelectorAll('.app-capability').length,
            featured: document.querySelectorAll('.app-capability-featured').length,
            devices: document.querySelectorAll('.app-device-item').length,
            steps: document.querySelectorAll('.app-journey-list > li').length,
            capColumns: getComputedStyle(capGrid).gridTemplateColumns.split(' ').filter(Boolean).length,
            roomySpacing: parseFloat(getComputedStyle(story).paddingTop) >= 55,
            missingImages: heroImages.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src),
            overflowedSections: siteSections.filter(s => rect(s).left < -2 || rect(s).right > window.innerWidth + 2).map(s => s.className),
            corruptedText: /Â©|Â·|â€”|â€™|�/.test(document.body.innerText),
            demoLink: hero.querySelector('a[href="#book-demo"]') !== null,
            portalDemoLink: [...hero.querySelectorAll('a')].some(a => a.href === 'https://demo-patient.teledoctorsa.co.za/'),
            appForm: document.querySelector('#appDemoForm[action="/api/leads.php"]') !== null,
            contactNumber: !!document.querySelector('.app-editorial-hero a[href="tel:+27698317264"]') &&
              !!document.querySelector('#tds-canonical-footer a[href="tel:+27698317264"]'),
            injectedGenericHero: document.querySelectorAll('.tds-rescued-visual').length
          };
        });

        if (result.error || !result.heroBelowNav || !result.heroCssApplied ||
            result.capabilities !== 6 || result.featured !== 2 ||
            result.devices !== 6 || result.steps !== 4 ||
            result.capColumns !== viewport.expectedColumns ||
            !result.roomySpacing || result.missingImages.length ||
            result.overflowedSections.length || result.corruptedText ||
            !result.demoLink || !result.portalDemoLink || !result.appForm ||
            !result.contactNumber || result.injectedGenericHero !== 0) {
          throw new Error('App layout assertion failed: ' + JSON.stringify(result));
        }

        await page.locator('.app-editorial-hero a[href="#book-demo"]').click();
        if (new URL(page.url()).hash !== '#book-demo') {
          throw new Error('Guided demo CTA does not scroll to the lead form');
        }
        console.log('PASS ' + pageFile + ' / ' + viewport.label);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
