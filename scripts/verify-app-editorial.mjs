import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';
const pages = ['teledoctorsa-app.html', 'app.html'];
const viewports = [
  { label: 'desktop', width: 1440, height: 900, mobile: false, heroColumns: 2, capabilityColumns: 2 },
  { label: 'tablet', width: 820, height: 1024, mobile: false, heroColumns: 1, capabilityColumns: 2 },
  { label: 'mobile', width: 390, height: 844, mobile: true, heroColumns: 1, capabilityColumns: 1 },
  { label: 'small mobile', width: 320, height: 700, mobile: true, heroColumns: 1, capabilityColumns: 1 }
];

const browser = await chromium.launch({ headless: true });
try {
  for (const file of pages) {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.mobile,
        hasTouch: viewport.mobile
      });
      try {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(BASE_URL + '/' + file, { waitUntil: 'load', timeout: 18000 });
        await page.waitForSelector('#tdsSiteNav[data-tds-canonical-nav="true"]', { state: 'attached', timeout: 10000 });
        await page.waitForSelector('section.app-arrival', { state: 'visible', timeout: 8000 });
        await page.waitForFunction(() => [...document.querySelectorAll('.app-arrival-phone')]
          .every(img => img.complete && img.naturalWidth > 0), null, { timeout: 9000 });

        const result = await page.evaluate(() => {
          const hero = document.querySelector('section.app-arrival');
          const nav = document.querySelector('#tdsSiteNav');
          const headline = hero?.querySelector('#app-sales-hero-heading');
          const showcase = hero?.querySelector('.app-arrival-stage');
          const portal = hero?.querySelector('.app-portal-window');
          const heroGrid = hero?.querySelector('.app-arrival-main');
          const chapterList = document.querySelector('.app-chapter-list');
          const firstPair = document.querySelector('.app-chapter-features');
          const feature = firstPair?.querySelector('.app-capability');
          const contact = document.querySelector('#tds-canonical-footer a[href="tel:+27698317264"]');
          const img = document.querySelector('.app-arrival-phone');
          if (!hero || !nav || !headline || !showcase || !portal || !heroGrid || !chapterList || !feature || !contact || !img) {
            return { error: 'Essential portal page structure missing' };
          }
          const bounds = element => element.getBoundingClientRect();
          const columns = element => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length;
          const sections = [...document.querySelectorAll('.app-arrival, .app-chapters, .app-device-section, .app-journey-section, .app-sales-book')];
          return {
            heroBelowNav: bounds(headline).top + scrollY >= bounds(nav).height - 1,
            heroColumns: columns(heroGrid),
            heroNavy: getComputedStyle(hero.querySelector('.app-arrival-content')).backgroundColor === 'rgb(21, 35, 55)',
            stageCream: getComputedStyle(showcase).backgroundColor === 'rgb(233, 237, 234)',
            visualInsideStage: bounds(portal).left >= bounds(showcase).left - 1 &&
              bounds(portal).right <= bounds(showcase).right + 1 &&
              bounds(img).right <= bounds(showcase).right + 1,
            hasProductImage: img.complete && img.naturalWidth > 400,
            hasAccessibleCaption: !!hero.querySelector('.app-arrival-stage-note'),
            chapters: document.querySelectorAll('.app-chapter').length,
            capabilities: document.querySelectorAll('.app-chapter .app-capability').length,
            chapterPairs: document.querySelectorAll('.app-chapter-features').length,
            capabilityColumns: columns(firstPair),
            unboxedFeatures: getComputedStyle(feature).backgroundColor === 'rgba(0, 0, 0, 0)',
            devices: document.querySelectorAll('.app-device-item').length,
            steps: document.querySelectorAll('.app-journey-list > li').length,
            overflow: sections.filter(s => bounds(s).left < -2 || bounds(s).right > innerWidth + 2).map(s => s.className),
            mojibake: /Â©|Â·|â€”|â€™|�/.test(document.body.innerText),
            primaryDemo: hero.querySelector('a[href="https://demo-patient.teledoctorsa.co.za/"]') !== null,
            guidedDemo: hero.querySelector('a[href="#book-demo"]') !== null,
            phoneLink: hero.querySelector('a[href="tel:+27698317264"]') !== null,
            leadForm: document.querySelector('#appDemoForm[action="/api/leads.php"]') !== null,
            duplicatedGenericVisual: document.querySelectorAll('.tds-rescued-visual').length
          };
        });

        if (result.error || !result.heroBelowNav || result.heroColumns !== viewport.heroColumns ||
            !result.heroNavy || !result.stageCream || !result.visualInsideStage ||
            !result.hasProductImage || !result.hasAccessibleCaption ||
            result.chapters !== 3 || result.capabilities !== 6 ||
            result.chapterPairs !== 3 || result.capabilityColumns !== viewport.capabilityColumns ||
            !result.unboxedFeatures || result.devices !== 6 || result.steps !== 4 ||
            result.overflow.length || result.mojibake || !result.primaryDemo ||
            !result.guidedDemo || !result.phoneLink || !result.leadForm ||
            result.duplicatedGenericVisual !== 0) {
          throw new Error('App visual/functional regression: ' + JSON.stringify(result));
        }

        // Save real Chromium renders for design review. No patient data is used.
        if (file === 'teledoctorsa-app.html' && ['desktop', 'mobile'].includes(viewport.label)) {
          mkdirSync('artifacts', { recursive: true });
          await page.screenshot({
            path: 'artifacts/app-care-journey-' + viewport.label + '.png',
            fullPage: true,
            animations: 'disabled'
          });
        }

        await page.locator('.app-arrival a[href="#book-demo"]').click();
        if (new URL(page.url()).hash !== '#book-demo') {
          throw new Error('Guided-demo link did not open the request section');
        }
        if (errors.length) {
          console.warn('WARN ' + file + ' / ' + viewport.label + ' nonfatal scripts: ' + errors.join('; '));
        }
        console.log('PASS ' + file + ' / ' + viewport.label + ' - split hero, 3 chapters, 6 features, live CTA');
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
