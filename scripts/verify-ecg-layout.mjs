import { chromium } from 'playwright';

const BASE_URL = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch({ headless: true });
try {
  for (const { name, viewport, isMobile } of [
    { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
  ]) {
    const page = await browser.newPage({ viewport, isMobile, hasTouch: isMobile });
    try {
      await page.goto(`${BASE_URL}/ecg247.html`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForSelector('#tds-layout-refresh', { state: 'attached', timeout: 8000 });

      const result = await page.evaluate(() => {
        const main = document.querySelector('#ecg247-main');
        if (!main) return { error: 'ECG247 main element missing' };

        const guide = main.querySelector('.ecg24-guide-bar');
        const hero = main.querySelector('.ecg24-hero');
        const heading = main.querySelector('.ecg24-section-header');
        const contactCopy = main.querySelector('.ecg24-contact-inner > div:first-child');
        const details = main.querySelector('.ecg24-explainer .ecg24-section-heading');
        const heroCopy = main.querySelector('.ecg24-hero-copy');
        const steps = main.querySelector('.ecg24-steps li');
        const guideLink = main.querySelector('.ecg24-guide-link');

        if (!guide || !hero || !heading || !contactCopy || !details || !heroCopy || !steps || !guideLink) {
          return { error: 'Essential ECG247 page content is missing' };
        }

        const overflowingWraps = [...main.querySelectorAll('.ecg24-wrap')]
          .map(el => el.getBoundingClientRect())
          .some(rect => rect.left < -2 || rect.right > window.innerWidth + 2);

        return {
          guideFirst: main.firstElementChild === guide,
          guideUrl: guideLink.href,
          injectedHeroCount: document.querySelectorAll('.tds-rescued-visual').length,
          mainHeroCount: main.querySelectorAll('.ecg24-hero').length,
          headingCount: main.querySelectorAll('h1').length,
          heroAlignment: getComputedStyle(heroCopy).textAlign,
          sectionAlignment: getComputedStyle(heading).textAlign,
          detailsAlignment: getComputedStyle(details).textAlign,
          stepsAlignment: getComputedStyle(steps).textAlign,
          contactAlignment: getComputedStyle(contactCopy).textAlign,
          overflowingWraps,
        };
      });

      if (result.error) throw new Error(result.error);
      if (!result.guideFirst || !result.guideUrl.startsWith('https://ecg247.com/en/how-to-use-ecg247/')) {
        throw new Error('Official ECG247 setup guide is not the first page section');
      }
      if (result.injectedHeroCount !== 0 || result.mainHeroCount !== 1 || result.headingCount !== 1) {
        throw new Error('ECG247 still has duplicate hero content: ' + JSON.stringify(result));
      }
      const expectedHeroAlignment = isMobile ? 'center' : 'left';
      if (result.heroAlignment !== expectedHeroAlignment ||
          result.sectionAlignment !== 'center' ||
          result.detailsAlignment !== 'left' ||
          result.stepsAlignment !== 'left' ||
          result.contactAlignment !== 'center') {
        throw new Error('ECG247 text alignment is inconsistent: ' + JSON.stringify(result));
      }
      if (result.overflowingWraps) throw new Error('ECG247 content overflows the viewport');

      console.log('PASS ECG247 ' + name + ': single hero, setup guide first, consistent alignment');
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
