(function () {
  'use strict';

  function injectNavStyles() {
    if (document.getElementById('tds-nav-fix-styles')) return;
    var style = document.createElement('style');
    style.id = 'tds-nav-fix-styles';
    style.textContent = `
      body.tds-nav-open { overflow: hidden !important; }

      /* Keep the primary navigation above every page section. */
      nav:not(.tds-mobile-nav) {
        z-index: 2147483000 !important;
      }

      /* Desktop What We Offer panel must sit above hero/content layers. */
      nav:not(.tds-mobile-nav) .side-panel-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        background: rgba(15, 23, 42, .62) !important;
        backdrop-filter: blur(5px) !important;
        -webkit-backdrop-filter: blur(5px) !important;
        z-index: 2147483001 !important;
      }

      nav:not(.tds-mobile-nav) .dropdown-content {
        z-index: 2147483002 !important;
        background: #fff !important;
        isolation: isolate !important;
      }

      nav:not(.tds-mobile-nav) .dropdown-content.active {
        right: 0 !important;
      }

      @media (min-width: 901px) {
        nav:not(.tds-mobile-nav) .dropdown-content {
          width: min(520px, 42vw) !important;
          max-width: 520px !important;
          height: 100dvh !important;
          overflow-y: auto !important;
          overscroll-behavior: contain !important;
          box-shadow: -24px 0 64px rgba(15, 23, 42, .22) !important;
        }

        nav:not(.tds-mobile-nav) .dropdown-content .mega-menu-item {
          position: relative !important;
          z-index: 1 !important;
          background: #fff !important;
        }
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
          right: -100% !important;
          width: min(86vw, 360px) !important;
          height: 100dvh !important;
          padding: 92px 24px 32px !important;
          margin: 0 !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 0 !important;
          background: #fff !important;
          border-left: 1px solid #E2E8F0 !important;
          box-shadow: -18px 0 48px rgba(15,23,42,.16) !important;
          overflow-y: auto !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          z-index: 2147483003 !important;
          transition: right .28s ease, opacity .2s ease, visibility 0s linear .28s !important;
        }
        nav:not(.tds-mobile-nav) .nav-links.active {
          right: 0 !important;
          visibility: visible !important;
          opacity: 1 !important;
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
        nav:not(.tds-mobile-nav) .dropdown-content {
          position: static !important;
          right: auto !important;
          width: 100% !important;
          max-width: none !important;
          height: auto !important;
          max-height: none !important;
          margin: 8px 0 12px !important;
          padding: 0 !important;
          display: none !important;
          box-shadow: none !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          background: #F8FAFC !important;
        }
        nav:not(.tds-mobile-nav) .dropdown-content.active { display: block !important; }
        .mobile-overlay {
          display: block !important;
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          background: rgba(15,23,42,.56) !important;
          backdrop-filter: blur(4px) !important;
          -webkit-backdrop-filter: blur(4px) !important;
          z-index: 2147483001 !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transition: opacity .22s ease, visibility .22s ease !important;
        }
        .mobile-overlay.active {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function repairLegacyLinks() {
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

  function initNavbar() {
    injectNavStyles();
    repairLegacyLinks();

    var nav = document.querySelector('nav:not(.tds-mobile-nav)');
    if (!nav) return;

    var originalButton = nav.querySelector('#hamburgerBtn, .hamburger');
    var navLinks = nav.querySelector('#navLinks, .nav-links');
    var originalOverlay = document.getElementById('mobileOverlay') || document.querySelector('.mobile-overlay');
    if (!originalButton || !navLinks) return;

    var button = originalButton.cloneNode(true);
    originalButton.parentNode.replaceChild(button, originalButton);

    var overlay = originalOverlay;
    if (originalOverlay) {
      overlay = originalOverlay.cloneNode(true);
      originalOverlay.parentNode.replaceChild(overlay, originalOverlay);
    }

    if (!navLinks.id) navLinks.id = 'navLinks';
    button.setAttribute('aria-controls', navLinks.id);
    button.setAttribute('aria-expanded', 'false');

    function menuOpen() {
      return navLinks.classList.contains('active');
    }

    function closeDropdowns() {
      nav.querySelectorAll('.dropdown-content.active').forEach(function (panel) {
        panel.classList.remove('active');
      });
      nav.querySelectorAll('.side-panel-overlay.active').forEach(function (panelOverlay) {
        panelOverlay.classList.remove('active');
      });
    }

    function openMenu() {
      navLinks.classList.add('active');
      button.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.classList.add('tds-nav-open');
      button.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
      navLinks.classList.remove('active');
      button.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('tds-nav-open');
      button.setAttribute('aria-expanded', 'false');
      closeDropdowns();
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      menuOpen() ? closeMenu() : openMenu();
    }, true);

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        closeMenu();
      }, true);
    }

    navLinks.querySelectorAll('.dropdown > a').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        if (window.innerWidth > 900) return;
        var panel = trigger.parentElement.querySelector('.dropdown-content');
        if (!panel) return;
        event.preventDefault();
        event.stopPropagation();
        nav.querySelectorAll('.dropdown-content.active').forEach(function (other) {
          if (other !== panel) other.classList.remove('active');
        });
        panel.classList.toggle('active');
      }, true);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        var href = link.getAttribute('href') || '';
        if (href && href !== '#' && !link.matches('.dropdown > a')) {
          closeMenu();
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        if (menuOpen()) {
          closeMenu();
          button.focus();
        } else {
          closeDropdowns();
          document.body.classList.remove('tds-nav-open');
        }
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && menuOpen()) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
