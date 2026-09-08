(function () {
  'use strict';

  if (document.getElementById('tds-site-wide-optimization')) return;

  var style = document.createElement('style');
  style.id = 'tds-site-wide-optimization';
  style.textContent = `
    :root {
      --tds-global-shell: min(1280px, calc(100% - 48px));
      --tds-global-section-y: clamp(52px, 5vw, 76px);
      --tds-global-gap: clamp(18px, 2vw, 30px);
    }

    *, *::before, *::after { box-sizing: border-box !important; }

    html,
    body {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      overflow-x: clip !important;
    }

    body > *,
    main,
    section,
    header,
    footer {
      max-width: 100% !important;
    }

    img,
    video,
    iframe,
    svg {
      max-width: 100%;
    }

    img,
    video { height: auto; }

    /* -------- Global typography restraint -------- */
    h1 {
      font-size: clamp(2.35rem, 4.4vw, 4.35rem) !important;
      line-height: 1.03 !important;
      letter-spacing: -.045em !important;
    }

    h2 {
      font-size: clamp(1.85rem, 3vw, 2.85rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -.035em !important;
    }

    h3 {
      font-size: clamp(1.15rem, 1.7vw, 1.55rem) !important;
      line-height: 1.2 !important;
    }

    p,
    li,
    .mega-menu-desc {
      font-size: min(1rem, 16px) !important;
      line-height: 1.65 !important;
    }

    /* -------- Desktop navbar: full viewport, contained content -------- */
    nav:not(.tds-mobile-nav) {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      min-height: 76px !important;
      padding: 12px max(24px, calc((100vw - 1280px) / 2)) !important;
      box-sizing: border-box !important;
      left: 0 !important;
      right: 0 !important;
      display: flex !important;
      align-items: center !important;
      gap: 24px !important;
    }

    nav:not(.tds-mobile-nav) > * { min-width: 0 !important; }

    nav:not(.tds-mobile-nav) .logo {
      flex: 0 1 auto !important;
      min-width: 0 !important;
      max-width: 360px !important;
    }

    nav:not(.tds-mobile-nav) .logo img {
      width: auto !important;
      max-width: 64px !important;
      max-height: 48px !important;
      object-fit: contain !important;
    }

    nav:not(.tds-mobile-nav) .logo-text {
      font-size: clamp(1.3rem, 2vw, 1.85rem) !important;
      white-space: nowrap !important;
    }

    nav:not(.tds-mobile-nav) .nav-links {
      min-width: 0 !important;
      margin-left: auto !important;
      gap: clamp(16px, 2vw, 30px) !important;
      align-items: center !important;
    }

    nav:not(.tds-mobile-nav) .nav-links > a,
    nav:not(.tds-mobile-nav) .nav-links > .dropdown > a,
    nav:not(.tds-mobile-nav) .btn-main {
      font-size: .92rem !important;
      white-space: nowrap !important;
    }

    nav:not(.tds-mobile-nav) .btn-main {
      min-height: 46px !important;
      padding: 0 20px !important;
      max-width: 190px !important;
    }

    /* -------- Shared page geometry -------- */
    .container,
    .content-container,
    .page-container,
    .section-container,
    .site-footer-shell,
    .services-header,
    .services-grid,
    .info-grid,
    .trust-assurance-grid,
    .telemedicine-explainer-grid,
    .location-grid,
    .tech-showcase-content,
    .objectives-content,
    .tds-rescued-visual {
      width: var(--tds-global-shell) !important;
      max-width: 1280px !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    section:not(.core-highlights-slider) {
      padding-top: var(--tds-global-section-y) !important;
      padding-bottom: var(--tds-global-section-y) !important;
    }

    .card,
    [class*='-card'] {
      min-width: 0 !important;
    }

    .card-img {
      height: clamp(170px, 16vw, 210px) !important;
      object-fit: cover !important;
    }

    .card-content {
      padding: 22px 20px !important;
    }

    /* Hero families across legacy pages */
    .hero,
    .hero-section,
    .page-hero,
    .hero-container,
    [class*='hero-section'] {
      max-width: 100% !important;
      overflow: hidden !important;
    }

    .hero h1,
    .hero-section h1,
    .page-hero h1,
    .hero-container h1 {
      font-size: clamp(2.6rem, 5vw, 4.5rem) !important;
    }

    /* -------- Footer overextension fix -------- */
    footer,
    .site-footer {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    .site-footer-shell {
      padding-left: 0 !important;
      padding-right: 0 !important;
      box-sizing: border-box !important;
    }

    .site-footer-grid {
      width: 100% !important;
      max-width: 100% !important;
      gap: clamp(24px, 3vw, 44px) !important;
      box-sizing: border-box !important;
    }

    .site-footer-grid > *,
    .site-footer-brand,
    .site-footer-column {
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .site-footer-brandline img {
      width: auto !important;
      max-width: 54px !important;
      max-height: 54px !important;
    }

    .site-footer p,
    .site-footer span,
    .site-footer a {
      overflow-wrap: anywhere !important;
    }

    /* -------- Tablet -------- */
    @media (max-width: 1100px) {
      :root {
        --tds-global-shell: min(100% - 40px, 1000px);
        --tds-global-section-y: 56px;
      }

      nav:not(.tds-mobile-nav) {
        padding: 10px 20px !important;
        gap: 16px !important;
      }

      nav:not(.tds-mobile-nav) .nav-links {
        gap: 14px !important;
      }

      nav:not(.tds-mobile-nav) .nav-links > a,
      nav:not(.tds-mobile-nav) .nav-links > .dropdown > a,
      nav:not(.tds-mobile-nav) .btn-main {
        font-size: .86rem !important;
      }

      .site-footer-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      .site-footer-brand {
        grid-column: 1 / -1 !important;
      }

      .location-grid,
      .trust-assurance-grid,
      .info-grid,
      .telemedicine-explainer-grid,
      .tech-showcase-content {
        grid-template-columns: 1fr !important;
      }

      .services-grid,
      .tds-four-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    }

    /* -------- Mobile navbar and content -------- */
    @media (max-width: 900px) {
      :root {
        --tds-global-shell: calc(100% - 28px);
        --tds-global-section-y: 46px;
      }

      nav:not(.tds-mobile-nav) {
        width: 100% !important;
        min-height: 68px !important;
        padding: 9px 14px !important;
        justify-content: space-between !important;
      }

      nav:not(.tds-mobile-nav) .logo {
        max-width: calc(100% - 58px) !important;
      }

      nav:not(.tds-mobile-nav) .logo img {
        max-width: 46px !important;
        max-height: 42px !important;
      }

      nav:not(.tds-mobile-nav) .logo-text {
        font-size: clamp(1.1rem, 5vw, 1.45rem) !important;
      }

      nav:not(.tds-mobile-nav) .hamburger {
        flex: 0 0 44px !important;
        width: 44px !important;
        height: 44px !important;
        margin: 0 !important;
      }

      nav:not(.tds-mobile-nav) .nav-links {
        width: min(88vw, 360px) !important;
        max-width: 360px !important;
        padding: 82px 20px 30px !important;
      }

      h1 { font-size: clamp(2.15rem, 10vw, 3.4rem) !important; }
      h2 { font-size: clamp(1.7rem, 7vw, 2.35rem) !important; }
      h3 { font-size: clamp(1.08rem, 5vw, 1.35rem) !important; }

      .services-grid,
      .tds-four-grid,
      .info-focus-grid,
      .trust-proof-grid,
      .contact-cards {
        grid-template-columns: 1fr !important;
      }

      .card-img { height: 190px !important; }
      .card-content { padding: 20px 18px !important; }

      .site-footer-shell {
        width: calc(100% - 28px) !important;
      }

      .site-footer-grid {
        grid-template-columns: 1fr !important;
        gap: 28px !important;
      }

      .site-footer-brand {
        grid-column: auto !important;
      }

      .site-footer-actions,
      .site-footer-chip-row {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
      }

      .map-container {
        width: 100% !important;
        height: 330px !important;
        min-height: 330px !important;
      }
    }

    @media (max-width: 520px) {
      :root {
        --tds-global-shell: calc(100% - 20px);
        --tds-global-section-y: 40px;
      }

      nav:not(.tds-mobile-nav) {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }

      nav:not(.tds-mobile-nav) .logo img {
        max-width: 40px !important;
      }

      .site-footer-shell {
        width: calc(100% - 20px) !important;
      }

      .tds-global-panel {
        width: 100vw !important;
        max-width: 100vw !important;
      }

      .map-container {
        height: 280px !important;
        min-height: 280px !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
