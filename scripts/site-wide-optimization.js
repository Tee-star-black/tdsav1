(function () {
  'use strict';

  if (document.getElementById('tds-site-wide-optimization')) return;

  var style = document.createElement('style');
  style.id = 'tds-site-wide-optimization';
  style.textContent = `
    :root {
      --tds-shell: min(1240px, calc(100% - 40px));
      --tds-section-y: clamp(34px, 4vw, 54px);
      --tds-gap: clamp(14px, 1.8vw, 24px);
      --tds-radius: 14px;
    }

    *, *::before, *::after { box-sizing: border-box !important; }

    html,
    body {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      min-height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: clip !important;
    }

    body { position: relative !important; }
    body > :first-child { margin-top: 0 !important; }

    body > *, main, header, footer, section { max-width: 100% !important; }

    body > main,
    body > header,
    body > footer,
    body > section,
    main > section,
    .hero,
    .hero-section,
    .page-hero,
    .hero-container,
    .site-footer,
    .contact-section,
    .contact-cta,
    [class*='hero-section'] {
      width: 100% !important;
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    img, video, iframe, svg { max-width: 100%; }
    img, video { height: auto; }

    h1 {
      font-size: clamp(2.15rem, 4vw, 3.85rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.042em !important;
    }

    h2 {
      font-size: clamp(1.65rem, 2.6vw, 2.55rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -.032em !important;
    }

    h3 {
      font-size: clamp(1.05rem, 1.45vw, 1.35rem) !important;
      line-height: 1.18 !important;
    }

    p, li, .mega-menu-desc {
      font-size: .96rem !important;
      line-height: 1.58 !important;
    }

    nav:not(.tds-mobile-nav) {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      min-height: 64px !important;
      height: auto !important;
      padding: 8px max(20px, calc((100vw - 1240px) / 2)) !important;
      left: 0 !important;
      right: 0 !important;
      top: 0 !important;
      position: sticky !important;
      z-index: 1200 !important;
      display: flex !important;
      align-items: center !important;
      gap: 20px !important;
    }

    nav:not(.tds-mobile-nav).scrolled {
      padding-top: 7px !important;
      padding-bottom: 7px !important;
    }

    nav:not(.tds-mobile-nav) > * { min-width: 0 !important; }

    nav:not(.tds-mobile-nav) .logo {
      flex: 0 1 auto !important;
      min-width: 0 !important;
      max-width: 320px !important;
      gap: 10px !important;
    }

    nav:not(.tds-mobile-nav) .logo img {
      width: auto !important;
      height: 42px !important;
      max-width: 52px !important;
      max-height: 42px !important;
      object-fit: contain !important;
    }

    nav:not(.tds-mobile-nav) .logo-text {
      font-size: clamp(1.15rem, 1.6vw, 1.55rem) !important;
      white-space: nowrap !important;
    }

    nav:not(.tds-mobile-nav) .nav-links {
      min-width: 0 !important;
      margin-left: auto !important;
      gap: clamp(13px, 1.7vw, 24px) !important;
      align-items: center !important;
    }

    nav:not(.tds-mobile-nav) .nav-links > a,
    nav:not(.tds-mobile-nav) .nav-links > .dropdown > a,
    nav:not(.tds-mobile-nav) .btn-main {
      font-size: .88rem !important;
      white-space: nowrap !important;
    }

    nav:not(.tds-mobile-nav) .btn-main {
      min-height: 40px !important;
      height: 40px !important;
      padding: 0 16px !important;
      max-width: 170px !important;
    }

    /* Constrain CONTENT only. Full-width section backgrounds must never be boxed. */
    .container,
    .content-container,
    .page-container,
    .section-container,
    .services-header,
    .services-grid,
    .info-grid,
    .trust-assurance-grid,
    .telemedicine-explainer-grid,
    .location-grid,
    .tech-showcase-content,
    .objectives-content,
    .tds-rescued-visual {
      width: var(--tds-shell) !important;
      max-width: 1240px !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    section:not(.core-highlights-slider) {
      min-height: 0 !important;
      height: auto !important;
      padding-top: var(--tds-section-y) !important;
      padding-bottom: var(--tds-section-y) !important;
    }

    .hero,
    .hero-section,
    .page-hero,
    .hero-container,
    [class*='hero-section'] {
      overflow: hidden !important;
      min-height: clamp(440px, 62svh, 640px) !important;
      height: auto !important;
    }

    .hero h1,
    .hero-section h1,
    .page-hero h1,
    .hero-container h1 {
      font-size: clamp(2.3rem, 4.5vw, 4rem) !important;
    }

    .card,
    [class*='-card'] {
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
    }

    .card,
    .service-card,
    .feature-card,
    .info-card,
    .trust-card,
    .contact-card,
    .product-card,
    .audience-card,
    .stat-card,
    [class*='-card'] {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }

    .card-img,
    .service-card img,
    .feature-card img,
    .product-card img,
    .audience-card img,
    [class*='-card'] > img:first-child {
      width: 100% !important;
      height: clamp(135px, 13vw, 175px) !important;
      min-height: 0 !important;
      object-fit: cover !important;
    }

    .card-content,
    .service-card-content,
    .feature-card-content,
    .product-card-content,
    .audience-card-content,
    [class*='-card'] > .content {
      padding: 16px 16px 17px !important;
    }

    .card-content h3,
    [class*='-card'] h3 { margin-bottom: 7px !important; }

    .card-content p,
    [class*='-card'] p { margin-bottom: 10px !important; }

    .btn,
    .btn-main,
    .cta-btn,
    .hero-actions a,
    .hero-actions button,
    .site-footer-actions a,
    [class*='button'],
    [class*='-btn'] {
      min-height: 40px !important;
      padding-top: 9px !important;
      padding-bottom: 9px !important;
    }

    /* Footer background is full bleed. Only the grid/content is constrained. */
    footer,
    .site-footer,
    .site-footer-shell {
      width: 100% !important;
      max-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      overflow: hidden !important;
    }

    .site-footer-grid {
      width: var(--tds-shell) !important;
      max-width: 1240px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      gap: clamp(18px, 2.5vw, 34px) !important;
    }

    .site-footer-grid > *,
    .site-footer-brand,
    .site-footer-column {
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .site-footer-brandline img {
      width: auto !important;
      max-width: 48px !important;
      max-height: 48px !important;
    }

    .site-footer p,
    .site-footer span,
    .site-footer a { overflow-wrap: anywhere !important; }

    @media (max-width: 1100px) {
      :root {
        --tds-shell: min(calc(100% - 32px), 980px);
        --tds-section-y: 42px;
      }

      nav:not(.tds-mobile-nav) {
        padding: 8px 16px !important;
        gap: 14px !important;
      }

      nav:not(.tds-mobile-nav) .nav-links { gap: 12px !important; }

      nav:not(.tds-mobile-nav) .nav-links > a,
      nav:not(.tds-mobile-nav) .nav-links > .dropdown > a,
      nav:not(.tds-mobile-nav) .btn-main { font-size: .82rem !important; }

      .site-footer-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .site-footer-brand { grid-column: 1 / -1 !important; }

      .location-grid,
      .trust-assurance-grid,
      .info-grid,
      .telemedicine-explainer-grid,
      .tech-showcase-content { grid-template-columns: 1fr !important; }

      .services-grid,
      .tds-four-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    }

    @media (max-width: 900px) {
      :root {
        --tds-shell: calc(100% - 24px);
        --tds-section-y: 36px;
      }

      nav:not(.tds-mobile-nav) {
        min-height: 60px !important;
        padding: 7px 12px !important;
        justify-content: space-between !important;
      }

      nav:not(.tds-mobile-nav) .logo { max-width: calc(100% - 54px) !important; }

      nav:not(.tds-mobile-nav) .logo img {
        height: 38px !important;
        max-width: 42px !important;
        max-height: 38px !important;
      }

      nav:not(.tds-mobile-nav) .logo-text { font-size: clamp(1rem, 4.8vw, 1.3rem) !important; }

      nav:not(.tds-mobile-nav) .hamburger {
        flex: 0 0 40px !important;
        width: 40px !important;
        height: 40px !important;
        margin: 0 !important;
      }

      nav:not(.tds-mobile-nav) .nav-links {
        width: min(88vw, 340px) !important;
        max-width: 340px !important;
        padding: 72px 18px 26px !important;
      }

      h1 { font-size: clamp(2rem, 9vw, 3rem) !important; }
      h2 { font-size: clamp(1.55rem, 6.5vw, 2.15rem) !important; }
      h3 { font-size: clamp(1.02rem, 4.8vw, 1.28rem) !important; }

      .hero,
      .hero-section,
      .page-hero,
      .hero-container,
      [class*='hero-section'] { min-height: auto !important; }

      .services-grid,
      .tds-four-grid,
      .info-focus-grid,
      .trust-proof-grid,
      .contact-cards { grid-template-columns: 1fr !important; }

      .card-img,
      .service-card img,
      .feature-card img,
      .product-card img,
      .audience-card img,
      [class*='-card'] > img:first-child { height: 150px !important; }

      .card-content,
      .service-card-content,
      .feature-card-content,
      .product-card-content,
      .audience-card-content { padding: 14px !important; }

      .site-footer-grid {
        grid-template-columns: 1fr !important;
        gap: 22px !important;
      }

      .site-footer-brand { grid-column: auto !important; }

      .map-container {
        width: 100% !important;
        height: 300px !important;
        min-height: 300px !important;
      }
    }

    @media (max-width: 520px) {
      :root {
        --tds-shell: calc(100% - 18px);
        --tds-section-y: 30px;
      }

      nav:not(.tds-mobile-nav) {
        padding-left: 9px !important;
        padding-right: 9px !important;
      }

      .tds-global-panel {
        width: 100vw !important;
        max-width: 100vw !important;
      }

      .map-container {
        height: 260px !important;
        min-height: 260px !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
