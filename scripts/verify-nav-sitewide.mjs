// Run from the repository root: node scripts/verify-nav-sitewide.mjs
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const publicPages = readdirSync(new URL('..', import.meta.url)).filter(path => path.endsWith('.html'));
assert.ok(publicPages.length >= 20, 'Expected static public website pages');

for (const page of publicPages) {
  const html = read(page);
  assert.match(html, /<script\b[^>]*src=["']\/scripts\/rebuild-images\.js\?v=20261019-app-refresh["']/i, page + ' requires updated canonical nav and footer');
  assert.doesNotMatch(html, /<script\b[^>]*src=["']\/?scripts\/editorial-mega-menu\.js/i, page + ' should not load a competing navbar');
  if (/scripts\/site-ux-v4\.js/.test(html)) {
    assert.match(html, /scripts\/site-ux-v4\.js\?v=20261015-navfix1/, page + ' requires the patched scroll script');
  }
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
assert.match(canonical, /tel:\+27698317264/);
assert.doesNotMatch(canonical, /tel:\+27780336394/);
assert.match(shared, /'\/our-services': '\/our-services\.html'/);
assert.match(shared, /'\/app': '\/teledoctorsa-app\.html'/);
assert.match(shared, /'\/patients': 'https:\/\/demo-patient\.teledoctorsa\.co\.za\/'/);
const logoCss = footer.match(/\.tds-foot-logo-link img\s*\{([^}]+)\}/)?.[1];
assert.ok(logoCss, 'Footer logo CSS rule exists');
assert.match(logoCss, /padding: 0 !important;/);
assert.match(logoCss, /background: transparent !important;/);
assert.doesNotMatch(logoCss, /background: #fff !important;/);

console.log('PASS: ' + publicPages.length + ' public pages use versioned shared navigation and the footer logo has no white badge.');
