from pathlib import Path
import re

path = Path('teledoctorsa-app.html')
text = path.read_text(encoding='utf-8-sig')

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

if 'Coming Soon' in text or 'IN DEVELOPMENT' in text:
    raise SystemExit('Stale launch copy still present')

path.write_text(text, encoding='utf-8')
print('updated teledoctorsa-app.html')
