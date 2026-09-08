(function () {
  'use strict';

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var config = {
    'about-us.html': {
      image: 'images/rebuild/01-clinical-team-at-work.jpg',
      eyebrow: 'TeleDoctorSA',
      title: 'Healthcare built around real clinical teams.',
      copy: 'Digital tools should support the people delivering care, not get in their way.'
    },
    'our-services.html': {
      image: 'images/rebuild/03-doctor-video-consultation.jpg',
      eyebrow: 'Virtual Care',
      title: 'Professional care, without the distance.',
      copy: 'Secure virtual consultation workflows connect patients with clinicians wherever care needs to happen.'
    },
    'app.html': {
      image: 'images/rebuild/07-mobile-health-app.jpg',
      eyebrow: 'TeleDoctorSA App',
      title: 'Your healthcare, carried with you.',
      copy: 'A mobile layer for connected readings, care access and health information.'
    },
    'ehr.html': {
      image: 'images/rebuild/06-healthcare-dashboard.jpg',
      eyebrow: 'Electronic Health Records',
      title: 'Clinical information that is easier to understand and act on.',
      copy: 'A digital record experience designed around continuity, access and secure clinical workflows.'
    },
    'ecg247.html': {
      image: 'images/rebuild/04-wearable-ecg-monitor.jpg',
      eyebrow: 'ECG247',
      title: 'Heart monitoring beyond the consultation room.',
      copy: 'Wearable ECG technology supports longer-duration monitoring while clinicians remain connected to the care pathway.'
    },
    'doctors.html': {
      image: 'images/rebuild/09-clinician-platform-review.jpg',
      eyebrow: 'For Doctors',
      title: 'A clearer view of the patient journey.',
      copy: 'Clinical information, monitoring and digital workflows brought together for the clinician.'
    },
    'nurses.html': {
      image: 'images/rebuild/08-nurses-at-clinical-workstation.jpg',
      eyebrow: 'For Nurses',
      title: 'Digital workflows designed for care on the ground.',
      copy: 'Practical clinical tools for patient support, monitoring and coordinated care.'
    },
    'patients.html': {
      image: 'images/rebuild/05-remote-patient-monitoring.jpg',
      eyebrow: 'For Patients',
      title: 'Stay connected to care between appointments.',
      copy: 'Remote monitoring and digital access help make healthcare more continuous and easier to navigate.'
    },
    'telemedia-suite.html': {
      image: 'images/rebuild/02-connected-care-ecosystem.jpg',
      eyebrow: 'TeleMedia Suite',
      title: 'Connected infrastructure for digital healthcare.',
      copy: 'A joined-up platform view across patients, clinicians, monitoring and medical information.'
    }
  };

  function injectSharedStyles() {
    if (document.getElementById('tds-layout-refresh')) return;
    var style = document.createElement('style');
    style.id = 'tds-layout-refresh';
    style.textContent = `
      .tds-four-grid {
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: clamp(14px, 1.5vw, 22px) !important;
        align-items: stretch !important;
      }
      .tds-four-grid > * { min-width: 0 !important; height: 100%; }

      .services-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: clamp(14px, 1.5vw, 22px) !important;
      }

      .tds-home-hero {
        position: relative !important;
        min-height: 680px !important;
        padding: clamp(88px, 9vw, 132px) 8% clamp(72px, 8vw, 112px) !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1.02fr) minmax(420px, .98fr) !important;
        gap: clamp(42px, 6vw, 88px) !important;
        align-items: center !important;
        background: #fbfcfe !important;
        overflow: hidden !important;
      }
      .tds-home-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 7% 15%, rgba(47,171,255,.10), transparent 30%),
          radial-gradient(circle at 88% 20%, rgba(255,163,102,.15), transparent 28%);
      }
      .tds-home-hero-copy,
      .tds-home-hero-media { position: relative; z-index: 1; }
      .tds-home-kicker {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 22px;
        color: #f28a4b;
        font: 800 .74rem/1.2 'Plus Jakarta Sans', sans-serif;
        letter-spacing: .16em;
        text-transform: uppercase;
      }
      .tds-home-kicker::before {
        content: '';
        width: 32px;
        height: 2px;
        background: #f28a4b;
      }
      .tds-home-hero h1 {
        max-width: 760px;
        margin: 0;
        color: #0f172a;
        font: 800 clamp(3.2rem, 6.2vw, 6.6rem)/.94 'Plus Jakarta Sans', sans-serif;
        letter-spacing: -.065em;
      }
      .tds-home-hero h1 span { color: #ff9a59; }
      .tds-home-hero-lead {
        max-width: 650px;
        margin: 28px 0 0;
        color: #64748b;
        font: 400 clamp(1rem, 1.25vw, 1.18rem)/1.75 'Plus Jakarta Sans', sans-serif;
      }
      .tds-home-hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 34px;
      }
      .tds-home-hero-actions a {
        min-height: 54px;
        padding: 0 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-decoration: none;
        font: 700 .92rem/1 'Plus Jakarta Sans', sans-serif;
        border: 1px solid #0f172a;
        transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
      }
      .tds-home-hero-actions a:hover { transform: translateY(-2px); }
      .tds-home-primary {
        background: #0f172a;
        color: #fff;
        box-shadow: 0 16px 36px rgba(15,23,42,.18);
      }
      .tds-home-secondary { background: #fff; color: #0f172a; }
      .tds-home-hero-proof {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 24px;
      }
      .tds-home-hero-proof span {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        background: rgba(255,255,255,.78);
        color: #475569;
        font: 600 .76rem/1.2 'Plus Jakarta Sans', sans-serif;
      }
      .tds-home-hero-media {
        min-height: 560px;
        overflow: hidden;
        background: #0f172a;
        box-shadow: 0 34px 80px rgba(15,23,42,.18);
      }
      .tds-home-hero-media img {
        width: 100%;
        height: 100%;
        min-height: 560px;
        object-fit: cover;
        display: block;
      }
      .tds-home-media-label {
        position: absolute;
        left: 22px;
        bottom: 22px;
        padding: 12px 14px;
        background: rgba(15,23,42,.88);
        color: #fff;
        backdrop-filter: blur(12px);
        font: 700 .78rem/1.3 'Plus Jakarta Sans', sans-serif;
        letter-spacing: .02em;
      }

      .tds-rescued-visual {
        position: relative;
        z-index: 1;
        width: min(1180px, calc(100% - 40px));
        margin: 56px auto 72px;
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr);
        background: #fff;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        box-shadow: 0 24px 70px rgba(15,23,42,.08);
      }
      .tds-rescued-visual-media { min-height: 430px; background: #0f172a; overflow: hidden; }
      .tds-rescued-visual-media img { width:100%; height:100%; min-height:430px; object-fit:cover; display:block; }
      .tds-rescued-visual-copy { padding:clamp(34px,5vw,68px); display:flex; flex-direction:column; justify-content:center; background:#fff; }
      .tds-rescued-visual-kicker { font:700 .75rem/1.2 'Plus Jakarta Sans',sans-serif; letter-spacing:.16em; text-transform:uppercase; color:#f28a4b; margin-bottom:16px; }
      .tds-rescued-visual h2 { margin:0 0 18px; color:#0f172a; font:800 clamp(2rem,3.3vw,3.6rem)/1.04 'Plus Jakarta Sans',sans-serif; letter-spacing:-.045em; }
      .tds-rescued-visual p { margin:0; color:#64748b; font:400 1rem/1.8 'Plus Jakarta Sans',sans-serif; }

      @media (max-width: 1080px) {
        .tds-home-hero { grid-template-columns: 1fr 1fr !important; padding-left: 5% !important; padding-right: 5% !important; }
        .tds-four-grid, .services-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
      }
      @media (max-width: 820px) {
        .tds-home-hero {
          grid-template-columns: 1fr !important;
          min-height: auto !important;
          padding: 72px 22px 48px !important;
          gap: 36px !important;
          text-align: center;
        }
        .tds-home-kicker, .tds-home-hero-actions, .tds-home-hero-proof { justify-content: center; }
        .tds-home-hero h1, .tds-home-hero-lead { margin-left: auto; margin-right: auto; }
        .tds-home-hero-media, .tds-home-hero-media img { min-height: 360px; }
        .tds-rescued-visual { width:min(100% - 28px,680px); grid-template-columns:1fr; margin:32px auto 52px; }
        .tds-rescued-visual-media, .tds-rescued-visual-media img { min-height:280px; }
        .tds-rescued-visual-copy { padding:32px 24px 38px; text-align:center; }
      }
      @media (max-width: 560px) {
        .tds-four-grid, .services-grid { grid-template-columns: 1fr !important; }
        .tds-home-hero h1 { font-size: clamp(2.7rem, 14vw, 4rem); }
        .tds-home-hero-actions a { width:100%; }
      }
    `;
    document.head.appendChild(style);
  }

  function applyFourColumnSystem() {
    var selectors = [
      '.services-grid',
      '[class*="feature-grid"]',
      '[class*="features-grid"]',
      '[class*="audience-grid"]',
      '[class*="pathway-grid"]',
      '[class*="product-grid"]',
      '[class*="cards-grid"]',
      '[class*="card-grid"]'
    ];
    document.querySelectorAll(selectors.join(',')).forEach(function (grid) {
      if (grid.closest('footer') || grid.classList.contains('tds-rescued-visual')) return;
      if (grid.children.length >= 4) grid.classList.add('tds-four-grid');
    });
  }

  function rebuildHomepageHero() {
    if (page !== 'index.html') return false;
    var hero = document.querySelector('.hero-section, .hero, .hero-container');
    if (!hero || hero.classList.contains('tds-home-hero')) return true;

    hero.className = 'tds-home-hero';
    hero.setAttribute('aria-label', 'TeleDoctorSA connected digital healthcare');
    hero.innerHTML =
      '<div class="tds-home-hero-copy">' +
        '<span class="tds-home-kicker">Connected digital healthcare</span>' +
        '<h1>Healthcare that stays <span>connected.</span></h1>' +
        '<p class="tds-home-hero-lead">Access virtual care, connected monitoring, secure health records and the TeleDoctorSA app through one digital care ecosystem.</p>' +
        '<div class="tds-home-hero-actions">' +
          '<a class="tds-home-primary" href="app.html">Download the App <span aria-hidden="true">→</span></a>' +
          '<a class="tds-home-secondary" href="contact-us.html?intent=demo">Request a Demo <span aria-hidden="true">↗</span></a>' +
        '</div>' +
        '<div class="tds-home-hero-proof">' +
          '<span>HPCSA-aligned care</span>' +
          '<span>POPIA-aware records</span>' +
          '<span>Google for Startups</span>' +
        '</div>' +
      '</div>' +
      '<div class="tds-home-hero-media">' +
        '<img src="images/rebuild/07-mobile-health-app.jpg" alt="TeleDoctorSA mobile connected health platform">' +
        '<span class="tds-home-media-label">TeleDoctorSA App · Connected Care Platform</span>' +
      '</div>';
    return true;
  }

  function insertPageVisual() {
    if (page === 'index.html') return;
    var data = config[page];
    if (!data || document.querySelector('.tds-rescued-visual')) return;

    var section = document.createElement('section');
    section.className = 'tds-rescued-visual';
    section.setAttribute('aria-label', data.eyebrow + ' visual');
    section.innerHTML =
      '<div class="tds-rescued-visual-media"><img src="' + data.image + '" alt="' + data.eyebrow + ' - TeleDoctorSA"></div>' +
      '<div class="tds-rescued-visual-copy"><span class="tds-rescued-visual-kicker">' + data.eyebrow + '</span><h2>' + data.title + '</h2><p>' + data.copy + '</p></div>';

    var nav = document.querySelector('nav');
    var hero = document.querySelector('.hero-section, .hero, .hero-container, header');
    var insertionPoint = hero && hero !== nav ? hero : null;
    if (insertionPoint && insertionPoint.parentNode) insertionPoint.parentNode.insertBefore(section, insertionPoint.nextSibling);
    else if (nav && nav.parentNode) nav.parentNode.insertBefore(section, nav.nextSibling);
  }

  function init() {
    injectSharedStyles();
    rebuildHomepageHero();
    applyFourColumnSystem();
    insertPageVisual();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
