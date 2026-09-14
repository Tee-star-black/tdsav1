(function () {
  'use strict';

  if (window.__TDS_CANONICAL_NAV__) return;
  window.__TDS_CANONICAL_NAV__ = true;

  function addStyles() {
    if (document.getElementById('tds-canonical-nav-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-canonical-nav-styles';
    style.textContent = `
      nav.tds-site-nav {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        min-height: 70px !important;
        margin: 0 !important;
        padding: 10px clamp(18px, 4vw, 56px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 24px !important;
        background: rgba(255,255,255,.98) !important;
        border-bottom: 1px solid #e2e8f0 !important;
        box-shadow: 0 8px 28px rgba(15,23,42,.06) !important;
        -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
        backdrop-filter: blur(18px) saturate(140%) !important;
        z-index: 1600 !important;
      }

      nav.tds-site-nav .logo {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        flex: 0 0 auto !important;
        color: #0f172a !important;
        text-decoration: none !important;
      }

      nav.tds-site-nav .logo img {
        width: 42px !important;
        height: 42px !important;
        max-width: 42px !important;
        max-height: 42px !important;
        object-fit: contain !important;
      }

      nav.tds-site-nav .logo-text {
        display: inline-flex !important;
        align-items: baseline !important;
        gap: 0 !important;
        color: #0f172a !important;
        font: 800 1.1rem/1 'Plus Jakarta Sans', system-ui, sans-serif !important;
        letter-spacing: -.03em !important;
      }

      nav.tds-site-nav .logo-text::before { display: none !important; }
      nav.tds-site-nav .logo-text span { color: #ff8844 !important; }

      nav.tds-site-nav .nav-links {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: clamp(12px, 1.5vw, 22px) !important;
        margin: 0 !important;
        padding: 0 !important;
        min-width: 0 !important;
      }

      nav.tds-site-nav .nav-links > a,
      nav.tds-site-nav .dropdown > a {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 9px 0 !important;
        color: #0f172a !important;
        background: transparent !important;
        border: 0 !important;
        text-decoration: none !important;
        white-space: nowrap !important;
        font: 700 .84rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      nav.tds-site-nav .nav-links > a:hover,
      nav.tds-site-nav .nav-links > a.active,
      nav.tds-site-nav .dropdown > a:hover,
      nav.tds-site-nav .dropdown > a[aria-expanded='true'] {
        color: #ff8844 !important;
      }

      nav.tds-site-nav .dropdown,
      nav.tds-site-nav .contact-dropdown {
        position: relative !important;
        display: block !important;
      }

      nav.tds-site-nav .btn-main {
        min-height: 40px !important;
        padding: 10px 14px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        color: #fff !important;
        background: #0f172a !important;
        border: 1px solid #0f172a !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        font: 800 .8rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
        cursor: pointer !important;
      }

      nav.tds-site-nav .btn-main:hover,
      nav.tds-site-nav .contact-dropdown.tds-contact-open .btn-main {
        background: #ff8844 !important;
        border-color: #ff8844 !important;
      }

      nav.tds-site-nav .contact-menu {
        position: absolute !important;
        top: calc(100% + 12px) !important;
        right: 0 !important;
        width: 320px !important;
        min-width: 320px !important;
        padding: 10px !important;
        display: grid !important;
        gap: 6px !important;
        background: #fff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0 !important;
        box-shadow: 0 20px 48px rgba(15,23,42,.14) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        transform: translateY(-8px) !important;
        transition: opacity 180ms ease, transform 220ms ease, visibility 180ms ease !important;
        z-index: 1750 !important;
      }

      nav.tds-site-nav .contact-dropdown.tds-contact-open .contact-menu {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translateY(0) !important;
      }

      nav.tds-site-nav .contact-menu-header {
        padding: 10px 10px 12px !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }

      nav.tds-site-nav .contact-menu-title {
        color: #0f172a !important;
        font: 800 .9rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      nav.tds-site-nav .contact-menu-subtitle {
        margin-top: 4px !important;
        color: #64748b !important;
        font: 500 .73rem/1.4 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      nav.tds-site-nav .contact-options { display: grid !important; gap: 4px !important; }

      nav.tds-site-nav .contact-option {
        min-height: 54px !important;
        padding: 10px !important;
        display: grid !important;
        grid-template-columns: 34px minmax(0,1fr) !important;
        align-items: center !important;
        gap: 10px !important;
        color: #0f172a !important;
        background: #fff !important;
        border: 1px solid transparent !important;
        border-radius: 0 !important;
        text-decoration: none !important;
      }

      nav.tds-site-nav .contact-option:hover {
        background: #fff8f3 !important;
        border-color: rgba(255,136,68,.22) !important;
      }

      nav.tds-site-nav .contact-option-icon {
        width: 34px !important;
        height: 34px !important;
        display: grid !important;
        place-items: center !important;
        color: #ff8844 !important;
        background: #fff3ea !important;
        border: 1px solid rgba(255,136,68,.18) !important;
        border-radius: 0 !important;
      }

      nav.tds-site-nav .contact-option-name {
        color: #0f172a !important;
        font: 800 .8rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      nav.tds-site-nav .contact-option-desc {
        margin-top: 2px !important;
        color: #64748b !important;
        font: 500 .7rem/1.35 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      nav.tds-site-nav .hamburger {
        display: none !important;
        width: 44px !important;
        height: 44px !important;
        padding: 10px !important;
        flex: 0 0 44px !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        background: transparent !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0 !important;
        cursor: pointer !important;
      }

      nav.tds-site-nav .hamburger span {
        width: 21px !important;
        height: 2px !important;
        display: block !important;
        background: #0f172a !important;
        border-radius: 0 !important;
        transition: transform 180ms ease, opacity 180ms ease !important;
      }

      .tds-canonical-mobile-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        background: rgba(15,23,42,.5) !important;
        -webkit-backdrop-filter: blur(3px) !important;
        backdrop-filter: blur(3px) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        z-index: 1501 !important;
      }

      .tds-canonical-mobile-overlay.active {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      @media (max-width: 900px) {
        nav.tds-site-nav {
          min-height: 64px !important;
          padding: 10px 16px !important;
        }

        nav.tds-site-nav .logo img {
          width: 40px !important;
          height: 40px !important;
        }

        nav.tds-site-nav .logo-text { font-size: 1rem !important; }
        nav.tds-site-nav .hamburger { display: flex !important; }
      }
    `;

    document.head.appendChild(style);
  }

  function chevron() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="15" height="15"><path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function buildNav() {
    var nav = document.createElement('nav');
    nav.className = 'tds-site-nav';
    nav.setAttribute('data-tds-canonical-nav', 'true');
    nav.setAttribute('aria-label', 'Primary navigation');

    nav.innerHTML =
      '<a href="/" class="logo" aria-label="TeleDoctorSA home">' +
        '<img src="/images/rebuild/logo.png" alt="TeleDoctorSA logo">' +
        '<span class="logo-text">TeleDoctor<span>SA</span></span>' +
      '</a>' +
      '<button class="hamburger" id="hamburgerBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
      '<div class="nav-links" id="navLinks">' +
        '<div class="dropdown">' +
          '<a href="/our-services" id="openPanelBtn" role="button" aria-haspopup="true" aria-expanded="false">What We Offer ' + chevron() + '</a>' +
          '<div class="dropdown-content" id="sidePanel" aria-label="What We Offer"></div>' +
        '</div>' +
        '<a href="/our-services">Services</a>' +
        '<a href="/about-us">About</a>' +
        '<a href="/telemedia-suite">TeleMedia Suite</a>' +
        '<a href="/contact-us">Contact</a>' +
        '<div class="contact-dropdown">' +
          '<button class="btn-main" type="button" aria-expanded="false">Contact us ' + chevron() + '</button>' +
          '<div class="contact-menu">' +
            '<div class="contact-menu-header"><div class="contact-menu-title">Get in touch</div><div class="contact-menu-subtitle">Choose your preferred contact method</div></div>' +
            '<div class="contact-options">' +
              '<a class="contact-option" href="https://wa.me/27780336394?text=Hi%20TeleDoctorSA%2C%20please%20may%20you%20contact%20me%3F%20Thanks." target="_blank" rel="noopener noreferrer"><span class="contact-option-icon">WA</span><span><span class="contact-option-name">WhatsApp</span><span class="contact-option-desc">Chat with the TeleDoctorSA team</span></span></a>' +
              '<a class="contact-option" href="tel:+27780336394"><span class="contact-option-icon">☎</span><span><span class="contact-option-name">Call</span><span class="contact-option-desc">+27 78 033 6394</span></span></a>' +
              '<a class="contact-option" href="mailto:info@teledoctorsa.co.za"><span class="contact-option-icon">@</span><span><span class="contact-option-name">Email</span><span class="contact-option-desc">info@teledoctorsa.co.za</span></span></a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    return nav;
  }

  function isPrimaryNav(nav) {
    if (!nav) return false;
    return !!(
      nav.matches('[data-tds-canonical-nav]') ||
      nav.querySelector('#hamburgerBtn') ||
      nav.querySelector('.hamburger') ||
      nav.querySelector('#navLinks') ||
      nav.querySelector('.nav-links') ||
      nav.querySelector('.logo')
    );
  }

  function markActive(nav) {
    var path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
    var aliases = {
      '/index.html': '/',
      '/our-services.html': '/our-services',
      '/about-us.html': '/about-us',
      '/telemedia-suite.html': '/telemedia-suite',
      '/contact-us.html': '/contact-us'
    };
    path = aliases[path] || path;

    nav.querySelectorAll('.nav-links > a[href]').forEach(function (link) {
      var href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (href === path) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function install() {
    if (!document.body) return;

    addStyles();

    var oldNavs = Array.prototype.slice.call(document.querySelectorAll('nav')).filter(isPrimaryNav);
    var anchor = oldNavs.length ? oldNavs[0] : document.body.firstChild;
    var nav = buildNav();

    document.querySelectorAll('.mobile-overlay, #mobileOverlay').forEach(function (node) {
      node.remove();
    });

    if (oldNavs.length) {
      oldNavs[0].parentNode.replaceChild(nav, oldNavs[0]);
      oldNavs.slice(1).forEach(function (node) { node.remove(); });
    } else if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(nav, anchor);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }

    var overlay = document.createElement('div');
    overlay.id = 'mobileOverlay';
    overlay.className = 'mobile-overlay tds-canonical-mobile-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    nav.insertAdjacentElement('afterend', overlay);

    markActive(nav);
    document.body.setAttribute('data-tds-canonical-nav-ready', 'true');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
