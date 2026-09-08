(function(){
  'use strict';
  if (document.getElementById('tds-screen-calibration')) return;

  var style = document.createElement('style');
  style.id = 'tds-screen-calibration';
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body { width: 100%; max-width: 100%; overflow-x: hidden !important; }
    body { margin: 0; }

    :root {
      --tds-shell: min(1360px, calc(100vw - 72px));
      --tds-section-y: clamp(72px, 7vw, 112px);
      --tds-gap: clamp(24px, 2.2vw, 40px);
    }

    section {
      width: 100% !important;
      max-width: none !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    /* ---------- HERO / CORE SLIDER ---------- */
    .core-highlights-slider {
      width: 100% !important;
      min-height: auto !important;
      padding: clamp(72px, 6vw, 104px) 0 clamp(64px, 5vw, 92px) !important;
      overflow: hidden !important;
      align-items: initial !important;
    }

    .core-slider-shell {
      width: var(--tds-shell) !important;
      max-width: none !important;
      margin: 0 auto !important;
      gap: clamp(30px, 3vw, 46px) !important;
    }

    .core-slider-intro {
      width: min(100%, 1080px) !important;
      max-width: 1080px !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }

    .core-slider-intro h1 {
      max-width: 1080px !important;
      margin: 0 auto 20px !important;
      font-size: clamp(3rem, 4.7vw, 5.15rem) !important;
      line-height: .99 !important;
      letter-spacing: -.055em !important;
      text-wrap: balance;
    }

    .core-slider-intro p {
      max-width: 760px !important;
      margin: 0 auto !important;
      font-size: clamp(1rem, 1.1vw, 1.16rem) !important;
      line-height: 1.65 !important;
    }

    .core-slider-actions {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 14px !important;
      width: min(100%, 1180px) !important;
      margin: 30px auto 0 !important;
    }

    .core-slider-actions a {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 58px !important;
      padding: 0 18px !important;
      white-space: normal !important;
      text-align: center !important;
    }

    .core-proof-strip {
      width: min(100%, 780px) !important;
      margin: 22px auto 0 !important;
      justify-content: center !important;
      gap: 10px !important;
    }

    .core-slide {
      width: 100% !important;
      max-width: none !important;
      min-height: 520px !important;
      padding: clamp(34px, 3.2vw, 52px) !important;
      display: grid !important;
      grid-template-columns: minmax(0, 1.04fr) minmax(420px, .96fr) !important;
      gap: clamp(38px, 3.5vw, 60px) !important;
      align-items: center !important;
    }

    .core-slide-copy {
      min-width: 0 !important;
      max-width: 680px !important;
      padding: 0 !important;
    }

    .core-slide-copy h2 {
      font-size: clamp(2.45rem, 3.5vw, 4rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.045em !important;
      margin-bottom: 20px !important;
      text-wrap: balance;
    }

    .core-slide-copy p {
      font-size: clamp(1rem, 1.05vw, 1.14rem) !important;
      line-height: 1.7 !important;
      margin-bottom: 22px !important;
    }

    .core-slide-visual,
    .core-slide .core-slide-visual.tds-core-image-visual {
      width: 100% !important;
      min-width: 0 !important;
      min-height: 410px !important;
      height: 100% !important;
      max-height: 520px !important;
      overflow: hidden !important;
    }

    .tds-core-slide-image {
      width: 100% !important;
      height: 100% !important;
      min-height: 410px !important;
      object-fit: cover !important;
      object-position: center !important;
    }

    .core-slider-controls {
      width: 100% !important;
      max-width: none !important;
      margin: 4px auto 0 !important;
    }

    /* ---------- SHARED CONTENT SHELLS ---------- */
    .services-grid,
    .info-grid,
    .telemedicine-explainer-grid,
    .trust-assurance-grid,
    .location-grid,
    .tech-showcase-content,
    .site-footer-shell,
    .objectives-content,
    .services-header {
      width: var(--tds-shell) !important;
      max-width: none !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    .services,
    .info-section,
    .telemedicine-explainer,
    .trust-assurance,
    .location,
    .tech-showcase,
    .objectives {
      padding-top: var(--tds-section-y) !important;
      padding-bottom: var(--tds-section-y) !important;
    }

    /* ---------- CARD GRIDS ---------- */
    .services-grid,
    .tds-four-grid {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: var(--tds-gap) !important;
      width: var(--tds-shell) !important;
      max-width: none !important;
      margin-left: auto !important;
      margin-right: auto !important;
      align-items: stretch !important;
    }

    .services-grid > *, .tds-four-grid > * { min-width: 0 !important; }
    .services-grid .card-img, .tds-four-grid .card-img { height: 210px !important; }
    .services-grid .card-content, .tds-four-grid .card-content { padding: 26px 22px 24px !important; }

    /* ---------- AUDIENCE / INFO SECTION ---------- */
    .info-grid {
      display: grid !important;
      grid-template-columns: minmax(0, 1.15fr) minmax(420px, .85fr) !important;
      gap: clamp(44px, 4vw, 72px) !important;
      align-items: stretch !important;
    }

    .info-content,
    .info-highlight { min-width: 0 !important; }

    .info-focus-grid {
      display: grid !important;
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 18px !important;
      margin-top: 30px !important;
    }

    .info-focus-card {
      min-width: 0 !important;
      height: 100% !important;
      padding: 24px 22px !important;
    }

    .info-highlight {
      padding: clamp(34px, 3vw, 52px) !important;
    }

    /* ---------- TRUST ---------- */
    .trust-assurance-grid {
      display: grid !important;
      grid-template-columns: minmax(0, 1.08fr) minmax(400px, .92fr) !important;
      gap: clamp(36px, 3.5vw, 60px) !important;
      align-items: start !important;
    }

    .trust-proof-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 16px !important;
    }

    /* ---------- LOCATION ---------- */
    .location-grid {
      display: grid !important;
      grid-template-columns: minmax(0, .95fr) minmax(480px, 1.05fr) !important;
      gap: clamp(44px, 4vw, 70px) !important;
      align-items: stretch !important;
    }

    .location-content,
    .map-column { min-width: 0 !important; }

    .map-column {
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
    }

    .map-container {
      width: 100% !important;
      height: clamp(460px, 42vw, 600px) !important;
      min-height: 460px !important;
      overflow: hidden !important;
    }

    .map-container iframe {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      border: 0 !important;
    }

    .contact-cards {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }

    /* ---------- WIDE DESKTOP 1600+ ---------- */
    @media (min-width: 1600px) {
      :root { --tds-shell: min(1440px, calc(100vw - 120px)); }
      .core-slider-intro h1 { font-size: 5.2rem !important; }
      .core-slide { min-height: 550px !important; }
      .core-slide-visual,
      .core-slide .core-slide-visual.tds-core-image-visual,
      .tds-core-slide-image { min-height: 440px !important; }
    }

    /* ---------- STANDARD LAPTOP / DESKTOP ---------- */
    @media (min-width: 1200px) and (max-width: 1599px) {
      :root { --tds-shell: calc(100vw - 72px); }
      .services-grid, .tds-four-grid { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; gap: 22px !important; }
      .core-slide { grid-template-columns: minmax(0, 1fr) minmax(390px, .9fr) !important; }
      .info-focus-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
    }

    /* ---------- TABLET / SMALL LAPTOP ---------- */
    @media (min-width: 900px) and (max-width: 1199px) {
      :root {
        --tds-shell: calc(100vw - 48px);
        --tds-section-y: 72px;
      }

      .core-highlights-slider { padding-top: 76px !important; }
      .core-slider-intro h1 { font-size: clamp(3rem, 6.2vw, 4.35rem) !important; }
      .core-slider-actions { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; max-width: 760px !important; }

      .core-slide {
        grid-template-columns: 1fr 1fr !important;
        gap: 28px !important;
        padding: 32px !important;
        min-height: 460px !important;
      }

      .core-slide-visual,
      .core-slide .core-slide-visual.tds-core-image-visual,
      .tds-core-slide-image { min-height: 340px !important; }

      .services-grid, .tds-four-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .info-grid, .trust-assurance-grid { grid-template-columns: 1fr !important; }
      .info-focus-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
      .location-grid { grid-template-columns: 1fr !important; }
      .map-container { height: 460px !important; min-height: 460px !important; }
    }

    /* ---------- MOBILE / PORTRAIT TABLET ---------- */
    @media (max-width: 899px) {
      :root {
        --tds-shell: calc(100vw - 32px);
        --tds-section-y: 56px;
      }

      .core-highlights-slider {
        padding: 64px 0 48px !important;
      }

      .core-slider-shell { gap: 24px !important; }
      .core-slider-intro { text-align: center !important; }
      .core-slider-intro h1 { font-size: clamp(2.55rem, 10vw, 4rem) !important; line-height: 1.02 !important; }
      .core-slider-intro p { font-size: 1rem !important; padding: 0 6px !important; }
      .core-slider-actions { grid-template-columns: 1fr !important; width: 100% !important; margin-top: 24px !important; }
      .core-slider-actions a { min-height: 54px !important; }
      .core-proof-strip { display: flex !important; flex-wrap: wrap !important; justify-content: center !important; }

      .core-slide {
        grid-template-columns: 1fr !important;
        padding: 24px !important;
        gap: 24px !important;
        min-height: 0 !important;
      }

      .core-slide-copy { max-width: none !important; }
      .core-slide-copy h2 { font-size: clamp(2.05rem, 8vw, 3rem) !important; }
      .core-slide-visual,
      .core-slide .core-slide-visual.tds-core-image-visual,
      .tds-core-slide-image {
        min-height: 280px !important;
        max-height: 360px !important;
      }

      .services-grid, .tds-four-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
      .services-grid .card-img, .tds-four-grid .card-img { height: 220px !important; }

      .info-grid,
      .trust-assurance-grid,
      .location-grid,
      .telemedicine-explainer-grid,
      .tech-showcase-content { grid-template-columns: 1fr !important; gap: 28px !important; }

      .info-focus-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
      .info-highlight { padding: 28px 22px !important; }
      .trust-proof-grid { grid-template-columns: 1fr !important; }

      .map-container { height: 360px !important; min-height: 360px !important; }
      .location-content h2 { font-size: clamp(2.2rem, 9vw, 3rem) !important; }
    }

    /* ---------- SMALL PHONES ---------- */
    @media (max-width: 520px) {
      :root { --tds-shell: calc(100vw - 24px); --tds-section-y: 46px; }

      .core-highlights-slider { padding-top: 52px !important; }
      .core-slider-intro h1 { font-size: clamp(2.35rem, 11vw, 3.15rem) !important; }
      .core-proof-strip { display: grid !important; grid-template-columns: 1fr !important; }
      .core-proof-chip { width: 100% !important; justify-content: center !important; }
      .core-slide { padding: 18px !important; }
      .core-slide-visual,
      .core-slide .core-slide-visual.tds-core-image-visual,
      .tds-core-slide-image { min-height: 235px !important; }
      .map-container { height: 300px !important; min-height: 300px !important; }
    }
  `;

  document.head.appendChild(style);
})();