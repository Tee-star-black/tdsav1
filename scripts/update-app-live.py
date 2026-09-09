from pathlib import Path
import re

app_path = Path('teledoctorsa-app.html')
home_path = Path('index.html')
text = app_path.read_text(encoding='utf-8-sig')
home = home_path.read_text(encoding='utf-8-sig')

old_desc = 'Follow the TeleDoctorSA app rollout for patient messaging, appointment support, secure health information, and connected care access in South Africa.'
new_desc = 'Access the TeleDoctorSA patient app for secure health information, appointment support, messaging and connected care in South Africa.'
text = text.replace(old_desc, new_desc)

text = text.replace(
    'The TeleDoctorSA App is your personal patient portal that puts healthcare at your fingertips. Download the app to send real-time health data directly to your clinicians, access your electronic health records, book appointments, and communicate securely with your healthcare team—all from your smartphone or tablet.',
    'The TeleDoctorSA App is your secure patient portal for connected care. Sign in to share health information with your clinical team, access your electronic health records, manage appointments, and communicate securely from your phone, tablet, or computer.'
)

text = text.replace(
    '<h3>Download the App</h3>\n                <p>Available for iOS and Android devices. Download from the App Store or Google Play Store and create your secure account.</p>',
    '<h3>Open the App</h3>\n                <p>Open the secure TeleDoctorSA patient app in your browser and sign in to your account. No app-store download is required.</p>'
)

text = text.replace(
    '<h3 style="font-size: 2rem; color: var(--primary-orange); margin-bottom: 10px; font-weight: 700;">Coming Soon</h3>\n                <p style="color: var(--deep-navy); font-size: 1.1rem; margin: 0;">App launching in 2026</p>',
    '<h3 style="font-size: 2rem; color: var(--success-green); margin-bottom: 10px; font-weight: 700;">Now Live</h3>\n                <p style="color: var(--deep-navy); font-size: 1.05rem; margin: 0 0 18px;">Secure patient access is available now.</p>\n                <a href="/patients" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; background:var(--deep-navy); color:#fff; text-decoration:none; padding:11px 18px; font-weight:700; border-radius:0;">Open Patient App <span aria-hidden="true">&rarr;</span></a>'
)

text = text.replace(
    '<strong>Coming Soon 2026</strong> • Free to download • Secure & Private • Available 24/7',
    '<strong>Now Live</strong> • Secure & Private • Available 24/7 • Browser-based access'
)

text = text.replace(
    '<p style="font-size: 1.2rem; margin-bottom: 10px;">Download the TeleDoctorSA App today and take control of your health</p>',
    '<p style="font-size: 1.2rem; margin-bottom: 10px;">Open the TeleDoctorSA patient app and stay connected to your healthcare team</p>'
)

if 'IN DEVELOPMENT' in text:
    pattern = re.compile(r'<div class="download-buttons">.*?</div>', re.S)
    replacement = '''<div class="download-buttons">
            <a href="/patients" class="download-btn" style="background: var(--deep-navy); color: white; text-decoration: none;">
                <i data-lucide="log-in" style="width: 24px; height: 24px;"></i>
                Open Patient App
            </a>
            <a href="/virtual-consultations" class="download-btn" style="background: transparent; color: var(--deep-navy); border: 1px solid var(--deep-navy); text-decoration: none;">
                <i data-lucide="video" style="width: 24px; height: 24px;"></i>
                Book a Consultation
            </a>
        </div>'''
    text, count = pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit('Could not replace download CTA block')

hero_styles = '''
<style id="app-live-hero-styles">
    .hero-section.app-live-hero {
        min-height: 0;
        padding: 104px 28px 64px;
        background: #0f172a;
        color: #ffffff;
        text-align: left;
        overflow: hidden;
    }

    .app-live-hero .app-hero-grid {
        width: min(1180px, calc(100% - 48px));
        max-width: 1180px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, .88fr) minmax(360px, 1.12fr);
        gap: clamp(34px, 5vw, 72px);
        align-items: center;
    }

    .app-live-hero .app-hero-copy { min-width: 0; }

    .app-live-hero .app-live-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 18px;
        padding: 7px 10px;
        border: 1px solid rgba(255, 163, 102, .55);
        border-radius: 2px;
        color: #ffb886;
        font-size: .75rem;
        line-height: 1;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
    }

    .app-live-hero .app-live-badge::before {
        content: '';
        width: 7px;
        height: 7px;
        background: #10b981;
        border-radius: 1px;
    }

    .app-live-hero h1 {
        max-width: 640px;
        margin: 0 0 16px;
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: clamp(2.35rem, 4vw, 4rem);
        line-height: 1.02;
        letter-spacing: -.055em;
        font-weight: 800;
    }

    .app-live-hero .subtitle {
        max-width: 610px;
        margin: 0 0 26px;
        color: rgba(255, 255, 255, .74);
        font-size: clamp(.98rem, 1.25vw, 1.12rem);
        line-height: 1.65;
    }

    .app-live-hero .app-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 18px;
    }

    .app-live-hero .app-hero-primary,
    .app-live-hero .app-hero-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 11px 16px;
        border-radius: 2px;
        text-decoration: none;
        font-size: .84rem;
        line-height: 1.2;
        font-weight: 700;
        transition: background-color .2s ease, border-color .2s ease, color .2s ease;
    }

    .app-live-hero .app-hero-primary {
        background: #ff9559;
        border: 1px solid #ff9559;
        color: #0f172a;
    }

    .app-live-hero .app-hero-primary:hover {
        background: #ffad7d;
        border-color: #ffad7d;
    }

    .app-live-hero .app-hero-secondary {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, .28);
        color: #ffffff;
    }

    .app-live-hero .app-hero-secondary:hover {
        border-color: rgba(255, 255, 255, .6);
        background: rgba(255, 255, 255, .06);
    }

    .app-live-hero .app-hero-proof {
        color: rgba(255, 255, 255, .52);
        font-size: .76rem;
        line-height: 1.5;
    }

    .app-live-hero .app-hero-visual {
        position: relative;
        min-width: 0;
        border: 1px solid rgba(255, 255, 255, .12);
        background: #111c31;
        overflow: hidden;
    }

    .app-live-hero .app-hero-visual::before {
        content: '';
        position: absolute;
        z-index: 2;
        top: 0;
        left: 0;
        width: 64px;
        height: 3px;
        background: #ff9559;
    }

    .app-live-hero .app-hero-visual img {
        display: block;
        width: 100%;
        height: clamp(330px, 36vw, 480px);
        object-fit: cover;
        object-position: center;
    }

    .app-live-hero .app-hero-image-caption {
        position: absolute;
        z-index: 3;
        left: 16px;
        bottom: 16px;
        padding: 8px 10px;
        background: rgba(15, 23, 42, .9);
        border: 1px solid rgba(255, 255, 255, .12);
        color: rgba(255, 255, 255, .84);
        font-size: .72rem;
        line-height: 1.35;
    }

    @media (max-width: 900px) {
        .hero-section.app-live-hero { padding: 88px 24px 48px; }
        .app-live-hero .app-hero-grid {
            width: min(760px, 100%);
            grid-template-columns: 1fr;
            gap: 28px;
        }
        .app-live-hero .app-hero-visual img { height: clamp(300px, 58vw, 430px); }
    }

    @media (max-width: 560px) {
        .hero-section.app-live-hero { padding: 80px 18px 38px; }
        .app-live-hero .app-hero-grid { width: 100%; }
        .app-live-hero h1 { font-size: clamp(2rem, 10vw, 2.7rem); }
        .app-live-hero .app-hero-actions {
            display: grid;
            grid-template-columns: 1fr;
        }
        .app-live-hero .app-hero-primary,
        .app-live-hero .app-hero-secondary { width: 100%; }
        .app-live-hero .app-hero-visual img { height: 300px; }
    }
</style>
'''

if 'id="app-live-hero-styles"' not in text:
    text = text.replace('</head>', hero_styles + '\n</head>', 1)

hero_markup = '''<section class="hero-section app-live-hero">
        <div class="section-inner app-hero-grid">
            <div class="app-hero-copy">
                <div class="app-live-badge">Now live</div>
                <h1>Connected healthcare, right in your hands.</h1>
                <p class="subtitle">Access your TeleDoctorSA patient portal, manage appointments, review health information and stay connected to your healthcare team from wherever you are.</p>
                <div class="app-hero-actions">
                    <a href="/patients" class="app-hero-primary">
                        Open Patient App <span aria-hidden="true">&rarr;</span>
                    </a>
                    <a href="/virtual-consultations" class="app-hero-secondary">Book a Consultation</a>
                </div>
                <p class="app-hero-proof">Secure patient access &nbsp;•&nbsp; Private &nbsp;•&nbsp; Available 24/7</p>
            </div>
            <div class="app-hero-visual">
                <img src="/images/rebuild/07-mobile-health-app.jpg" alt="Patient using the TeleDoctorSA digital health app" loading="eager" fetchpriority="high">
                <div class="app-hero-image-caption">TeleDoctorSA patient access &nbsp;•&nbsp; Secure connected care</div>
            </div>
        </div>
    </section>'''

hero_pattern = re.compile(r'<section class="hero-section(?:\s+app-live-hero)?">.*?</section>', re.S)
text, hero_count = hero_pattern.subn(hero_markup, text, count=1)
if hero_count != 1:
    raise SystemExit('Could not replace app hero section')

# Homepage: update stale app-launch wording and install a proper hero image.
home = home.replace('follow TeleDoctorSA app rollout', 'access the TeleDoctorSA app')
home = home.replace('app rollout access', 'TeleDoctorSA app access')
home = home.replace('Follow App Access', 'Open Patient App')
home = home.replace('TeleDoctorSA app rollout', 'TeleDoctorSA app')

if 'class="home-hero-media"' not in home:
    hero_media = '''
                <figure class="home-hero-media">
                    <img src="/images/rebuild/01-clinical-team-at-work.jpg" alt="TeleDoctorSA clinical team using connected digital healthcare tools" loading="eager" fetchpriority="high">
                    <figcaption>Connected care, built around real clinical workflows.</figcaption>
                </figure>'''
    boundary = '\n            </div>\n\n            <article class="core-slide active"'
    if boundary not in home:
        raise SystemExit('Could not locate homepage hero intro boundary')
    home = home.replace(boundary, hero_media + boundary, 1)

# Use the homepage footer as the canonical footer for the App page.
footer_match = re.search(r'(<footer class="site-footer">.*?</footer>)', home, re.S)
if not footer_match:
    raise SystemExit('Could not locate canonical homepage footer')
canonical_footer = footer_match.group(1)

footer_pattern = re.compile(r'<footer class="(?:footer|site-footer)"[^>]*>.*?</footer>', re.S)
text, footer_count = footer_pattern.subn(canonical_footer, text, count=1)
if footer_count != 1:
    raise SystemExit('Could not replace App page footer')

if 'COMING SOON' in text or 'Coming Soon' in text or 'IN DEVELOPMENT' in text or 'Notify Me When Available' in text:
    raise SystemExit('Stale launch copy still present')
if '/images/rebuild/07-mobile-health-app.jpg' not in text:
    raise SystemExit('App hero image was not installed')
if '/images/rebuild/01-clinical-team-at-work.jpg' not in home:
    raise SystemExit('Homepage hero image was not installed')
if '<footer class="site-footer">' not in text:
    raise SystemExit('Canonical footer was not installed on App page')

app_path.write_text(text, encoding='utf-8')
home_path.write_text(home, encoding='utf-8')
print('updated homepage hero image and synchronized App page footer')
