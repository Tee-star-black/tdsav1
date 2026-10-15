// Run from repository root: node scripts/verify-retired-shop.mjs
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');
const retired = ['shop', 'product-detail', 'payment', 'returns-policy'];
const publicPages = readdirSync(root).filter(file => file.endsWith('.html'));
assert.ok(publicPages.length >= 20, 'Public site pages were unexpectedly removed');

for (const slug of retired) {
  assert.equal(existsSync(new URL(slug + '.html', root)), false, slug + ' should be removed');
}

const deadHref = /<a\b[^>]*\bhref=(["'])(?:https?:\/\/(?:www\.)?teledoctorsa\.co\.za)?\/(?:shop|product-detail|payment|returns-policy)(?:\.html)?(?:[/?#][^"']*)?\1/i;
for (const file of publicPages) {
  const html = read(file);
  assert.doesNotMatch(html, deadHref, 'Retired commerce link found in ' + file);
}

const rewrite = read('.htaccess');
assert.match(rewrite, /RewriteRule \^\(\?:shop\|product-detail\|payment\|returns-policy\)/);
assert.match(rewrite, /\[G,L,NC\]/);
assert.ok(rewrite.indexOf('Retired e-commerce URLs') < rewrite.indexOf('Force clean URLs - redirect .html'), '410 rules must precede clean URL redirects');

const sitemap = read('sitemap.xml');
assert.doesNotMatch(sitemap, /<loc>https:\/\/teledoctorsa\.co\.za\/(?:shop|product-detail|payment|returns-policy)(?:\.html)?<\/loc>/i);
const footer = read('scripts/canonical-footer.js');
assert.doesNotMatch(footer, /\/returns-policy/);
const services = read('our-services.html');
assert.doesNotMatch(services, /Shop Devices|Free shipping over R1,000|href="\/shop"/i);
const routes = read('scripts/rebuild-images.js');
assert.doesNotMatch(routes, /['"]\/(?:shop|returns-policy)['"]/);

console.log('PASS: retired commerce pages removed, links cleaned, sitemap updated and old URLs marked HTTP 410.');
