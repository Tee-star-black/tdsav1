import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Run from the repository root: node scripts/verify-site.mjs
// Text-only review environments can supply an upstream asset inventory.
const root = process.cwd();
const manifest = process.env.TDSA_ASSET_MANIFEST;
const inventory = new Set(manifest ? JSON.parse(readFileSync(manifest, 'utf8')) : []);
const failures = [];
const htmlFiles = readdirSync(root).filter(file => file.endsWith('.html'));
const aliases = { '/': 'index.html', '/app': 'teledoctorsa-app.html' };
const available = file => existsSync(path.join(root, file)) || inventory.has(file);
const resolve = pathname => {
  const route = pathname.replace(/\/$/, '') || '/';
  return aliases[route] || route.replace(/^\//, '') + (path.extname(route) ? '' : '.html');
};
for (const file of htmlFiles) {
  const source = readFileSync(path.join(root, file), 'utf8');
  const ids = [...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
  for (const id of new Set(ids)) {
    if (ids.filter(value => value === id).length > 1) failures.push(`${file}: duplicate id ${id}`);
  }
  const markup = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, tag => tag.split('>')[0] + '>');
  for (const match of markup.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
    const href = match[1];
    if (!href || href === '#' || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    const url = new URL(href, `https://site.test/${file}`);
    if (!['site.test', 'teledoctorsa.co.za', 'www.teledoctorsa.co.za'].includes(url.hostname)) continue;
    const pathname = decodeURIComponent(url.pathname);
    const target = pathname === `/${file}` ? file : resolve(pathname);
    if (!available(target)) failures.push(`${file}: missing target ${href}`);
    if (url.hash && available(target) && target.endsWith('.html')) {
      const targetSource = readFileSync(path.join(root, target), 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      if (![...targetSource.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].some(item => item[1] === id)) {
        failures.push(`${file}: missing anchor ${href}`);
      }
    }
  }
  for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|application\/ld\+json|application\/json/i.test(match[1])) continue;
    try { new vm.Script(match[2], { filename: file }); }
    catch (error) { failures.push(`${file}: ${error.message}`); }
  }
}
for (const file of readdirSync(path.join(root, 'scripts')).filter(file => file.endsWith('.js'))) {
  try { new vm.Script(readFileSync(path.join(root, 'scripts', file), 'utf8'), { filename: file }); }
  catch (error) { failures.push(`${file}: ${error.message}`); }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`PASS: ${htmlFiles.length} website pages; internal links, anchors, duplicate IDs and script syntax.`);
