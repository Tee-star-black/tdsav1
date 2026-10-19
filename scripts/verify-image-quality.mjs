// Ensure large site visuals never quietly fall back to tiny thumbnails.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const references = [
  'index.html', 'about-us.html', 'app.html', 'teledoctorsa-app.html',
  'doctors.html', 'nurses.html', 'patients.html', 'ehr.html', 'ecg247.html',
  'telemedia-suite.html', 'virtual-consultations.html', 'patients-portal.html',
  'scripts/rebuild-images-core.js', 'scripts/home-core-slide-images.js',
  'styles/homepage.css', 'styles/home-hero-center.css', 'styles/index-legacy.css',
  'styles/ux-v3.css'
];
const tiny = /(?:01-clinical-team-at-work|02-connected-care-ecosystem|03-doctor-video-consultation|04-wearable-ecg-monitor|05-remote-patient-monitoring|06-healthcare-dashboard|07-mobile-health-app|08-nurses-at-clinical-workstation|09-clinician-platform-review|10-care-support-agent|11-teledoctor-platform-clinician|hero-clinician)\.jpg/;
const failures = [];
for (const file of references) {
  const content = readFileSync(file, 'utf8');
  if (tiny.test(content)) failures.push(file + ': contains outdated low-resolution imagery');
  for (const [, url] of content.matchAll(/(?:\/)?(images\/rebuild\/[\w% .-]+\.(?:jpe?g|png|webp))/gi)) {
    const asset = decodeURIComponent(url);
    if (!existsSync(asset)) failures.push(file + ': missing ' + asset);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: no low-resolution legacy photos or missing local image assets in main pages');
}
