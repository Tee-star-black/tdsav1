// Usage: node scripts/verify-app-demo.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const canonical = read('teledoctorsa-app.html');
const legacy = read('app.html');
const homepage = read('index.html');
const media = read('telemedia-suite.html');
const php = read('api/leads.php');
const js = read('scripts/app-demo.js');
const css = read('styles/app-demo.css');

for (const [name, page] of [['/app', canonical], ['/app.html', legacy]]) {
  assert.match(page, /id="appDemoForm"/, name);
  assert.match(page, /href="#book-demo"/, name);
  assert.match(page, /data-tds-custom-hero/, name);
  assert.match(page, /class="app-capability(?:\s|")/g, name);
  assert.match(page, /class="app-story app-chapters"/, name);
  assert.match(page, /class="app-arrival-phone"/, name);
  assert.match(page, /Illustrative layout, not an actual patient record/, name);
  assert.match(page, /href="tel:\+27698317264"/, name);
  assert.match(page, /\/styles\/app-editorial\.css/, name);
  assert.doesNotMatch(page, /Â©|Â·|â€”|â€™|�/, name);
  assert.match(page, /https:\/\/demo-patient\.teledoctorsa\.co\.za\//, name);
  assert.match(page, /action="\/api\/leads\.php"/, name);
  assert.match(page, /\/styles\/app-demo\.css/, name);
  assert.match(page, /\/scripts\/app-demo\.js/, name);
  assert.match(page, /name="consent" required/, name);
  assert.doesNotMatch(page, /COMING SOON|Coming Soon|Notify Me When Available/i, name);
}
assert.match(canonical, /name="robots" content="index, follow"/);
assert.match(legacy, /name="robots" content="noindex, follow"/);
assert.doesNotMatch(homepage, /Join the interest list/);
assert.match(homepage, /\/app#book-demo/);
assert.doesNotMatch(media, /COMING SOON/);
assert.match(php, /TDS_LEADS_TO/);
assert.match(php, /if \(!\$sent\)/);
assert.match(js, /fetch\(actionUrl/);
assert.match(js, /fallbackWhatsApp/);
assert.match(css, /@media\(max-width:580px\)/);
assert.match(read('styles/app-editorial.css'), /\.app-chapter-features/);
assert.match(read('styles/app-editorial.css'), /\.app-arrival-main/);
console.log('App demo marketing, booking funnel and lead endpoint static checks passed.');
