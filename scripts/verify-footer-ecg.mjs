// Run from the repository root: node scripts/verify-footer-ecg.mjs
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const pages = readdirSync(new URL('..', import.meta.url)).filter((name) => name.endsWith('.html'));
const loader = read('scripts/rebuild-images.js');
const footer = read('scripts/canonical-footer.js');
const footerCss = read('styles/unified-footer.css');
const ecg = read('ecg247.html');
const ecgCss = read('styles/ecg247-refresh.css');

assert.match(loader, /scripts\/canonical-footer\.js/);
assert.match(loader, /styles\/unified-footer\.css/);
assert.match(footer, /images\/rebuild\/logo\.png/);
assert.match(footer, /id="tds-canonical-footer"/);
assert.match(footerCss, /#tds-canonical-footer/);

for (const path of pages) {
  const content = read(path);
  assert.match(content, /\/scripts\/rebuild-images\.js/, path + ' must load the shared site runtime');
}
const firstSection = ecg.indexOf('<section class="ecg24-guide-bar"');
const hero = ecg.indexOf('<section class="ecg24-hero"');
const guideLink = ecg.indexOf('https://ecg247.com/en/how-to-use-ecg247/', firstSection);
assert.ok(firstSection > 0 && guideLink > firstSection && guideLink < hero, 'official guide must be visible before the hero');
assert.match(ecg, /<main id="ecg247-main"/);
assert.match(ecg, /\/styles\/ecg247-refresh\.css/);
assert.match(ecg, /does not diagnose a heart attack/);
assert.match(ecgCss, /@media\(max-width: 480px\)/);
console.log('Passed: site footer is shared across ' + pages.length + ' pages; ECG247 guide, markup and responsive styles present.');