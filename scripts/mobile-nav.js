(function () {
  'use strict';

  if (window.__TDS_UNIFIED_MOBILE_NAV__) return;
  window.__TDS_UNIFIED_MOBILE_NAV__ = true;

  var BOOKING_URL = 'https://wa.me/27780336394?text=Hello%20TeleDoctorSA%2C%20I%20would%20like%20to%20book%20a%20consultation.';

  var path = (window.location.pathname || '/').split('/').pop().toLowerCase() || 'index.html';

  function addStyles() {
    if (document.getElementById('tds-unified-mobile-nav-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-unified-mobile-nav-styles';
    style.textContent = `
      .tds-unified-mobile-nav,
      .tds-unified-offer-backdrop,
      .tds-unified-offer-sheet { display: none; }

      @media (max-width: 767px) {
        body {
          padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)) !important;
        }

        /* One mobile navigation system only. */
        .sticky-mobile-cta,
        .mobile-bottom-nav,
        .bottom-nav,
        .bottom-navigation,
        .mobile-navigation,
        .topbar .audience-nav,
        .hamburger,
        .nav-links {
          display: none !important;
        }

        .tds-unified-mobile-nav {
          position: fixed !important;
          left: 50% !important;
          right: auto !important;
          top: auto !important;
          bottom: calc(12px + env(safe-area-inset-bottom, 0px)) !important;
          transform: translateX(-50%) !important;
          z-index: 5000 !important;
          display: block !important;
          width: min(94vw, 430px) !important;
          margin: 0 !important;
          padding: 8px !important;
          border: 1px solid rgba(15,23,42,.10) !important;
          border-radius: 26px !important;
          background: rgba(255,255,255,.94) !important;
          -webkit-backdrop-filter: blur(20px) saturate(150%) !important;
          backdrop-filter: blur(20px) saturate(150%) !important;
          box-shadow: 0 18px 46px rgba(15,23,42,.18) !important;
        }

        .tds-unified-mobile-nav__row {
          display: grid !important;
          grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
          gap: 4px !important;
          align-items: stretch !important;
        }

        .tds-unified-mobile-nav__item {
          position: relative !important;
          display: flex !important;
          min-width: 0 !important;
          min-height: 58px !important;
          padding: 7px 3px !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          border: 0 !important;
          border-radius: 18px !important;
          background: transparent !important;
          color: #64748b !important;
          text-decoration: none !important;
          text-align: center !important;
          font: 800 9.5px/1.05 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: -.01em !important;
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
          appearance: none !important;
        }

        .tds-unified-mobile-nav__item svg {
          width: 20px !important;
          height: 20px !important;
          flex: 0 0 auto !important;
          stroke-width: 1.8 !important;
        }

        .tds-unified-mobile-nav__item span:last-child {
          display: block !important;
          max-width: 100% !important;
          white-space: normal !important;
        }

        .tds-unified-mobile-nav__item[aria-current='page'] {
          color: #0f172a !important;
          background: #fff3ea !important;
          box-shadow: inset 0 0 0 1px rgba(255,136,68,.22) !important;
        }

        .tds-unified-mobile-nav__item[aria-current='page'] svg {
          color: #ff8844 !important;
        }

        .tds-unified-mobile-nav__item:active {
          transform: scale(.97) !important;
        }

        .tds-unified-offer-backdrop {
          position: fixed !important;
          inset: 0 !important;
          z-index: 5100 !important;
          display: block !important;
          background: rgba(15,23,42,.46) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          transition: opacity .22s ease, visibility .22s ease !important;
        }

        .tds-unified-offer-sheet {
          position: fixed !important;
          left: 50% !important;
          bottom: 0 !important;
          z-index: 5200 !important;
          display: block !important;
          width: min(100%, 520px) !important;
          max-height: min(72vh, 620px) !important;
          padding: 12px 16px calc(22px + env(safe-area-inset-bottom, 0px)) !important;
          overflow-y: auto !important;
          border-radius: 26px 26px 0 0 !important;
          background: #ffffff !important;
          box-shadow: 0 -24px 70px rgba(15,23,42,.22) !important;
          transform: translate(-50%, 105%) !important;
          transition: transform .28s cubic-bezier(.2,.8,.2,1) !important;
        }

        html.tds-unified-offer-open .tds-unified-offer-backdrop {
          opacity: 1 !important;
          visibility: visible !important;
        }

        html.tds-unified-offer-open .tds-unified-offer-sheet {
          transform: translate(-50%, 0) !important;
        }

        html.tds-unified-offer-open,
        html.tds-unified-offer-open body {
          overflow: hidden !important;
        }

        .tds-unified-sheet-handle {
          width: 42px !important;
          height: 4px !important;
          margin: 0 auto 14px !important;
          border-radius: 99px !important;
          background: #cbd5e1 !important;
        }

        .tds-unified-sheet-header {
          display: flex !important;
          align-items: flex-start !important;
          justify-content: space-between !important;
          gap: 16px !important;
          padding: 4px 2px 14px !important;
        }

        .tds-unified-sheet-header h2 {
          margin: 0 !important;
          color: #0f172a !important;
          font: 800 1.35rem/1.12 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: -.03em !important;
        }

        .tds-unified-sheet-header p {
          margin: 6px 0 0 !important;
          color: #64748b !important;
          font: 500 .85rem/1.45 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        .tds-unified-sheet-close {
          width: 38px !important;
          height: 38px !important;
          display: grid !important;
          place-items: center !important;
          flex: 0 0 38px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          background: #f8fafc !important;
          color: #0f172a !important;
          font-size: 22px !important;
          cursor: pointer !important;
        }

        .tds-unified-sheet-grid {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0,1fr)) !important;
          gap: 10px !important;
        }

        .tds-unified-sheet-link {
          display: flex !important;
          min-height: 94px !important;
          padding: 15px !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          gap: 10px !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          background: #f8fafc !important;
          color: #0f172a !important;
          text-decoration: none !important;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        .tds-unified-sheet-link strong {
          font-size: .9rem !important;
          line-height: 1.2 !important;
        }

        .tds-unified-sheet-link small {
          color: #64748b !important;
          font-size: .74rem !important;
          line-height: 1.35 !important;
        }

        .tds-unified-sheet-link--primary {
          background: #fff3ea !important;
          border-color: rgba(255,136,68,.28) !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tds-unified-mobile-nav__item,
        .tds-unified-offer-backdrop,
        .tds-unified-offer-sheet { transition: none !important; }
      }
    `;

    document.head.appendChild(style);
  }

  function removeLegacyMobileMenus() {
    document.querySelectorAll('.tds-mobile-nav, .sticky-mobile-cta, .mobile-bottom-nav, .bottom-nav, .bottom-navigation, .mobile-navigation').forEach(function (node) {
      if (node.id !== 'tds-unified-mobile-nav') node.remove();
    });

    document.querySelectorAll('.tds-offer-sheet, .tds-offer-sheet-backdrop').forEach(function (node) {
      node.remove();
    });
  }

  function activeKey() {
    if (path === 'index.html' || path === '') return 'home';
    if (path === 'about-us.html') return 'about';
    if (path === 'telemedia-suite.html') return 'telemedia';
    if (path === 'our-services.html' || path === 'doctors.html' || path === 'nurses.html' || path === 'patients.html' || path === 'patients-portal.html') return 'services';
    if (path === 'ehr.html' || path === 'ecg247.html' || path === 'app.html' || path === 'teledoctorsa-app.html' || path === 'audience-products.html' || path === 'virtual-consultations.html') return 'offer';
    return '';
  }

  function icon(svg) {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' + svg + '</svg>';
  }

  function render() {
    removeLegacyMobileMenus();
    if (document.getElementById('tds-unified-mobile-nav')) return;

    var current = activeKey();

    var nav = document.createElement('nav');
    nav.id = 'tds-unified-mobile-nav';
    nav.className = 'tds-unified-mobile-nav';
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.innerHTML =
      '<div class="tds-unified-mobile-nav__row">' +
        '<a class="tds-unified-mobile-nav__item" data-key="home" href="/index.html">' +
          icon('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" stroke="currentColor" stroke-linejoin="round"/>') +
          '<span>Home</span></a>' +
        '<a class="tds-unified-mobile-nav__item" data-key="about" href="/about-us.html">' +
          icon('<circle cx="12" cy="12" r="9" stroke="currentColor"/><path d="M12 11v6M12 8h.01" stroke="currentColor" stroke-linecap="round"/>') +
          '<span>About</span></a>' +
        '<button class="tds-unified-mobile-nav__item" data-key="offer" type="button" data-tds-unified-offer-open>' +
          icon('<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-linecap="round"/>') +
          '<span>What we offer</span></button>' +
        '<a class="tds-unified-mobile-nav__item" data-key="services" href="/our-services.html">' +
          icon('<path d="M7 7h10v10H7zM9 2h6M9 22h6M2 9v6M22 9v6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>') +
          '<span>Services</span></a>' +
        '<a class="tds-unified-mobile-nav__item" data-key="telemedia" href="/telemedia-suite.html">' +
          icon('<path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" stroke="currentColor" stroke-linejoin="round"/>') +
          '<span>Telemedia</span></a>' +
      '</div>';

    nav.querySelectorAll('[data-key]').forEach(function (item) {
      if (item.getAttribute('data-key') === current) item.setAttribute('aria-current', 'page');
    });

    var backdrop = document.createElement('div');
    backdrop.className = 'tds-unified-offer-backdrop';
    backdrop.setAttribute('data-tds-unified-offer-close', '');

    var sheet = document.createElement('section');
    sheet.className = 'tds-unified-offer-sheet';
    sheet.setAttribute('aria-label', 'What we offer');
    sheet.innerHTML =
      '<div class="tds-unified-sheet-handle" aria-hidden="true"></div>' +
      '<div class="tds-unified-sheet-header">' +
        '<div><h2>What we offer</h2><p>Choose the care or platform path you need.</p></div>' +
        '<button class="tds-unified-sheet-close" type="button" aria-label="Close" data-tds-unified-offer-close>×</button>' +
      '</div>' +
      '<div class="tds-unified-sheet-grid">' +
        '<a class="tds-unified-sheet-link tds-unified-sheet-link--primary" href="' + BOOKING_URL + '" target="_blank" rel="noopener noreferrer"><strong>Book a consultation</strong><small>Start a WhatsApp booking message</small></a>' +
        '<a class="tds-unified-sheet-link" href="/ecg247.html"><strong>ECG247 monitoring</strong><small>Remote heart rhythm monitoring</small></a>' +
        '<a class="tds-unified-sheet-link" href="/teledoctorsa-app.html"><strong>Patient app</strong><small>Connected patient access and follow-up</small></a>' +
        '<a class="tds-unified-sheet-link" href="/ehr.html"><strong>Medical records</strong><small>Electronic health record access</small></a>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);
    document.body.appendChild(nav);

    function openSheet() {
      document.documentElement.classList.add('tds-unified-offer-open');
    }

    function closeSheet() {
      document.documentElement.classList.remove('tds-unified-offer-open');
    }

    nav.querySelector('[data-tds-unified-offer-open]').addEventListener('click', openSheet);
    document.querySelectorAll('[data-tds-unified-offer-close]').forEach(function (item) {
      item.addEventListener('click', closeSheet);
    });
    sheet.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeSheet);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeSheet();
    });
  }

  function init() {
    addStyles();
    render();

    var observer = new MutationObserver(function () {
      var legacy = document.querySelector('.tds-mobile-nav, .sticky-mobile-cta, .mobile-bottom-nav, .bottom-nav, .bottom-navigation, .mobile-navigation');
      if (legacy) removeLegacyMobileMenus();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
