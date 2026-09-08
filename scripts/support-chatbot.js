(function () {
  'use strict';

  function addStyles() {
    if (document.getElementById('tds-nav-fix-styles')) return;
    var style = document.createElement('style');
    style.id = 'tds-nav-fix-styles';
    style.textContent = `
      html, body { overflow-x: hidden !important; }
      body.tds-nav-open { overflow: hidden !important; }

      nav:not(.tds-mobile-nav) {
        position: relative !important;
        z-index: 100 !important;
      }

      .tds-global-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        background: rgba(15, 23, 42, .62) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: 2147483645 !important;
        transition: opacity .22s ease, visibility .22s ease !important;
      }

      .tds-global-overlay.active {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      .tds-global-panel {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        width: min(520px, 42vw) !important;
        max-width: 520px !important;
        height: 100dvh !important;
        margin: 0 !important;
        padding: 40px 32px !important;
        background: #fff !important;
        color: #0F172A !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        overscroll-behavior: contain !important;
        box-shadow: -24px 0 64px rgba(15, 23, 42, .24) !important;
        transform: translate3d(105%, 0, 0) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: 2147483646 !important;
        isolation: isolate !important;
        transition: transform .3s cubic-bezier(.22,.8,.2,1), opacity .18s ease, visibility 0s linear .3s !important;
      }

      .tds-global-panel.active {
        transform: translate3d(0, 0, 0) !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transition-delay: 0s !important;
      }

      .tds-global-panel *,
      .tds-global-panel *::before,
      .tds-global-panel *::after {
        box-sizing: border-box !important;
      }

      .tds-global-panel .mega-menu-item {
        position: relative !important;
        z-index: 1 !important;
        background: #fff !important;
      }

      @media (max-width: 900px) {
        nav:not(.tds-mobile-nav) .hamburger {
          display: flex !important;
          position: relative !important;
          z-index: 1002 !important;
        }

        nav:not(.tds-mobile-nav) .nav-links {
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          width: min(86vw, 360px) !important;
          height: 100dvh !important;
          padding: 92px 24px 32px !important;
          margin: 0 !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 0 !important;
          background: #fff !important;
          border-left: 1px solid #E2E8F0 !important;
          box-shadow: -18px 0 48px rgba(15, 23, 42, .16) !important;
          overflow-y: auto !important;
          transform: translate3d(105%, 0, 0) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          z-index: 1001 !important;
          transition: transform .28s ease, opacity .2s ease, visibility 0s linear .28s !important;
        }

        nav:not(.tds-mobile-nav) .nav-links.active {
          transform: translate3d(0, 0, 0) !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transition-delay: 0s !important;
        }

        nav:not(.tds-mobile-nav) .nav-links > a,
        nav:not(.tds-mobile-nav) .nav-links > .dropdown > a {
          display: flex !important;
          width: 100% !important;
          min-height: 52px !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 14px 4px !important;
          border-bottom: 1px solid #E2E8F0 !important;
          color: #0F172A !important;
          text-decoration: none !important;
        }

        nav:not(.tds-mobile-nav) .dropdown { width: 100% !important; }

        .tds-global-panel {
          width: min(92vw, 420px) !important;
          max-width: 420px !important;
          padding: 28px 22px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function fixLegacyLinks() {
    var replacements = {
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
      'app (1).html': 'app.html'
    };

    var cleanRoutes = {
      '/ehr': 'ehr.html',
      '/app': 'app.html',
      '/ecg247': 'ecg247.html',
      'ehr': 'ehr.html',
      'app': 'app.html',
      'ecg247': 'ecg247.html'
    };

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      Object.keys(replacements).forEach(function (oldName) {
        href = href.replace(oldName, replacements[oldName]);
      });
      if (cleanRoutes[href]) href = cleanRoutes[href];
      link.setAttribute('href', href);
    });
  }

  function init() {
    addStyles();
    fixLegacyLinks();

    var nav = document.querySelector('nav:not(.tds-mobile-nav)');
    if (!nav) return;

    var panel = nav.querySelector('.dropdown-content');
    var panelOverlay = nav.querySelector('.side-panel-overlay');
    var panelTrigger = nav.querySelector('.dropdown > a');
    var panelClose = panel ? panel.querySelector('.panel-close') : null;

    if (panel && !panel.classList.contains('tds-global-panel')) {
      panel.classList.add('tds-global-panel');
      document.body.appendChild(panel);
    }
    if (panelOverlay && !panelOverlay.classList.contains('tds-global-overlay')) {
      panelOverlay.classList.add('tds-global-overlay');
      document.body.appendChild(panelOverlay);
    }

    function panelOpen() {
      return panel && panel.classList.contains('active');
    }

    function openPanel(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (!panel) return;
      panel.classList.add('active');
      if (panelOverlay) panelOverlay.classList.add('active');
      document.body.classList.add('tds-nav-open');
      if (panelTrigger) panelTrigger.setAttribute('aria-expanded', 'true');
    }

    function closePanel(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (!panel) return;
      panel.classList.remove('active');
      if (panelOverlay) panelOverlay.classList.remove('active');
      document.body.classList.remove('tds-nav-open');
      if (panelTrigger) panelTrigger.setAttribute('aria-expanded', 'false');
    }

    if (panelTrigger) {
      var cleanTrigger = panelTrigger.cloneNode(true);
      panelTrigger.parentNode.replaceChild(cleanTrigger, panelTrigger);
      panelTrigger = cleanTrigger;
      panelTrigger.setAttribute('aria-expanded', 'false');
      panelTrigger.addEventListener('click', openPanel, true);
    }

    if (panelClose) {
      var cleanClose = panelClose.cloneNode(true);
      panelClose.parentNode.replaceChild(cleanClose, panelClose);
      panelClose = cleanClose;
      panelClose.addEventListener('click', closePanel, true);
    }

    if (panelOverlay) {
      var cleanPanelOverlay = panelOverlay.cloneNode(false);
      cleanPanelOverlay.className = panelOverlay.className;
      panelOverlay.parentNode.replaceChild(cleanPanelOverlay, panelOverlay);
      panelOverlay = cleanPanelOverlay;
      panelOverlay.addEventListener('click', closePanel, true);
    }

    var originalButton = nav.querySelector('#hamburgerBtn, .hamburger');
    var navLinks = nav.querySelector('#navLinks, .nav-links');
    var mobileOverlay = document.getElementById('mobileOverlay') || document.querySelector('.mobile-overlay');

    if (originalButton && navLinks) {
      var button = originalButton.cloneNode(true);
      originalButton.parentNode.replaceChild(button, originalButton);
      if (!navLinks.id) navLinks.id = 'navLinks';
      button.setAttribute('aria-controls', navLinks.id);
      button.setAttribute('aria-expanded', 'false');

      function menuOpen() {
        return navLinks.classList.contains('active');
      }

      function openMenu(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        navLinks.classList.add('active');
        button.classList.add('active');
        if (mobileOverlay) mobileOverlay.classList.add('active');
        document.body.classList.add('tds-nav-open');
        button.setAttribute('aria-expanded', 'true');
      }

      function closeMenu(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        navLinks.classList.remove('active');
        button.classList.remove('active');
        if (mobileOverlay) mobileOverlay.classList.remove('active');
        if (!panelOpen()) document.body.classList.remove('tds-nav-open');
        button.setAttribute('aria-expanded', 'false');
      }

      button.addEventListener('click', function (event) {
        menuOpen() ? closeMenu(event) : openMenu(event);
      }, true);

      if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu, true);

      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          var href = link.getAttribute('href') || '';
          if (href && href !== '#') closeMenu();
        });
      });

      window.addEventListener('resize', function () {
        if (window.innerWidth > 900 && menuOpen()) closeMenu();
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (panelOpen()) closePanel();
        if (navLinks && navLinks.classList.contains('active')) navLinks.classList.remove('active');
        document.body.classList.remove('tds-nav-open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
