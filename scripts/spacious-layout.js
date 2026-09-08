(function(){
  'use strict';
  if (document.getElementById('tds-minimal-calibration')) return;

  var style = document.createElement('style');
  style.id = 'tds-minimal-calibration';
  style.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body { width: 100%; max-width: 100%; overflow-x: hidden !important; }
    body { margin: 0; }

    :root {
      --tds-shell: min(1280px, calc(100vw - 64px));
      --tds-section-y: clamp(52px, 5vw, 78px);
      --tds-gap: clamp(18px, 1.8vw, 28px);
    }

    section { width: 100% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }

    .core-highlights-slider {
      min-height: auto !important;
      padding: clamp(56px, 5vw, 76px) 0 clamp(48px, 4vw, 68px) !important;
      overflow: hidden !important;
    }

    .core-slider-shell {
      width: var(--tds-shell) !important;
      max-width: none !important;
      margin: 0 auto !important;
      gap: clamp(22px, 2.4vw, 34px) !important;
    }

    .core-slider-intro { max-width: 900px !important; margin: 0 auto !important; }
    .core-slider-intro h1 {
      max-width: 900px !important;
      margin: 0 auto 16px !important;
      font-size: clamp(2.6rem, 4vw, 4.15rem) !important;
      line-height: 1.02 !important;
      letter-spacing: -.045em !important;
    }
    .core-slider-intro p {
      max-width: 680px !important;
      font-size: clamp(.96rem, 1vw, 1.06rem) !important;
      line-height: 1.6 !important;
    }

    .core-slider-actions {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: 12px !important;
      width: min(100%, 1080px) !important;
      margin: 22px auto 0 !important;
    }
    .core-slider-actions a {
      min-height: 50px !important;
      padding: 0 16px !important;
      font-size: .88rem !important;
    }
    .core-proof-strip { margin-top: 18px !important; gap: 8px !important; }
    .core-proof-chip { font-size: .78rem !important; padding: 8px 12px !important; }

    .core-slide {
      width: 100% !important;
      min-height: 440px !important;
      padding: clamp(26px, 2.8vw, 38px) !important;
      grid-template-columns: minmax(0, 1.05fr) minmax(360px, .95fr) !important;
      gap: clamp(28px, 3vw, 44px) !important;
      align-items: center !important;
    }
    .core-slide-copy { max-width: 590px !important; padding: 0 !important; }
    .core-slide-copy h2 {
      font-size: clamp(2rem, 2.9vw, 3.15rem) !important;
      line-height: 1.04 !important;
      margin-bottom: 16px !important;
    }
    .core-slide-copy p {
      font-size: clamp(.95rem, 1vw, 1.04rem) !important;
      line-height: 1.65 !important;
      margin-bottom: 18px !important;
    }
    .core-slide-tags { margin: 18px 0 20px !important; gap: 8px !important; }
    .core-slide-tag { font-size: .78rem !important; padding: 8px 10px !important; }
    .core-slide-cta { min-height: 48px !important; padding: 0 18px !important; font-size: .86rem !important; }

    .core-slide-visual,
    .core-slide .core-slide-visual.tds-core-image-visual,
    .tds-core-slide-image {
      min-height: 330px !important;
      max-height: 410px !important;
    }

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

    .services-header { margin-bottom: 34px !important; }
    .services-header h2,
    .info-content h2,
    .telemedicine-explainer-copy h2,
    .trust-assurance-panel h2,
    .location-content h2,
    .objectives-content h2,
    .tech-showcase-text h2 {
      font-size: clamp(2rem, 3vw, 3.05rem) !important;
      line-height: 1.08 !important;
      letter-spacing: -.035em !important;
    }

    .services-header p,
    .info-content > p,
    .telemedicine-explainer-copy > p,
    .trust-assurance-panel > p,
    .location-subtitle,
    .objectives-content > p,
    .tech-showcase-text > p {
      font-size: .98rem !important;
      line-height: 1.68 !important;
    }

    .services-grid,
    .tds-four-grid {
      display: grid !important;
      grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      gap: var(--tds-gap) !important;
    }
    .services-grid .card-img, .tds-four-grid .card-img { height: 180px !important; }
    .services-grid .card-content, .tds-four-grid .card-content { padding: 20px 18px 20px !important; }
    .services-grid h3, .tds-four-grid h3 { font-size: 1rem !important; }
    .services-grid p, .tds-four-grid p { font-size: .86rem !important; line-height: 1.55 !important; }

    .info-grid {
      grid-template-columns: minmax(0, 1.08fr) minmax(360px, .92fr) !important;
      gap: clamp(28px, 3vw, 44px) !important;
    }
    .info-focus-grid { grid-template-columns: repeat(3, minmax(0,1fr)) !important; gap: 14px !important; margin-top: 22px !important; }
    .info-focus-card { padding: 18px 16px !important; }
    .info-focus-card h3 { font-size: .98rem !important; }
    .info-focus-card p { font-size: .84rem !important; line-height: 1.55 !important; }
    .info-highlight { padding: clamp(26px, 2.6vw, 38px) !important; }
    .info-highlight h3 { font-size: clamp(1.55rem, 2.2vw, 2.15rem) !important; }

    .trust-assurance-grid { grid-template-columns: minmax(0,1.04fr) minmax(360px,.96fr) !important; gap: clamp(28px,3vw,44px) !important; }
    .trust-proof-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; gap: 12px !important; }
    .trust-proof-card { padding: 16px !important; }
    .trust-proof-card strong { font-size: .92rem !important; }
    .trust-proof-card span { font-size: .82rem !important; line-height: 1.5 !important; }

    .location-grid { grid-template-columns: minmax(0,.92fr) minmax(420px,1.08fr) !important; gap: clamp(30px,3vw,46px) !important; }
    .map-container { height: clamp(360px, 34vw, 470px) !important; min-height: 360px !important; }
    .contact-cards { gap: 12px !important; }
    .contact-card { padding: 18px !important; }
    .contact-card h4 { font-size: .96rem !important; }
    .contact-card p { font-size: .88rem !important; line-height: 1.55 !important; }

    @media (max-width: 1199px) {
      :root { --tds-shell: calc(100vw - 40px); --tds-section-y: 56px; }
      .core-slider-actions { grid-template-columns: repeat(2,minmax(0,1fr)) !important; max-width: 720px !important; }
      .core-slide { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
      .services-grid, .tds-four-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
      .info-grid, .trust-assurance-grid, .location-grid { grid-template-columns: 1fr !important; }
      .map-container { height: 380px !important; }
    }

    @media (max-width: 760px) {
      :root { --tds-shell: calc(100vw - 28px); --tds-section-y: 44px; }
      .core-highlights-slider { padding: 48px 0 38px !important; }
      .core-slider-intro h1 { font-size: clamp(2.15rem, 9vw, 3rem) !important; }
      .core-slider-intro p { font-size: .94rem !important; }
      .core-slider-actions { grid-template-columns: 1fr !important; margin-top: 18px !important; }
      .core-proof-strip { display: flex !important; flex-wrap: wrap !important; justify-content: center !important; }
      .core-slide { grid-template-columns: 1fr !important; padding: 18px !important; gap: 18px !important; min-height: 0 !important; }
      .core-slide-copy h2 { font-size: clamp(1.8rem, 8vw, 2.45rem) !important; }
      .core-slide-copy p { font-size: .92rem !important; }
      .core-slide-visual,
      .core-slide .core-slide-visual.tds-core-image-visual,
      .tds-core-slide-image { min-height: 230px !important; max-height: 290px !important; }
      .services-grid, .tds-four-grid, .info-focus-grid, .trust-proof-grid { grid-template-columns: 1fr !important; }
      .services-grid .card-img, .tds-four-grid .card-img { height: 190px !important; }
      .services-header h2,
      .info-content h2,
      .telemedicine-explainer-copy h2,
      .trust-assurance-panel h2,
      .location-content h2,
      .objectives-content h2,
      .tech-showcase-text h2 { font-size: clamp(1.75rem, 7vw, 2.35rem) !important; }
      .info-highlight { padding: 22px 18px !important; }
      .map-container { height: 310px !important; min-height: 310px !important; }
    }

    @media (max-width: 480px) {
      :root { --tds-shell: calc(100vw - 20px); --tds-section-y: 38px; }
      .core-slider-intro h1 { font-size: clamp(2rem, 10vw, 2.55rem) !important; }
      .core-slider-actions a { min-height: 48px !important; font-size: .84rem !important; }
      .core-proof-chip { width: 100% !important; justify-content: center !important; }
      .core-slide { padding: 14px !important; }
      .core-slide-visual,
      .core-slide .core-slide-visual.tds-core-image-visual,
      .tds-core-slide-image { min-height: 205px !important; }
    }
  `;

  document.head.appendChild(style);
})();