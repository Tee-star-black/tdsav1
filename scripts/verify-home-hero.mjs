import { chromium } from 'playwright';

const BASE_URL = process.env.TDSA_TEST_BASE_URL || 'http://127.0.0.1:4173';

async function waitForHero(page) {
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'load', timeout: 15000 });
  await page.waitForSelector('.core-highlights-slider .core-slider-intro', { state: 'visible', timeout: 8000 });
  await page.waitForFunction(() => {
    const style = document.getElementById('tds-home-hero-center-loader');
    return !!style;
  }, null, { timeout: 5000 });
  await page.waitForTimeout(150);
}

async function inspectHero(page, mobile) {
  return page.evaluate((isMobile) => {
    const hero = document.querySelector('.core-highlights-slider');
    const intro = document.querySelector('.core-highlights-slider .core-slider-intro');
    const title = intro?.querySelector('h1');
    const copy = intro?.querySelector(':scope > p:not(.tds-eyebrow)');
    const actions = intro?.querySelector('.core-slider-actions');
    const buttons = actions ? [...actions.querySelectorAll('a')] : [];

    if (!hero || !intro || !title || !copy || !actions || !buttons.length) {
      return { error: 'Homepage hero structure is incomplete' };
    }

    const heroRect = hero.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    const viewportCenter = window.innerWidth / 2;
    const titleCenter = titleRect.left + titleRect.width / 2;
    const actionStyles = getComputedStyle(actions);

    return {
      textAlign: getComputedStyle(intro).textAlign,
      titleAlign: getComputedStyle(title).textAlign,
      copyAlign: getComputedStyle(copy).textAlign,
      actionsJustify: actionStyles.justifyContent,
      actionsDirection: actionStyles.flexDirection,
      titleCenterDelta: Math.abs(titleCenter - viewportCenter),
      heroWithinViewport: heroRect.left >= -1 && heroRect.right <= window.innerWidth + 1,
      actionsWithinViewport: actionsRect.left >= -1 && actionsRect.right <= window.innerWidth + 1,
      buttonMetrics: buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          right: rect.right,
          visible: rect.width > 0 && rect.height > 0 && getComputedStyle(button).visibility !== 'hidden',
        };
      }),
      actionsWidth: actionsRect.width,
      mobile: isMobile,
    };
  }, mobile);
}

function assertHero(result, mobile) {
  if (result.error) throw new Error(result.error);
  if (result.textAlign !== (mobile ? 'center' : 'left') || result.titleAlign !== (mobile ? 'center' : 'left') || result.copyAlign !== (mobile ? 'center' : 'left')) {
    throw new Error(`Hero text is not centered: ${JSON.stringify(result)}`);
  }
  if (result.actionsJustify !== (mobile ? 'center' : 'flex-start')) {
    throw new Error(`Hero CTA group is not centered: ${result.actionsJustify}`);
  }
  if (mobile && result.titleCenterDelta > 12) {
    throw new Error(`Hero heading is visually off-center by ${result.titleCenterDelta.toFixed(1)}px`);
  }
  if (!result.heroWithinViewport || !result.actionsWithinViewport) {
    throw new Error('Hero or CTA group overflows the viewport');
  }
  if (result.buttonMetrics.some((button) => !button.visible)) {
    throw new Error('One or more hero buttons are not visible');
  }

  if (mobile) {
    if (result.actionsDirection !== 'column') {
      throw new Error(`Mobile hero buttons are not stacked: ${result.actionsDirection}`);
    }
    for (const button of result.buttonMetrics) {
      if (button.height < 44) throw new Error(`Mobile CTA is below 44px touch height: ${button.height}px`);
      if (button.width < result.actionsWidth - 4) {
        throw new Error(`Mobile CTA is not full width: ${button.width}px of ${result.actionsWidth}px`);
      }
      if (button.left < -1 || button.right > 391) {
        throw new Error('Mobile CTA overflows the viewport');
      }
    }
  }
}

async function assertCarousel(page) {
  const activeId = () => page.locator('.core-slide.active').getAttribute('id');
  const initial = await activeId();
  await page.waitForFunction(id => document.querySelector('.core-slide.active')?.id !== id, initial, { timeout: 8500 });
  if (await page.locator('.core-slide:not([hidden])').count() !== 1) throw new Error('Carousel shows more than one slide');
  const active = await activeId();
  const selectedDot = await page.locator('[data-core-slide-to][aria-current="true"]').getAttribute('aria-controls');
  if (selectedDot !== active) throw new Error('Carousel dot does not match the automatic slide');

  await page.locator('[data-core-slider-pause]').click();
  await page.mouse.move(0, 0);
  const pausedId = await activeId();
  await page.waitForTimeout(6500);
  if (await activeId() !== pausedId) throw new Error('Carousel advanced while paused');
  await page.locator('[data-core-slider-pause]').click();
  await page.mouse.move(0, 0);
  await page.waitForFunction(id => document.querySelector('.core-slide.active')?.id !== id, pausedId, { timeout: 8500 });

  await page.locator('[data-core-slide-to="3"]').click();
  if (await activeId() !== 'core-slide-records') throw new Error('Carousel dot selection failed');
  await page.locator('[data-core-slider-next]').click();
  if (await activeId() !== 'core-slide-consultations') throw new Error('Carousel next did not wrap');
  await page.locator('[data-core-slider-prev]').click();
  if (await activeId() !== 'core-slide-records') throw new Error('Carousel previous did not wrap');
}

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await waitForHero(desktop);
  const desktopResult = await inspectHero(desktop, false);
  assertHero(desktopResult, false);
  console.log('PASS homepage hero desktop centering');
  await assertCarousel(desktop);
  console.log('PASS desktop carousel automatic rotation, pause/resume, dots and arrows');
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await waitForHero(mobile);
  const mobileResult = await inspectHero(mobile, true);
  assertHero(mobileResult, true);
  console.log('PASS homepage hero mobile centering and CTA optimisation');
  await assertCarousel(mobile);
  await mobile.locator('.core-highlights-slider').evaluate(slider => {
    const touch = x => new Touch({ identifier: 1, target: slider, clientX: x, clientY: 300 });
    slider.dispatchEvent(new TouchEvent('touchstart', { touches: [touch(260)], bubbles: true }));
    slider.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touch(100)], bubbles: true }));
  });
  if (await mobile.locator('.core-slide.active').getAttribute('id') !== 'core-slide-consultations') throw new Error('Mobile carousel swipe failed');
  console.log('PASS mobile carousel automatic rotation, pause/resume, dots, arrows and swipe');
  await mobile.close();

  const reduced = await browser.newPage({ reducedMotion: 'reduce' });
  await waitForHero(reduced);
  const stillId = await reduced.locator('.core-slide.active').getAttribute('id');
  await reduced.waitForTimeout(6500);
  if (await reduced.locator('.core-slide.active').getAttribute('id') !== stillId) throw new Error('Reduced-motion preference was ignored');
  await reduced.locator('[data-core-slider-next]').click();
  if (await reduced.locator('.core-slide.active').getAttribute('id') === stillId) throw new Error('Manual navigation failed with reduced motion');
  console.log('PASS reduced-motion preference with manual navigation');
  await reduced.close();
} finally {
  await browser.close();
}
