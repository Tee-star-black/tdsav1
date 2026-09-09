from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]

PUBLIC_PAGES = {
    'index.html', 'our-services.html', 'about-us.html', 'telemedia-suite.html',
    'contact-us.html', 'ehr.html', 'teledoctorsa-app.html', 'ecg247.html',
    'virtual-consultations.html', 'privacy-policy.html', 'legal-notice.html',
    'shop.html'
}

GLOBAL_REPLACEMENTS = {
    'images/TDSA-Logo.png': '/images/rebuild/logo.png',
    '../images/TDSA-Logo.png': '/images/rebuild/logo.png',
    '/favicon-48x48.png': '/android-chrome-192x192.png',
    '/apple-touch-icon.png': '/android-chrome-192x192.png',
    'href="index.html"': 'href="/"',
    "href='index.html'": "href='/'",
    'href="about-us.html"': 'href="/about-us"',
    'href="our-services.html"': 'href="/our-services"',
    'href="contact-us.html"': 'href="/contact-us"',
    'href="telemedia-suite.html"': 'href="/telemedia-suite"',
    'href="ehr.html"': 'href="/ehr"',
    'href="ecg247.html"': 'href="/ecg247"',
    'href="virtual-consultations.html"': 'href="/virtual-consultations"',
    'href="privacy-policy.html"': 'href="/privacy-policy"',
    'href="legal-notice.html"': 'href="/legal-notice"',
    'href="shop.html"': 'href="/shop"',
    'href="wellness.html"': 'href="/our-services"',
    'href="clinician-portal.html"': 'href="/doctors"',
}

IMAGE_REPLACEMENTS = {
    'images/DrM2.2.jpeg': '/images/rebuild/03-doctor-video-consultation.jpg',
    'images/GACC.jpg': '/images/rebuild/06-healthcare-dashboard.jpg',
    'images/PMD1.png': '/images/rebuild/04-wearable-ecg-monitor.jpg',
    'images/TDSAG.jpg': '/images/rebuild/logo.png',
    'images/DrM.jpeg': '/images/rebuild/hero-clinician.jpg',
    'images/HPE1.png': '/images/rebuild/apparatus.jpg',
    'images/HPE2.png': '/images/rebuild/bpm.jpg',
    'images/PMD2.png': '/images/rebuild/ecg monitor.jpg',
    'images/249/20429923/Untitleddesign48-25xV-u53f-vbZW3D9jN0Fg.png': '/images/rebuild/logo.png',
    'images/ECG247 Athletes/ECG-247-Logo-Modified_with-TM_rgb.png': '/images/rebuild/04-wearable-ecg-monitor.jpg',
    'images/ECG247%20Athletes/ECG-247-Logo-Modified_with-TM_rgb.png': '/images/rebuild/04-wearable-ecg-monitor.jpg',
    'images/ECG247 Athletes/Gemini_Generated_Image_bwbj7ubwbj7ubwbj.png': '/images/rebuild/05-remote-patient-monitoring.jpg',
    'images/ECG247%20Athletes/Gemini_Generated_Image_bwbj7ubwbj7ubwbj.png': '/images/rebuild/05-remote-patient-monitoring.jpg',
    'images/ECG247 Athletes/Gemini_Generated_Image_eoiudweoiudweoiu.png': '/images/rebuild/04-wearable-ecg-monitor.jpg',
    'images/ECG247%20Athletes/Gemini_Generated_Image_eoiudweoiudweoiu.png': '/images/rebuild/04-wearable-ecg-monitor.jpg',
    'images/ECG247 Athletes/Sensormeny.jpg': '/images/rebuild/ecg monitor.jpg',
    'images/ECG247%20Athletes/Sensormeny.jpg': '/images/rebuild/ecg monitor.jpg',
}


def clean(text: str) -> str:
    return '\n'.join(line.rstrip() for line in text.splitlines()) + '\n'


for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8', errors='replace')
    original = text

    for old, new in GLOBAL_REPLACEMENTS.items():
        text = text.replace(old, new)
    for old, new in IMAGE_REPLACEMENTS.items():
        text = text.replace(old, new)

    # Redirect-directory documents live one level below root.
    if path.relative_to(ROOT).as_posix() in {'app/index.html', 'ecg247/index.html', 'ehr/index.html'}:
        text = text.replace('src="scripts/site-wide-optimization.js"', 'src="../scripts/site-wide-optimization.js"')

    # Replace missing nurse partner media with assets/content that actually exists.
    text = re.sub(
        r'<img\s+class="partner-logo"\s+src="images/nurses/73Health\.png"\s+alt="73 Health logo"\s*>',
        '<span class="partner-wordmark">73 HEALTH</span>',
        text,
        flags=re.I,
    )
    text = re.sub(
        r'<video[^>]*>\s*<source\s+src="videos/TDSA/73health\.mp4"[^>]*>\s*Your browser does not support the video tag\.\s*</video>',
        '<img src="/images/rebuild/08-nurses-at-clinical-workstation.jpg" alt="Nurse using a digital clinical workstation">',
        text,
        flags=re.I | re.S,
    )

    # The app is a public sitemap page, so do not tell search engines not to index it.
    if path.name == 'teledoctorsa-app.html':
        text = text.replace('<meta name="robots" content="noindex, follow">', '<meta name="robots" content="index, follow">')

    if text != original:
        path.write_text(clean(text), encoding='utf-8')

# Keep sitemap canonical and fresh after this production audit.
sitemap = ROOT / 'sitemap.xml'
text = sitemap.read_text(encoding='utf-8')
text = re.sub(r'<lastmod>[^<]+</lastmod>', '<lastmod>2026-09-09</lastmod>', text)
text = text.replace('https://teledoctorsa.co.za/privacy-policy.html', 'https://teledoctorsa.co.za/privacy-policy')
sitemap.write_text(clean(text), encoding='utf-8')

# Compiled Python does not belong in source control.
pycache = ROOT / 'scripts' / '__pycache__'
if pycache.exists():
    shutil.rmtree(pycache)

# Validate public production pages only. Template literals and noindex exhibition
# utility pages are deliberately excluded from this blocking check.
missing = []
for name in sorted(PUBLIC_PAGES):
    path = ROOT / name
    text = path.read_text(encoding='utf-8', errors='ignore')
    for attr, target in re.findall(r'\b(href|src)=["\']([^"\']+)["\']', text, flags=re.I):
        if not target or '${' in target or target.startswith(('#', 'http://', 'https://', 'mailto:', 'tel:', 'javascript:', 'data:', '//')):
            continue
        clean_target = target.split('?', 1)[0].split('#', 1)[0]
        if not clean_target:
            continue
        candidate = ROOT / clean_target.lstrip('/') if clean_target.startswith('/') else path.parent / clean_target
        if candidate.exists():
            continue
        if candidate.suffix == '' and (candidate.with_suffix('.html').exists() or candidate.is_dir()):
            continue
        # Clean public routes are resolved by .htaccess.
        if clean_target in {'/app', '/ecg247', '/ehr', '/about-us', '/our-services', '/contact-us', '/telemedia-suite', '/virtual-consultations', '/privacy-policy', '/legal-notice', '/shop', '/doctors'}:
            continue
        missing.append(f'{name} -> {target}')

if missing:
    raise SystemExit('Broken production references remain:\n' + '\n'.join(sorted(set(missing))))

print('Production reference cleanup passed.')
