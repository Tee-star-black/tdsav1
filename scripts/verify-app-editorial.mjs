import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE_URL = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';
const pages = ['teledoctorsa-app.html', 'app.html'];
const viewports = [
  { label: 'desktop', width: 1440, height: 900, mobile: false, heroColumns: 2, featureColumns: 2 },
  { label: 'tablet', width: 820, height: 1024, mobile: false, heroColumns: 1, featureColumns: 2 },
  { label: 'mobile', width: 390, height: 844, mobile: true, heroColumns: 1, featureColumns: 1 },
  { label: 'small mobile', width: 320, height: 700, mobile: true, heroColumns: 1, featureColumns: 1 }
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

        const result = await page.evaluate(() => {
          const hero = document.querySelector('section.app-arrival');
          const nav = document.querySelector('#tdsSiteNav');
          const headline = hero?.querySelector('#app-sales-hero-heading');
          const overview = hero?.querySelector('.app-arrival-overview');
          const heroGrid = hero?.querySelector('.app-arrival-layout');
          const chapters = document.querySelector('.app-chapter-list');
          const features = document.querySelector('.app-chapter-features');
          const capability = features?.querySelector('.app-capability');
          const contact = document.querySelector('#tds-canonical-footer a[href="tel:+27698317264"]');
          if (!hero || !nav || !headline || !overview || !heroGrid || !chapters || !features || !capability || !contact) {
            return { error: 'Required patient-portal layout element missing' };
          }
          const box = element => element.getBoundingClientRect();
          const countCols = element => getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length;
          const sections = [...document.querySelectorAll('.app-arrival, .app-chapters, .app-device-section, .app-journey-section, .app-sales-book')];
          const headlineStyle = getComputedStyle(headline);
          return {
            heroBelowNav: box(headline).top + scrollY >= box(nav).height - 1,
            heroColumns: countCols(heroGrid),
            featureColumns: countCols(features),
            background: getComputedStyle(hero).backgroundColor,
            textColor: headlineStyle.color,
            fontFamily: headlineStyle.fontFamily,
            fontStyle: headlineStyle.fontStyle,
            featureBackground: getComputedStyle(capability).backgroundColor,
            overviewVisible: box(overview).height >= 180,
            chapters: document.querySelectorAll('.app-chapter').length,
            capabilities: document.querySelectorAll('.app-chapter .app-capability').length,
            devices: document.querySelectorAll('.app-device-item').length,
            steps: document.querySelectorAll('.app-journey-list > li').length,
            noMockup: !hero.querySelector('img, .app-portal-window, .app-arrival-phone'),
            noCursiveOrItalic: !document.querySelector('.app-arrival em, .app-chapters em, .app-journey-section em'),
            overflow: sections.filter(s => box(s).left < -2 || box(s).right > innerWidth + 2).map(s => s.className),
            mojibake: /Â©|Â·|â€”|â€™|�/.test(document.body.innerText),
            primaryDemo: !!hero.querySelector('a[href="https://demo-patient.teledoctorsa.co.za/"]'),
            guidedDemo: !!hero.querySelector('a[href="#book-demo"]'),
            phoneLink: !!hero.querySelector('a[href="tel:+27698317264"]'),
            leadForm: !!document.querySelector('#appDemoForm[action="/api/leads.php"]'),
            duplicatedGenericVisual: document.querySelectorAll('.tds-rescued-visual').length
          };
        });

        if (result.error || !result.heroBelowNav || result.heroColumns !== viewport.heroColumns ||
            result.featureColumns !== viewport.featureColumns ||
            result.background !== 'rgb(246, 248, 248)' ||
            result.fontStyle !== 'normal' || /Playfair|Georgia|cursive/i.test(result.fontFamily) ||
            result.featureBackground !== 'rgba(0, 0, 0, 0)' ||
            !result.overviewVisible || result.chapters !== 3 || result.capabilities !== 6 ||
            result.devices !== 6 || result.steps !== 4 || !result.noMockup || !result.noCursiveOrItalic ||
            result.overflow.length || result.mojibake || !result.primaryDemo || !result.guidedDemo ||
            !result.phoneLink || !result.leadForm || result.duplicatedGenericVisual !== 0) {
          throw new Error('App layout regression: ' + JSON.stringify(result));
        }

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
          throw new Error('Guided demo CTA did not open the lead form');
        }
        if (errors.length) console.warn('WARN ' + file + '/' + viewport.label + ': ' + errors.join('; '));
        console.log('PASS ' + file + ' / ' + viewport.label + ': clean typography, 3 feature groups, demo CTA');
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}
