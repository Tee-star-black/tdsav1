from pathlib import Path
import re

ROOT = Path('.')

REPLACEMENTS = {
    'index (18).html': 'index.html',
    'about-us (3).html': 'about-us.html',
    'contact-us (1).html': 'contact-us.html',
    'doctors (2).html': 'doctors.html',
    'ecg247 (2).html': 'ecg247.html',
    'ehr (1).html': 'ehr.html',
    'nurses (2).html': 'nurses.html',
    'our-services (1).html': 'our-services.html',
    'patients (1).html': 'patients.html',
    'patients-portal (1).html': 'patients-portal.html',
    'legal-notice (1).html': 'legal-notice.html',
    'privacy-policy (1).html': 'privacy-policy.html',
    'privacy-policy (2).html': 'privacy-policy.html',
    'product-detail (1).html': 'product-detail.html',
    'qr-codes (1).html': 'qr-codes.html',
    'shop (1).html': 'shop.html',
    'teledoctorsa-app (1).html': 'teledoctorsa-app.html',
    'telemedia-suite (2).html': 'telemedia-suite.html',
    'app (1).html': 'app.html',
}

STYLE = r'''\n<!-- TDS_NAV_HARDENING_STYLE_START -->\n<style id="tds-nav-hardening-style">\n@media (max-width: 900px) {\n  nav:not(.tds-mobile-nav) .hamburger {\n    display: flex !important;\n    position: relative !important;\n    z-index: 1402 !important;\n  }\n\n  nav:not(.tds-mobile-nav) .nav-links {\n    display: flex !important;\n    position: fixed !important;\n    top: 0 !important;\n    right: -100% !important;\n    width: min(86vw, 360px) !important;\n    height: 100dvh !important;\n    padding: 92px 24px 32px !important;\n    margin: 0 !important;\n    flex-direction: column !important;\n    align-items: stretch !important;\n    gap: 0 !important;\n    background: #fff !important;\n    border-left: 1px solid #E2E8F0 !important;\n    box-shadow: -18px 0 48px rgba(15, 23, 42, .16) !important;\n    overflow-y: auto !important;\n    visibility: hidden !important;\n    opacity: 0 !important;\n    pointer-events: none !important;\n    z-index: 1401 !important;\n    transition: right .28s ease, opacity .2s ease, visibility 0s linear .28s !important;\n  }\n\n  nav:not(.tds-mobile-nav) .nav-links.active {\n    right: 0 !important;\n    visibility: visible !important;\n    opacity: 1 !important;\n    pointer-events: auto !important;\n    transition-delay: 0s !important;\n  }\n\n  nav:not(.tds-mobile-nav) .nav-links > a,\n  nav:not(.tds-mobile-nav) .nav-links > .dropdown > a {\n    width: 100% !important;\n    min-height: 52px !important;\n    display: flex !important;\n    align-items: center !important;\n    justify-content: space-between !important;\n    padding: 14px 4px !important;\n    color: #0F172A !important;\n    border-bottom: 1px solid #E2E8F0 !important;\n    font-size: 1rem !important;\n    text-decoration: none !important;\n  }\n\n  nav:not(.tds-mobile-nav) .nav-links > .dropdown { width: 100% !important; }\n\n  nav:not(.tds-mobile-nav) .dropdown-content {\n    position: static !important;\n    width: 100% !important;\n    height: auto !important;\n    max-height: none !important;\n    right: auto !important;\n    padding: 0 !important;\n    margin: 8px 0 12px !important;\n    display: none !important;\n    box-shadow: none !important;\n    border: 1px solid #E2E8F0 !important;\n    border-radius: 12px !important;\n    overflow: hidden !important;\n    background: #F8FAFC !important;\n  }\n\n  nav:not(.tds-mobile-nav) .dropdown-content.active { display: block !important; }\n\n  .mobile-overlay {\n    position: fixed !important;\n    inset: 0 !important;\n    width: 100vw !important;\n    height: 100dvh !important;\n    background: rgba(15, 23, 42, .52) !important;\n    backdrop-filter: blur(3px) !important;\n    -webkit-backdrop-filter: blur(3px) !important;\n    z-index: 1400 !important;\n    opacity: 0 !important;\n    visibility: hidden !important;\n    pointer-events: none !important;\n    display: block !important;\n    transition: opacity .22s ease, visibility .22s ease !important;\n  }\n\n  .mobile-overlay.active {\n    opacity: 1 !important;\n    visibility: visible !important;\n    pointer-events: auto !important;\n  }\n}\n\nbody.tds-nav-open { overflow: hidden !important; }\n</style>\n<!-- TDS_NAV_HARDENING_STYLE_END -->\n'''

SCRIPT = r'''\n<!-- TDS_NAV_HARDENING_SCRIPT_START -->\n<script id="tds-nav-hardening-script">\n(function () {\n  'use strict';\n\n  function normaliseHref(value) {\n    if (!value) return value;\n    var map = {\n      'index (18).html':'index.html',\n      'about-us (3).html':'about-us.html',\n      'contact-us (1).html':'contact-us.html',\n      'doctors (2).html':'doctors.html',\n      'ecg247 (2).html':'ecg247.html',\n      'ehr (1).html':'ehr.html',\n      'nurses (2).html':'nurses.html',\n      'our-services (1).html':'our-services.html',\n      'patients (1).html':'patients.html',\n      'patients-portal (1).html':'patients-portal.html',\n      'legal-notice (1).html':'legal-notice.html',\n      'privacy-policy (1).html':'privacy-policy.html',\n      'privacy-policy (2).html':'privacy-policy.html',\n      'product-detail (1).html':'product-detail.html',\n      'qr-codes (1).html':'qr-codes.html',\n      'shop (1).html':'shop.html',\n      'teledoctorsa-app (1).html':'teledoctorsa-app.html',\n      'telemedia-suite (2).html':'telemedia-suite.html',\n      'app (1).html':'app.html'\n    };\n    Object.keys(map).forEach(function (oldName) {\n      value = value.replace(oldName, map[oldName]);\n    });\n    return value;\n  }\n\n  function initNav() {\n    document.querySelectorAll('a[href]').forEach(function (a) {\n      var oldHref = a.getAttribute('href');\n      var newHref = normaliseHref(oldHref);\n      if (newHref !== oldHref) a.setAttribute('href', newHref);\n    });\n\n    var nav = document.querySelector('nav:not(.tds-mobile-nav)');\n    if (!nav) return;\n\n    var oldButton = nav.querySelector('#hamburgerBtn, .hamburger');\n    var navLinks = nav.querySelector('#navLinks, .nav-links');\n    var oldOverlay = document.getElementById('mobileOverlay') || document.querySelector('.mobile-overlay');\n    if (!oldButton || !navLinks) return;\n\n    var button = oldButton.cloneNode(true);\n    oldButton.parentNode.replaceChild(button, oldButton);\n    button.setAttribute('aria-expanded', 'false');\n    button.setAttribute('aria-controls', navLinks.id || 'navLinks');\n\n    var overlay = null;\n    if (oldOverlay) {\n      overlay = oldOverlay.cloneNode(true);\n      oldOverlay.parentNode.replaceChild(overlay, oldOverlay);\n    }\n\n    function isOpen() { return navLinks.classList.contains('active'); }\n\n    function openMenu() {\n      navLinks.classList.add('active');\n      button.classList.add('active');\n      if (overlay) overlay.classList.add('active');\n      document.body.classList.add('tds-nav-open');\n      button.setAttribute('aria-expanded', 'true');\n    }\n\n    function closeMenu() {\n      navLinks.classList.remove('active');\n      button.classList.remove('active');\n      if (overlay) overlay.classList.remove('active');\n      document.body.classList.remove('tds-nav-open');\n      button.setAttribute('aria-expanded', 'false');\n      nav.querySelectorAll('.dropdown-content.active').forEach(function (panel) {\n        panel.classList.remove('active');\n      });\n    }\n\n    function toggleMenu(event) {\n      if (event) { event.preventDefault(); event.stopPropagation(); }\n      isOpen() ? closeMenu() : openMenu();\n    }\n\n    button.addEventListener('click', toggleMenu, true);\n    if (overlay) overlay.addEventListener('click', closeMenu, true);\n\n    navLinks.querySelectorAll('.dropdown > a').forEach(function (trigger) {\n      trigger.addEventListener('click', function (event) {\n        if (window.innerWidth > 900) return;\n        var panel = trigger.parentElement.querySelector('.dropdown-content');\n        if (!panel) return;\n        event.preventDefault();\n        event.stopPropagation();\n        nav.querySelectorAll('.dropdown-content.active').forEach(function (other) {\n          if (other !== panel) other.classList.remove('active');\n        });\n        panel.classList.toggle('active');\n      }, true);\n    });\n\n    navLinks.querySelectorAll('a').forEach(function (link) {\n      link.addEventListener('click', function () {\n        var href = link.getAttribute('href') || '';\n        if (href && href !== '#' && !link.closest('.dropdown > a')) closeMenu();\n      });\n    });\n\n    document.addEventListener('keydown', function (event) {\n      if (event.key === 'Escape' && isOpen()) {\n        closeMenu();\n        button.focus();\n      }\n    });\n\n    window.addEventListener('resize', function () {\n      if (window.innerWidth > 900 && isOpen()) closeMenu();\n    });\n  }\n\n  if (document.readyState === 'loading') {\n    document.addEventListener('DOMContentLoaded', initNav);\n  } else {\n    initNav();\n  }\n})();\n</script>\n<!-- TDS_NAV_HARDENING_SCRIPT_END -->\n'''


def remove_existing_block(text: str, start: str, end: str) -> str:
    return re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\s*', '', text, flags=re.S)

changed = []
for path in ROOT.rglob('*.html'):
    text = path.read_text(encoding='utf-8-sig')
    original = text

    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)

    text = remove_existing_block(text, '<!-- TDS_NAV_HARDENING_STYLE_START -->', '<!-- TDS_NAV_HARDENING_STYLE_END -->')
    text = remove_existing_block(text, '<!-- TDS_NAV_HARDENING_SCRIPT_START -->', '<!-- TDS_NAV_HARDENING_SCRIPT_END -->')

    if '</head>' in text:
        text = text.replace('</head>', STYLE + '\n</head>', 1)
    if '</body>' in text:
        text = text.replace('</body>', SCRIPT + '\n</body>', 1)

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed.append(str(path))

print(f'Navbar hardening applied to {len(changed)} HTML files')
for item in changed:
    print(item)
