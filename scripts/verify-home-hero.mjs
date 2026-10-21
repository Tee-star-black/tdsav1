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
    const copy = intro?.querySelector(':scope > p');
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
      actionsDisplay: actionStyles.display,
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
          top: rect.top,
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
  if (result.textAlign !== 'center' || result.titleAlign !== 'center' || result.copyAlign !== 'center') {
    throw new Error(`Hero text is not centered: ${JSON.stringify(result)}`);
  }
  if (result.actionsJustify !== 'center') {
    throw new Error(`Hero CTA group is not centered: ${result.actionsJustify}`);
  }
  if (result.titleCenterDelta > 12) {
    throw new Error(`Hero heading is visually off-center by ${result.titleCenterDelta.toFixed(1)}px`);
  }
  if (!result.heroWithinViewport || !result.actionsWithinViewport) {
    throw new Error('Hero or CTA group overflows the viewport');
  }
  if (result.buttonMetrics.some((button) => !button.visible)) {
    throw new Error('One or more hero buttons are not visible');
  }

  if (mobile) {
    const isCompactGrid = result.actionsDisplay === 'grid';
    if (!isCompactGrid && result.actionsDirection !== 'column') {
      throw new Error('Mobile hero CTAs must use an accessible compact grid or a stacked layout');
    }
    for (const button of result.buttonMetrics) {
      if (button.height < 44) throw new Error('Mobile CTA is below 44px touch height: ' + button.height + 'px');
      if (button.left < -1 || button.right > 391) throw new Error('Mobile CTA overflows the viewport');
    }
    if (isCompactGrid) {
      const [primary, second, third, last] = result.buttonMetrics;
      if (!primary || !second || !third || !last) throw new Error('Expected four care actions');
      if (primary.width < result.actionsWidth - 4 || last.width < result.actionsWidth - 4) {
        throw new Error('Primary and contact CTAs should occupy the full mobile row');
      }
      if (second.width > result.actionsWidth * .6 || third.width > result.actionsWidth * .6) {
        throw new Error('Middle care CTAs should share a compact row');
      }
      if (Math.abs(second.top - third.top) > 4) {
        throw new Error('Middle care CTAs are not aligned on one row');
      }
    } else {
      for (const button of result.buttonMetrics) {
        if (button.width < result.actionsWidth - 4) {
          throw new Error('Stacked CTA is not full width');
        }
      }
    }
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await waitForHero(desktop);
  const desktopResult = await inspectHero(desktop, false);
  assertHero(desktopResult, false);
  console.log('PASS homepage hero desktop centering');
  await desktop.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await waitForHero(mobile);
  const mobileResult = await inspectHero(mobile, true);
  assertHero(mobileResult, true);
  console.log('PASS homepage hero mobile centering and CTA optimisation');

  // Regression: the highlighted care must actually rotate without clicking arrows.
  await mobile.waitForFunction(() => (
    document.querySelector('.core-highlights-slider')?.dataset.tdsCarouselReady === 'true' &&
    document.querySelector('[data-core-slider-counter]')?.textContent.trim() === '01 / 04'
  ), null, { timeout: 5000 });
  await mobile.waitForFunction(() =>
    document.querySelector('[data-core-slider-counter]')?.textContent.trim() === '02 / 04',
    null, { timeout: 9000 });
  console.log('PASS homepage highlight automatically advances');

  // Regression: on a narrow phone this must be a genuinely scrollable rail.
  await mobile.waitForFunction(() =>
    Boolean(document.getElementById('tds-home-experience-refinement')),
    null, { timeout: 5000 });
  const careRail = await mobile.evaluate(() => {
    const rail = document.getElementById('carePathRail');
    if (!rail) throw new Error('Care path rail is absent');
    const style = getComputedStyle(rail);
    return {
      total: rail.scrollWidth,
      visible: rail.clientWidth,
      overflow: style.overflowX,
      touch: style.touchAction
    };
  });
  if (careRail.total <= careRail.visible + 50 || careRail.overflow !== 'auto') {
    throw new Error('Care cards are not horizontally scrollable: ' + JSON.stringify(careRail));
  }
  await mobile.locator('[data-care-rail-next]').click();
  await mobile.waitForFunction(() => document.getElementById('carePathRail').scrollLeft > 35, null, {
    timeout: 3000
  });
  await mobile.locator('[data-care-rail-prev]').click();
  await mobile.waitForFunction(() => document.getElementById('carePathRail').scrollLeft < 5, null, {
    timeout: 3000
  });
  console.log('PASS care path mobile rail scrolls in both directions');

  await mobile.locator('#tdsNavMenuButton').click();
  await mobile.locator('#tdsMobileMenuClose').click();
  if (await mobile.locator('#tdsNavMenuButton').getAttribute('aria-expanded') !== 'false') {
    throw new Error('Mobile menu close control did not collapse the drawer');
  }
  console.log('PASS mobile navigation close control');
  await mobile.close();
} finally {
  await browser.close();
}
