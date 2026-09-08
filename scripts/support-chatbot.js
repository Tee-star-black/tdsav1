(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById('tdsa-nav-stability')) return;

    var style = document.createElement('style');
    style.id = 'tdsa-nav-stability';
    style.textContent = `
      html, body {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: clip !important;
      }

      body.tdsa-menu-open {
        overflow: hidden !important;
      }

      nav:not(.tds-mobile-nav) {
        position: relative !important;
        z-index: 2147483000 !important;
      }

      nav:not(.tds-mobile-nav) .side-panel-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        margin: 0 !important;
        background: rgba(15, 23, 42, .62) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: 2147483001 !important;
        transition: opacity .22s ease, visibility .22s ease !important;
      }

      nav:not(.tds-mobile-nav) .side-panel-overlay.active {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      nav:not(.tds-mobile-nav) .dropdown-content {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        left: auto !important;
        width: min(520px, 42vw) !important;
        max-width: 520px !important;
        height: 100dvh !important;
        margin: 0 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        background: #fff !important;
        box-shadow: -24px 0 64px rgba(15, 23, 42, .22) !important;
        transform: translate3d(105%, 0, 0) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: 2147483002 !important;
        transition: transform .28s ease, opacity .18s ease, visibility .28s ease !important;
        will-change: transform !important;
      }

      nav:not(.tds-mobile-nav) .dropdown-content.active {
        transform: translate3d(0, 0, 0) !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      @media (max-width: 900px) {
        nav:not(.tds-mobile-nav) .hamburger {
          display: flex !important;
          position: relative !important;
          z-index: 2147483004 !important;
        }

        nav:not(.tds-mobile-nav) .nav-links {
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          width: min(86vw, 360px) !important;
          height: 100dvh !important;
          margin: 0 !important;
          padding: 92px 24px 32px !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 0 !important;
          background: #fff !important;
          border-left: 1px solid #E2E8F0 !important;
          box-shadow: -18px 0 48px rgba(15,23,42,.16) !important;
          overflow-y: auto !important;
          transform: translate3d(105%,0,0) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          z-index: 2147483003 !important;
          transition: transform .26s ease, opacity .18s ease, visibility .26s ease !important;
        }

        nav:not(.tds-mobile-nav) .nav-links.active {
          transform: translate3d(0,0,0) !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }

        nav:not(.tds-mobile-nav) .dropdown-content {
          position: static !important;
          width: 100% !important;
          max-width: none !important;
          height: auto !important;
          margin: 8px 0 12px !important;
          padding: 0 !important;
          display: none !important;
          transform: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          box-shadow: none !important;
          border: 1px solid #E2E8F0 !important;
        }

        nav:not(.tds-mobile-nav) .dropdown-content.active {
          display: block !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function repairLinks() {
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

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      Object.keys(replacements).forEach(function (oldName) {
        href = href.replace(oldName, replacements[oldName]);
      });
      link.setAttribute('href', href);
    });
  }

  function init() {
    injectStyles();
    repairLinks();

    var nav = document.querySelector('nav:not(.tds-mobile-nav)');
    if (!nav) return;

    var navLinks = nav.querySelector('#navLinks, .nav-links');
    var hamburger = nav.querySelector('#hamburgerBtn, .hamburger');
    var overlay = nav.querySelector('.side-panel-overlay') || document.querySelector('.side-panel-overlay');
    var panel = nav.querySelector('.dropdown-content');
    var panelClose = nav.querySelector('.panel-close');
    var dropdownTrigger = nav.querySelector('.dropdown > a');
    var mobileOverlay = document.getElementById('mobileOverlay') || document.querySelector('.mobile-overlay');

    function openDesktopPanel() {
      if (!panel) return;
      panel.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('tdsa-menu-open');
    }

    function closeDesktopPanel() {
      if (panel) panel.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('tdsa-menu-open');
    }

    function openMobileMenu() {
      if (!navLinks || !hamburger) return;
      navLinks.classList.add('active');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      if (mobileOverlay) mobileOverlay.classList.add('active');
      document.body.classList.add('tdsa-menu-open');
    }

    function closeMobileMenu() {
      if (navLinks) navLinks.classList.remove('active');
      if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
      if (mobileOverlay) mobileOverlay.classList.remove('active');
      document.body.classList.remove('tdsa-menu-open');
      if (window.innerWidth <= 900) closeDesktopPanel();
    }

    if (dropdownTrigger) {
      dropdownTrigger.addEventListener('click', function (event) {
        if (window.innerWidth <= 900) {
          if (panel) {
            event.preventDefault();
            event.stopImmediatePropagation();
            panel.classList.toggle('active');
          }
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        panel && panel.classList.contains('active') ? closeDesktopPanel() : openDesktopPanel();
      }, true);
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeDesktopPanel();
      }, true);
    }

    if (panelClose) {
      panelClose.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeDesktopPanel();
      }, true);
    }

    if (hamburger && navLinks) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        navLinks.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
      }, true);
    }

    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', function () {
        closeMobileMenu();
      }, true);
    }

    if (navLinks) {
      navLinks.querySelectorAll('a[href]').forEach(function (link) {
        link.addEventListener('click', function () {
          var href = link.getAttribute('href') || '';
          if (window.innerWidth <= 900 && href && href !== '#' && !link.matches('.dropdown > a')) {
            closeMobileMenu();
          }
        });
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      closeDesktopPanel();
      closeMobileMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMobileMenu();
      else closeDesktopPanel();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
