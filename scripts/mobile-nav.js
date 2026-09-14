(function () {
  'use strict';

  if (window.__TDS_SITE_EXPERIENCE_V2__) return;
  window.__TDS_SITE_EXPERIENCE_V2__ = true;

  var MOBILE_MAX = 900;
  var WHATSAPP_URL = 'https://wa.me/27780336394?text=Hi%20TeleDoctorSA%2C%20please%20may%20you%20contact%20me%3F%20Thanks.';
  var FACEBOOK_URL = 'https://www.facebook.com/DrMukudu/';
  var INSTAGRAM_URL = 'https://www.instagram.com/drmukudu_andpartners/';

  function svgIcon(name) {
    var icons = {
      whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.5 11.6a8.3 8.3 0 0 1-12.2 7.3L4 20l1.2-4.1A8.3 8.3 0 1 1 20.5 11.6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8.3c.3-.4.7-.4 1-.1l.8 1.1c.2.3.2.6 0 .9l-.6.7c.7 1.4 1.7 2.4 3.1 3.1l.7-.6c.3-.2.6-.2.9 0l1.1.8c.3.3.3.7-.1 1-.6.6-1.4.9-2.2.7-3.1-.6-5.6-3.1-6.2-6.2-.2-.8.1-1.6.7-2.2Z" fill="currentColor"/></svg>',
      facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.4Z" fill="currentColor"/></svg>',
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.8" r="1" fill="currentColor"/></svg>',
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7.2 3.7 9.5 7c.3.5.3 1.1-.1 1.5L8 9.9c1.2 2.5 3.2 4.5 5.7 5.7l1.4-1.4c.4-.4 1-.4 1.5-.1l3.3 2.3c.5.3.7.9.5 1.5-.6 1.7-2.1 2.8-3.9 2.8-7.2 0-13.1-5.9-13.1-13.1 0-1.8 1.1-3.3 2.8-3.9.5-.2 1.1 0 1.4.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4.5 7 7.5 6 7.5-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };
    return icons[name] || '';
  }

  function addStyles() {
    if (document.getElementById('tds-site-experience-v2-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-site-experience-v2-styles';
    style.textContent = `
      html {
        scroll-behavior: smooth !important;
        scroll-padding-top: 88px !important;
      }

      body {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
      }

      body.tds-menu-open {
        overflow: hidden !important;
      }

      .tds-mobile-nav,
      .tds-unified-mobile-nav,
      .tds-offer-sheet,
      .tds-offer-sheet-backdrop,
      .tds-unified-offer-sheet,
      .tds-unified-offer-backdrop,
      .mobile-bottom-nav,
      .bottom-nav,
      .bottom-navigation,
      .sticky-mobile-cta {
        display: none !important;
      }

      .floating-shapes {
        display: none !important;
      }

      .logo-text::before,
      .hero-img,
      .hero-img::before,
      .objectives::after,
      .services::before,
      .services::after,
      .tagline::before,
      .tech-hex-pattern,
      .tech-particle,
      .tech-sparkle,
      .tech-line,
      .tech-decorator-shape {
        animation: none !important;
      }

      [data-aos] {
        transition-duration: 650ms !important;
        transition-timing-function: cubic-bezier(.22, 1, .36, 1) !important;
      }

      .contact-dropdown.tds-contact-open .contact-menu {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
      }

      .tds-mobile-socials {
        display: none;
      }

      .tds-social-link,
      .tds-footer-social-link {
        text-decoration: none !important;
      }

      .tds-social-link svg,
      .tds-footer-social-link svg {
        width: 20px !important;
        height: 20px !important;
        display: block !important;
      }

      .tds-canonical-footer {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 68px 5% 28px !important;
        position: relative !important;
        left: auto !important;
        right: auto !important;
        bottom: auto !important;
        display: block !important;
        background: #0f172a !important;
        color: #f8fafc !important;
        border-top: 1px solid rgba(255, 163, 102, .35) !important;
        box-shadow: none !important;
        overflow: hidden !important;
        z-index: 1 !important;
      }

      .tds-canonical-footer::before,
      .tds-canonical-footer::after {
        display: none !important;
      }

      .tds-footer-shell {
        width: min(1200px, 100%) !important;
        margin: 0 auto !important;
        position: relative !important;
        z-index: 1 !important;
      }

      .tds-footer-grid {
        display: grid !important;
        grid-template-columns: minmax(280px, 1.35fr) repeat(3, minmax(160px, .75fr)) !important;
        gap: clamp(28px, 4vw, 54px) !important;
        align-items: start !important;
      }

      .tds-footer-brandline {
        display: flex !important;
        align-items: center !important;
        gap: 14px !important;
        margin: 0 0 20px !important;
      }

      .tds-footer-brandline img {
        width: 54px !important;
        height: 54px !important;
        padding: 6px !important;
        object-fit: contain !important;
        background: #fff !important;
        border: 1px solid rgba(255,255,255,.16) !important;
        border-radius: 0 !important;
      }

      .tds-footer-brandline strong {
        display: block !important;
        margin: 0 0 3px !important;
        color: #fff !important;
        font: 800 1.2rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
        letter-spacing: -.025em !important;
      }

      .tds-footer-brandline span {
        display: block !important;
        color: rgba(248,250,252,.62) !important;
        font: 500 .82rem/1.45 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      .tds-footer-description {
        max-width: 460px !important;
        margin: 0 0 24px !important;
        color: rgba(248,250,252,.72) !important;
        font: 400 .94rem/1.75 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      .tds-footer-socials {
        display: flex !important;
        align-items: center !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
      }

      .tds-footer-social-link {
        width: 42px !important;
        height: 42px !important;
        display: inline-grid !important;
        place-items: center !important;
        color: #fff !important;
        background: rgba(255,255,255,.06) !important;
        border: 1px solid rgba(255,255,255,.14) !important;
        border-radius: 0 !important;
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease !important;
      }

      .tds-footer-social-link:hover {
        transform: translateY(-2px) !important;
        border-color: #ffa366 !important;
        background: rgba(255,163,102,.12) !important;
      }

      .tds-footer-column h3 {
        margin: 0 0 18px !important;
        color: #fff !important;
        font: 800 .95rem/1.25 'Plus Jakarta Sans', system-ui, sans-serif !important;
        letter-spacing: .02em !important;
      }

      .tds-footer-list {
        display: grid !important;
        gap: 11px !important;
      }

      .tds-footer-list a,
      .tds-footer-list span {
        color: rgba(248,250,252,.7) !important;
        text-decoration: none !important;
        font: 500 .9rem/1.55 'Plus Jakarta Sans', system-ui, sans-serif !important;
        transition: color 180ms ease !important;
      }

      .tds-footer-list a:hover {
        color: #ffa366 !important;
      }

      .tds-footer-bottom {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        flex-wrap: wrap !important;
        gap: 12px 24px !important;
        margin: 38px 0 0 !important;
        padding: 20px 0 0 !important;
        border-top: 1px solid rgba(255,255,255,.1) !important;
        color: rgba(248,250,252,.52) !important;
        font: 500 .8rem/1.55 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      @media (max-width: 768px) {
        #services.services {
          overflow: visible !important;
        }

        #services .services-header {
          margin-bottom: 34px !important;
        }

        #services .services-grid {
          display: grid !important;
          grid-template-columns: none !important;
          grid-auto-flow: column !important;
          grid-auto-columns: min(84vw, 360px) !important;
          gap: 16px !important;
          width: auto !important;
          max-width: none !important;
          margin-left: -20px !important;
          margin-right: -20px !important;
          padding: 2px 20px 18px !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior-x: contain !important;
          scroll-snap-type: x proximity !important;
          scrollbar-width: none !important;
          touch-action: auto !important;
          scroll-padding-inline: 20px !important;
        }

        #services .services-grid::-webkit-scrollbar {
          display: none !important;
        }

        #services .services-grid > .card {
          width: 100% !important;
          min-width: 0 !important;
          max-width: none !important;
          height: auto !important;
          scroll-snap-align: start !important;
          scroll-snap-stop: normal !important;
          touch-action: auto !important;
          transform: none !important;
          transition-delay: 0ms !important;
        }

        #services .services-grid > .card[data-aos],
        #services .services-grid > .card .card-content[data-aos] {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }

        #services .services-grid .card-img {
          height: 170px !important;
          border-radius: 0 !important;
        }
      }

      @media (max-width: 900px) {
        body {
          padding-bottom: 0 !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) {
          min-height: 64px !important;
          height: auto !important;
          padding: 10px 18px !important;
          justify-content: space-between !important;
          background: rgba(255,255,255,.97) !important;
          -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
          backdrop-filter: blur(18px) saturate(140%) !important;
          border-bottom: 1px solid rgba(15,23,42,.08) !important;
          box-shadow: 0 8px 30px rgba(15,23,42,.06) !important;
          z-index: 1500 !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .logo {
          margin: 0 !important;
          gap: 10px !important;
          max-width: calc(100% - 62px) !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .logo img {
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          min-height: 40px !important;
          max-width: 40px !important;
          max-height: 40px !important;
          object-fit: contain !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .logo-text {
          display: inline-flex !important;
          font-size: 1rem !important;
          white-space: nowrap !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .hamburger {
          width: 44px !important;
          height: 44px !important;
          min-width: 44px !important;
          padding: 10px !important;
          display: flex !important;
          position: relative !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 5px !important;
          border: 1px solid rgba(15,23,42,.1) !important;
          border-radius: 0 !important;
          background: #fff !important;
          z-index: 1503 !important;
          cursor: pointer !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .hamburger span {
          width: 22px !important;
          height: 2px !important;
          flex: 0 0 2px !important;
          border-radius: 0 !important;
          background: #0f172a !important;
          transform-origin: center !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .hamburger.active span:nth-child(1) {
          transform: translateY(7px) rotate(45deg) !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .hamburger.active span:nth-child(2) {
          opacity: 0 !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .hamburger.active span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg) !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .nav-links {
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          right: -100% !important;
          bottom: 0 !important;
          left: auto !important;
          width: min(88vw, 380px) !important;
          max-width: 380px !important;
          height: 100dvh !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 84px 22px 30px !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          gap: 0 !important;
          background: #fff !important;
          border-left: 1px solid rgba(15,23,42,.08) !important;
          border-radius: 0 !important;
          box-shadow: -24px 0 56px rgba(15,23,42,.16) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          overflow-y: auto !important;
          overscroll-behavior: contain !important;
          -webkit-overflow-scrolling: touch !important;
          z-index: 1502 !important;
          transition: right 320ms cubic-bezier(.22, 1, .36, 1), opacity 220ms ease, visibility 0s linear 320ms !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .nav-links.active {
          right: 0 !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transition-delay: 0s !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .nav-links > a,
        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .nav-links > .dropdown > a,
        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .nav-links > .contact-dropdown > button {
          width: 100% !important;
          min-height: 54px !important;
          margin: 0 !important;
          padding: 15px 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
          color: #0f172a !important;
          background: transparent !important;
          border: 0 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
          clip-path: none !important;
          box-shadow: none !important;
          text-decoration: none !important;
          text-align: left !important;
          font: 700 .98rem/1.35 'Plus Jakarta Sans', system-ui, sans-serif !important;
          transform: none !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .dropdown,
        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .contact-dropdown {
          width: 100% !important;
          display: block !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .dropdown-content {
          position: static !important;
          top: auto !important;
          right: auto !important;
          left: auto !important;
          width: 100% !important;
          height: auto !important;
          max-height: none !important;
          margin: 8px 0 14px !important;
          padding: 0 !important;
          display: none !important;
          overflow: hidden !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transform: none !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .dropdown-content.active {
          display: block !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .panel-header {
          display: none !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-grid {
          display: grid !important;
          gap: 0 !important;
          padding: 4px 12px !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-item {
          width: 100% !important;
          min-height: 0 !important;
          margin: 0 !important;
          padding: 14px 2px !important;
          display: grid !important;
          grid-template-columns: 34px 1fr !important;
          align-items: center !important;
          gap: 10px !important;
          background: transparent !important;
          border: 0 !important;
          border-bottom: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          transform: none !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-item:last-child {
          border-bottom: 0 !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-icon {
          width: 34px !important;
          height: 34px !important;
          border-radius: 0 !important;
          background: #fff3ea !important;
          color: #ff8844 !important;
          box-shadow: none !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-icon i,
        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-icon svg {
          width: 17px !important;
          height: 17px !important;
          color: #ff8844 !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-title {
          color: #0f172a !important;
          font-size: .88rem !important;
          line-height: 1.35 !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .mega-menu-desc {
          display: none !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .contact-menu {
          position: static !important;
          width: 100% !important;
          min-width: 0 !important;
          margin: 8px 0 14px !important;
          padding: 0 !important;
          display: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          overflow: hidden !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .contact-dropdown.tds-contact-open .contact-menu {
          display: block !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .contact-menu::before {
          display: none !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .contact-option {
          border-radius: 0 !important;
          transform: none !important;
        }

        .mobile-overlay {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          display: block !important;
          background: rgba(15,23,42,.5) !important;
          -webkit-backdrop-filter: blur(3px) !important;
          backdrop-filter: blur(3px) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          z-index: 1501 !important;
          transition: opacity 220ms ease, visibility 220ms ease !important;
        }

        .mobile-overlay.active {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
        }

        .side-panel-overlay {
          display: none !important;
        }

        .tds-mobile-socials {
          display: block !important;
          margin-top: 26px !important;
          padding-top: 20px !important;
          border-top: 1px solid #e2e8f0 !important;
        }

        .tds-mobile-socials-label {
          display: block !important;
          margin-bottom: 12px !important;
          color: #64748b !important;
          font: 700 .72rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: .12em !important;
          text-transform: uppercase !important;
        }

        .tds-mobile-socials-row {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 9px !important;
        }

        .tds-social-link {
          width: 44px !important;
          height: 44px !important;
          display: grid !important;
          place-items: center !important;
          color: #0f172a !important;
          background: #fff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
        }

        .tds-social-link:active {
          background: #fff3ea !important;
          border-color: #ffa366 !important;
        }

        .tech-particles,
        .tech-connection-lines,
        .tech-sparkle,
        .tech-hex-pattern,
        .tech-decorator-shape {
          display: none !important;
        }

        [data-aos] {
          transition-duration: 500ms !important;
        }
      }

      @media (max-width: 1024px) {
        .tds-footer-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .tds-footer-brand {
          grid-column: 1 / -1 !important;
        }
      }

      @media (max-width: 640px) {
        .tds-canonical-footer {
          padding: 52px 20px 26px !important;
        }

        .tds-footer-grid {
          grid-template-columns: 1fr !important;
          gap: 30px !important;
        }

        .tds-footer-brand {
          grid-column: auto !important;
        }

        .tds-footer-bottom {
          flex-direction: column !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto !important;
        }

        *,
        *::before,
        *::after {
          animation-duration: .01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: .01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function removeLegacyMobileNavigation() {
    document.documentElement.classList.remove('tdsui-offer-sheet-open');
    document.documentElement.classList.remove('tds-unified-offer-open');
    document.documentElement.classList.remove('tds-unified-mobile-nav-enabled');

    document.querySelectorAll(
      '.tds-mobile-nav, .tds-unified-mobile-nav, .tds-offer-sheet, .tds-offer-sheet-backdrop, .tds-unified-offer-sheet, .tds-unified-offer-backdrop, .mobile-bottom-nav, .bottom-nav, .bottom-navigation, .sticky-mobile-cta'
    ).forEach(function (node) {
      node.remove();
    });

    if (document.body) {
      document.body.style.removeProperty('padding-bottom');
      document.body.classList.remove('tds-nav-open');
      if (document.body.dataset.tdsPrevOverflow !== undefined) {
        delete document.body.dataset.tdsPrevOverflow;
      }
    }
  }

  function addMobileSocials(navLinks) {
    if (!navLinks || navLinks.querySelector('.tds-mobile-socials')) return;

    var socials = document.createElement('div');
    socials.className = 'tds-mobile-socials';
    socials.innerHTML =
      '<span class="tds-mobile-socials-label">Connect with TeleDoctorSA</span>' +
      '<div class="tds-mobile-socials-row">' +
        '<a class="tds-social-link" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer" aria-label="TeleDoctorSA on WhatsApp">' + svgIcon('whatsapp') + '</a>' +
        '<a class="tds-social-link" href="' + FACEBOOK_URL + '" target="_blank" rel="noopener noreferrer" aria-label="TeleDoctorSA on Facebook">' + svgIcon('facebook') + '</a>' +
        '<a class="tds-social-link" href="' + INSTAGRAM_URL + '" target="_blank" rel="noopener noreferrer" aria-label="TeleDoctorSA on Instagram">' + svgIcon('instagram') + '</a>' +
        '<a class="tds-social-link" href="tel:+27780336394" aria-label="Call TeleDoctorSA">' + svgIcon('phone') + '</a>' +
        '<a class="tds-social-link" href="mailto:info@teledoctorsa.co.za" aria-label="Email TeleDoctorSA">' + svgIcon('mail') + '</a>' +
      '</div>';

    navLinks.appendChild(socials);
  }

  function hardenNavigation() {
    var nav = document.querySelector('nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav)');
    if (!nav) return;

    var oldButton = nav.querySelector('#hamburgerBtn, .hamburger');
    var oldLinks = nav.querySelector('#navLinks, .nav-links');
    if (!oldButton || !oldLinks) return;

    var button = oldButton.cloneNode(true);
    oldButton.parentNode.replaceChild(button, oldButton);

    var navLinks = oldLinks.cloneNode(true);
    oldLinks.parentNode.replaceChild(navLinks, oldLinks);

    if (!navLinks.id) navLinks.id = 'navLinks';
    button.setAttribute('aria-controls', navLinks.id);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');

    var oldOverlay = document.getElementById('mobileOverlay') || document.querySelector('.mobile-overlay');
    var overlay;
    if (oldOverlay) {
      overlay = oldOverlay.cloneNode(true);
      oldOverlay.parentNode.replaceChild(overlay, oldOverlay);
    } else {
      overlay = document.createElement('div');
      overlay.id = 'mobileOverlay';
      overlay.className = 'mobile-overlay';
      document.body.appendChild(overlay);
    }

    addMobileSocials(navLinks);

    var offerTrigger = navLinks.querySelector('#openPanelBtn, .dropdown > a');
    var offerPanel = navLinks.querySelector('#sidePanel, .dropdown-content');
    var offerClose = navLinks.querySelector('#closePanelBtn, .panel-close');
    var contactDropdown = navLinks.querySelector('.contact-dropdown');
    var contactButton = contactDropdown ? contactDropdown.querySelector('button, .btn-main') : null;

    function isMobile() {
      return window.innerWidth <= MOBILE_MAX;
    }

    function closeOfferPanel() {
      if (offerPanel) offerPanel.classList.remove('active');
      if (offerTrigger) offerTrigger.setAttribute('aria-expanded', 'false');
    }

    function closeContactMenu() {
      if (contactDropdown) contactDropdown.classList.remove('tds-contact-open');
      if (contactButton) contactButton.setAttribute('aria-expanded', 'false');
    }

    function menuIsOpen() {
      return navLinks.classList.contains('active');
    }

    function openMenu() {
      if (!isMobile()) return;
      navLinks.classList.add('active');
      button.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('tds-menu-open');
      document.body.style.removeProperty('overflow');
      button.setAttribute('aria-expanded', 'true');
      button.setAttribute('aria-label', 'Close menu');
    }

    function closeMenu() {
      navLinks.classList.remove('active');
      button.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('tds-menu-open');
      document.body.style.removeProperty('overflow');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open menu');
      closeOfferPanel();
      closeContactMenu();
    }

    function toggleMenu(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (menuIsOpen()) closeMenu();
      else openMenu();
    }

    button.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    if (offerTrigger && offerPanel) {
      offerTrigger.setAttribute('aria-expanded', 'false');
      offerTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        var willOpen = !offerPanel.classList.contains('active');
        closeContactMenu();
        offerPanel.classList.toggle('active', willOpen);
        offerTrigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    }

    if (offerClose) {
      offerClose.addEventListener('click', function (event) {
        event.preventDefault();
        closeOfferPanel();
      });
    }

    if (contactButton && contactDropdown) {
      contactButton.setAttribute('aria-expanded', 'false');
      contactButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        closeOfferPanel();
        var willOpen = !contactDropdown.classList.contains('tds-contact-open');
        contactDropdown.classList.toggle('tds-contact-open', willOpen);
        contactButton.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    }

    navLinks.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!isMobile()) return;
        if (link === offerTrigger) return;
        window.setTimeout(closeMenu, 0);
      });
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target)) closeContactMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (menuIsOpen()) {
        closeMenu();
        button.focus();
        return;
      }
      closeOfferPanel();
      closeContactMenu();
    });

    window.addEventListener('resize', function () {
      if (!isMobile() && menuIsOpen()) closeMenu();
    }, { passive: true });
  }

  function buildFooter() {
    var footer = document.createElement('footer');
    footer.className = 'tds-canonical-footer';
    footer.setAttribute('role', 'contentinfo');
    footer.innerHTML =
      '<div class="tds-footer-shell">' +
        '<div class="tds-footer-grid">' +
          '<div class="tds-footer-brand">' +
            '<div class="tds-footer-brandline">' +
              '<img src="images/rebuild/logo.png" alt="TeleDoctorSA logo">' +
              '<div><strong>TeleDoctorSA</strong><span>Connected digital healthcare in South Africa</span></div>' +
            '</div>' +
            '<p class="tds-footer-description">TeleDoctorSA connects virtual consultations, ECG247 monitoring, app access, and secure health records so patients and clinical teams can move through care with clearer next steps.</p>' +
            '<div class="tds-footer-socials" aria-label="TeleDoctorSA social media and contact links">' +
              '<a class="tds-footer-social-link" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">' + svgIcon('whatsapp') + '</a>' +
              '<a class="tds-footer-social-link" href="' + FACEBOOK_URL + '" target="_blank" rel="noopener noreferrer" aria-label="Facebook">' + svgIcon('facebook') + '</a>' +
              '<a class="tds-footer-social-link" href="' + INSTAGRAM_URL + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' + svgIcon('instagram') + '</a>' +
              '<a class="tds-footer-social-link" href="tel:+27780336394" aria-label="Call TeleDoctorSA">' + svgIcon('phone') + '</a>' +
              '<a class="tds-footer-social-link" href="mailto:info@teledoctorsa.co.za" aria-label="Email TeleDoctorSA">' + svgIcon('mail') + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="tds-footer-column">' +
            '<h3>Care Paths</h3>' +
            '<div class="tds-footer-list">' +
              '<a href="virtual-consultations.html">Online doctor consultations</a>' +
              '<a href="ecg247.html">ECG247 heart monitoring</a>' +
              '<a href="teledoctorsa-app.html">TeleDoctorSA app</a>' +
              '<a href="ehr.html">Electronic health records</a>' +
            '</div>' +
          '</div>' +
          '<div class="tds-footer-column">' +
            '<h3>Contact</h3>' +
            '<div class="tds-footer-list">' +
              '<a href="' + WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer">WhatsApp: +27 78 033 6394</a>' +
              '<a href="tel:+27780336394">Phone: +27 78 033 6394</a>' +
              '<a href="mailto:info@teledoctorsa.co.za">info@teledoctorsa.co.za</a>' +
              '<span>29 Landor Street, Tulisa Park, Johannesburg, 2197</span>' +
            '</div>' +
          '</div>' +
          '<div class="tds-footer-column">' +
            '<h3>Company & Legal</h3>' +
            '<div class="tds-footer-list">' +
              '<a href="about-us.html">About TeleDoctorSA</a>' +
              '<a href="contact-us.html">Contact support</a>' +
              '<a href="privacy-policy.html">Privacy policy</a>' +
              '<a href="legal-notice.html">Legal notice</a>' +
              '<span>For planned support and non-emergency care. Urgent medical needs should use the appropriate immediate care channel.</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tds-footer-bottom">' +
          '<span>TeleDoctorSA | Dr. Mukudu & Partners | Johannesburg, South Africa</span>' +
          '<span>Phone, WhatsApp, and email follow-up available.</span>' +
        '</div>' +
      '</div>';
    return footer;
  }

  function standardizeFooter() {
    if (document.querySelector('.tds-canonical-footer')) return;

    var existingFooters = Array.prototype.slice.call(document.querySelectorAll('footer'));
    var newFooter = buildFooter();

    if (existingFooters.length && existingFooters[0].parentNode) {
      existingFooters[0].parentNode.insertBefore(newFooter, existingFooters[0]);
    } else {
      document.body.appendChild(newFooter);
    }

    existingFooters.forEach(function (footer) {
      footer.remove();
    });

    document.querySelectorAll('.footer-mobile').forEach(function (footer) {
      if (!footer.closest('.tds-canonical-footer')) footer.remove();
    });
  }

  function removeCostlyDecorativeNodes() {
    document.querySelectorAll('.floating-shapes').forEach(function (node) {
      node.remove();
    });
  }

  function init() {
    addStyles();
    removeLegacyMobileNavigation();
    removeCostlyDecorativeNodes();
    hardenNavigation();
    standardizeFooter();

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function scheduleInit() {
    window.setTimeout(init, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleInit, { once: true });
  } else {
    scheduleInit();
  }

  window.addEventListener('pageshow', function () {
    removeLegacyMobileNavigation();
  });
})();
