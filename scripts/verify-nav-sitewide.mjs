// Run from the repository root: node scripts/verify-nav-sitewide.mjs
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const publicPages = readdirSync(new URL('..', import.meta.url)).filter(path => path.endsWith('.html'));
assert.ok(publicPages.length >= 20, 'Expected static public website pages');

for (const page of publicPages) {
  const html = read(page);
  assert.match(html, /<script\b[^>]*src=["']\/scripts\/rebuild-images\.js\?v=20261015-navfix1["']/i, page + ' requires cache-busted shared nav');
}
const canonical = read('scripts/canonical-nav.js');
const back = read('scripts/nav-back-controls.js');
const shared = read('scripts/rebuild-images.js');
const footer = read('styles/unified-footer.css');

assert.match(canonical, /var MOBILE_MAX = 1100/);
assert.match(back, /var MOBILE_MAX = 1100/);
assert.match(canonical, /backdrop-filter: none !important/);
assert.match(canonical, /overflow: visible !important/);
assert.match(shared, /__TDS_LOCAL_ROUTE_BRIDGE__/);
assert.match(shared, /'\/our-services': '\/our-services\.html'/);
assert.match(shared, /'\/app': '\/teledoctorsa-app\.html'/);
assert.match(shared, /'\/patients': 'https:\/\/demo-patient\.teledoctorsa\.co\.za\/'/);
assert.match(footer, /tds-foot-logo-link img[\s\S]*?padding: 0 !important;/);
assert.match(footer, /tds-foot-logo-link img[\s\S]*?background: transparent !important;/);
assert.doesNotMatch(footer, /tds-foot-logo-link img[\s\S]*?background: #fff !important;/);

console.log('PASS: ' + publicPages.length + ' public pages use versioned shared navigation and the footer logo has no white badge.');
