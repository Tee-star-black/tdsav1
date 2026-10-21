// Regression checks for TeleDoctorSA's homepage interactive surfaces.
// Uses only Node built-ins so it also runs on the existing GitHub Actions runner.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const home = readFileSync('index.html', 'utf8');
const carouselCode = readFileSync('scripts/home-core-slide-images.js', 'utf8');
const nav = readFileSync('scripts/canonical-nav.js', 'utf8');
const loader = readFileSync('scripts/rebuild-images.js', 'utf8');
const heroCss = readFileSync('styles/home-experience.css', 'utf8');
const navCss = readFileSync('styles/mobile-navigation.css', 'utf8');

for (const marker of [
  'data-core-slider-prev', 'data-core-slider-next', 'data-core-slider-toggle',
  'data-core-slider-counter', 'data-care-rail-prev', 'data-care-rail-next',
  'id="carePathRail"'
]) {
  assert.ok(home.includes(marker), 'Homepage missing interactive control: ' + marker);
}
assert.match(heroCss, /#services\s+\.services-grid[\s\S]*?overflow-x:\s*auto\s*!important/);
assert.match(heroCss, /#services\s+\.services-grid[\s\S]*?touch-action:\s*auto\s*!important/);
assert.match(navCss, /#tdsSiteNav\s+#tdsNavLinks[\s\S]*?overflow-y:\s*auto\s*!important/);
assert.ok(nav.includes('tdsMobileMenuClose') && nav.includes('getClientRects().length'),
  'Mobile drawer needs a close button and keyboard focus management');
assert.ok(loader.includes('/styles/home-experience.css') &&
  loader.includes('/styles/mobile-navigation.css'), 'Both styles must load on the live site');

class Element {
  constructor(classes = '') {
    this.attrs = {};
    this.dataset = {};
    this.children = [];
    this.handlers = {};
    this.hidden = false;
    this.disabled = false;
    this.textContent = '';
    this.className = classes;
    const set = new Set(classes.split(/\s+/).filter(Boolean));
    this.classList = {
      contains: value => set.has(value),
      add: value => set.add(value),
      remove: value => set.delete(value),
      toggle: (value, flag) => {
        if (flag === undefined ? !set.has(value) : flag) set.add(value);
        else set.delete(value);
      }
    };
    this.style = { setProperty: () => {} };
  }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  getAttribute(key) { return this.attrs[key] ?? null; }
  addEventListener(event, cb) { (this.handlers[event] ??= []).push(cb); }
  fire(event, data = {}) { for (const cb of this.handlers[event] || []) cb(data); }
  querySelector(selector) {
    if (selector === '.core-slide-heading') return this.heading || null;
    return this.children.find(node => {
      if (selector === '.tds-core-slide-image') return node.className === 'tds-core-slide-image';
      if (selector === '.tds-core-image-shade') return node.className === 'tds-core-image-shade';
      if (selector === '.tds-core-image-label') return node.className === 'tds-core-image-label';
      return false;
    }) || null;
  }
  querySelectorAll() { return []; }
  appendChild(el) { this.children.push(el); }
  insertBefore(el) { this.children.unshift(el); }
  getClientRects() { return [{}]; }
}

const panels = Array.from({ length: 4 }, (_, index) => {
  const panel = new Element(index === 0 ? 'core-slide active' : 'core-slide');
  panel.visual = new Element();
  panel.heading = new Element();
  panel.heading.textContent = ['Consultations', 'Monitoring', 'App', 'Records'][index];
  panel.querySelector = selector => selector === '.core-slide-visual' ? panel.visual :
    selector === '.core-slide-heading' ? panel.heading : null;
  return panel;
});
const dots = Array.from({ length: 4 }, () => new Element('core-slide-dot'));
const back = new Element();
const forward = new Element();
const toggle = new Element();
const count = new Element();
const live = new Element();
const carousel = new Element('core-highlights-slider');
carousel.querySelectorAll = selector => selector === '.core-slide' ? panels :
  selector === '[data-core-slide-to]' ? dots : [];
const carouselControls = {
  '[data-core-slider-prev]': back,
  '[data-core-slider-next]': forward,
  '[data-core-slider-toggle]': toggle,
  '[data-core-slider-counter]': count,
  '[data-core-slider-live]': live
};
carousel.querySelector = selector => carouselControls[selector] || null;
carousel.contains = child => child === carousel || panels.includes(child);
carousel.setAttribute = (key, value) => { carousel.attrs[key] = value; };

const careRail = new Element('services-grid');
careRail.clientWidth = 370;
careRail.scrollWidth = 1160;
careRail.scrollLeft = 0;
careRail.getBoundingClientRect = () => ({ left: 0 });
const careCards = Array.from({ length: 4 }, (_, i) => {
  const card = new Element('card');
  card.getBoundingClientRect = () => ({ left: 20 + i * 280 - careRail.scrollLeft });
  return card;
});
careRail.querySelectorAll = selector => selector === '.card' ? careCards : [];
careRail.scrollTo = function ({ left }) {
  this.scrollLeft = left;
  this.fire('scroll');
};
const careBack = new Element();
const careForward = new Element();
const careCount = new Element();

const document = {
  readyState: 'complete',
  hidden: false,
  body: new Element(),
  head: new Element(),
  createElement: () => new Element(),
  getElementById: id => id === 'carePathRail' ? careRail : null,
  querySelector: selector => ({
    '.core-highlights-slider': carousel,
    '[data-care-rail-prev]': careBack,
    '[data-care-rail-next]': careForward,
    '[data-care-rail-count]': careCount
  })[selector] || null,
  querySelectorAll: selector => selector === '.core-slide' ? panels : [],
  listeners: {},
  addEventListener(event, cb) { (this.listeners[event] ??= []).push(cb); },
  fire(event) { for (const cb of this.listeners[event] || []) cb(); }
};

const motion = { matches: false, handlers: {}, addEventListener(event, cb) { this.handlers[event] = cb; } };
const pending = new Map();
let timeoutId = 0;
const window = {
  matchMedia: () => motion,
  getComputedStyle: () => ({ paddingLeft: '20px' }),
  setTimeout(cb, delay) { pending.set(++timeoutId, { cb, delay }); return timeoutId; },
  clearTimeout(id) { pending.delete(id); },
  setInterval: () => 1,
  clearInterval: () => {},
  requestAnimationFrame(cb) { cb(); },
  addEventListener: () => {}
};

function advanceTimer() {
  const queued = Array.from(pending.entries())[0];
  assert.ok(queued, 'Expected a scheduled carousel rotation');
  assert.equal(queued[1].delay, 6500, 'Carousel pacing should feel unhurried');
  pending.delete(queued[0]);
  queued[1].cb();
}
runInNewContext(carouselCode, {
  document, window, location: { pathname: '/' },
  MutationObserver: class { observe() {} },
  // The page's primary script does not need external APIs in these tests.
});

assert.deepEqual(panels.map(p => p.hidden), [false, true, true, true]);
assert.equal(dots[0].attrs['aria-current'], 'true');
assert.equal(count.textContent, '01 / 04');
advanceTimer();
assert.deepEqual(panels.map(p => p.hidden), [true, false, true, true], 'Autoplay advances');
assert.equal(count.textContent, '02 / 04');
forward.fire('click');
assert.equal(count.textContent, '03 / 04', 'Next arrow advances');
back.fire('click');
assert.equal(count.textContent, '02 / 04', 'Previous arrow reverses');
dots[3].fire('click');
assert.equal(count.textContent, '04 / 04', 'Dots jump to a specific slide');
assert.match(live.textContent, /Records/, 'Manual navigation announces the slide');

toggle.fire('click');
assert.equal(toggle.textContent, 'Play', 'A user can pause animation');
assert.equal(pending.size, 0, 'Paused state cancels the timer');
toggle.fire('click');
assert.equal(toggle.textContent, 'Pause');
assert.ok(pending.size > 0, 'Resume restarts auto rotation');
carousel.fire('mouseenter');
assert.equal(pending.size, 0, 'Hover pauses rotation');
carousel.fire('mouseleave');
assert.ok(pending.size > 0, 'Leaving hover resumes rotation');
motion.matches = true;
motion.handlers.change();
assert.equal(pending.size, 0, 'Reduced motion disables autoplay');
motion.matches = false;
motion.handlers.change();
document.hidden = true;
document.fire('visibilitychange');
assert.equal(pending.size, 0, 'Hidden tabs must not advance');
document.hidden = false;
document.fire('visibilitychange');
assert.ok(pending.size > 0, 'Visible tabs resume');

assert.equal(careBack.disabled, true, 'At first card, previous is disabled');
assert.equal(careForward.disabled, false);
careForward.fire('click');
assert.ok(careRail.scrollLeft > 0, 'Care path next button scrolls the rail');
assert.equal(careCount.textContent, '02 / 04', 'Care path counter updates');
careBack.fire('click');
assert.equal(careRail.scrollLeft, 0, 'Care path previous button scrolls back');
careRail.scrollLeft = careRail.scrollWidth - careRail.clientWidth;
careRail.fire('scroll');
assert.equal(careForward.disabled, true, 'At end of rail next is disabled');
assert.equal(careCount.textContent, '04 / 04');

console.log('PASS: autoplay, arrows, dots, pause, reduced-motion, tab visibility, care rail, mobile nav hooks');
