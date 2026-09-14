(function () {
  'use strict';

  if (window.__TDS_EDITORIAL_MEGA_MENU__) return;
  window.__TDS_EDITORIAL_MEGA_MENU__ = true;

  function icon(path) {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="' + path + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function addStyles() {
    if (document.getElementById('tds-editorial-mega-menu-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-editorial-mega-menu-styles';
    style.textContent = `
      @media (min-width: 901px) {
        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .nav-links > .dropdown {
          position: static !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .dropdown-content.tds-offer-mega {
          position: fixed !important;
          top: 74px !important;
          left: 50% !important;
          right: auto !important;
          bottom: auto !important;
          width: min(1180px, calc(100vw - 48px)) !important;
          max-width: 1180px !important;
          height: auto !important;
          max-height: none !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          overflow: hidden !important;
          background: #ffffff !important;
          border: 1px solid rgba(15, 23, 42, .10) !important;
          border-top: 3px solid #ff8844 !important;
          border-radius: 0 !important;
          box-shadow: 0 28px 70px rgba(15, 23, 42, .16) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translate(-50%, -12px) !important;
          transition: opacity 180ms ease, transform 260ms cubic-bezier(.22, 1, .36, 1), visibility 180ms ease !important;
          z-index: 1700 !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .dropdown-content.tds-offer-mega.active {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translate(-50%, 0) !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .side-panel-overlay {
          display: none !important;
        }

        .tds-mega-shell {
          display: grid !important;
          grid-template-columns: minmax(300px, 1.08fr) minmax(0, 2.15fr) !important;
          width: 100% !important;
          background: #fff !important;
        }

        .tds-mega-feature {
          min-height: 276px !important;
          padding: 34px 32px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          text-align: center !important;
          text-decoration: none !important;
          color: #fff !important;
          background: #0f172a !important;
          border: 0 !important;
          border-radius: 0 !important;
        }

        .tds-mega-feature:hover {
          background: #162033 !important;
        }

        .tds-mega-kicker {
          font: 800 .69rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: .14em !important;
          text-transform: uppercase !important;
          color: #ffa366 !important;
        }

        .tds-mega-feature-icon,
        .tds-mega-service-icon {
          display: grid !important;
          place-items: center !important;
          flex: 0 0 auto !important;
          border-radius: 0 !important;
        }

        .tds-mega-feature-icon {
          width: 48px !important;
          height: 48px !important;
          color: #ffa366 !important;
          background: rgba(255,255,255,.08) !important;
          border: 1px solid rgba(255,255,255,.16) !important;
        }

        .tds-mega-feature-icon svg,
        .tds-mega-service-icon svg {
          width: 21px !important;
          height: 21px !important;
        }

        .tds-mega-feature-title {
          max-width: 310px !important;
          color: #fff !important;
          font: 800 clamp(1.35rem, 1.8vw, 1.72rem)/1.12 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: -.035em !important;
        }

        .tds-mega-feature-copy {
          max-width: 330px !important;
          color: rgba(248,250,252,.72) !important;
          font: 500 .86rem/1.55 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        .tds-mega-feature-link {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          margin-top: 4px !important;
          color: #fff !important;
          font: 800 .82rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        .tds-mega-feature-link svg {
          width: 16px !important;
          height: 16px !important;
          transition: transform 180ms ease !important;
        }

        .tds-mega-feature:hover .tds-mega-feature-link svg {
          transform: translateX(3px) !important;
        }

        .tds-mega-index {
          display: grid !important;
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          min-width: 0 !important;
          background: #fff !important;
        }

        .tds-mega-service {
          min-width: 0 !important;
          min-height: 276px !important;
          padding: 30px 22px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          text-align: center !important;
          text-decoration: none !important;
          color: #0f172a !important;
          background: #fff !important;
          border: 0 !important;
          border-left: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
          transition: background 180ms ease, transform 180ms ease !important;
        }

        .tds-mega-service:hover {
          background: #fff8f3 !important;
          transform: translateY(-2px) !important;
        }

        .tds-mega-service-icon {
          width: 44px !important;
          height: 44px !important;
          color: #ff8844 !important;
          background: #fff3ea !important;
          border: 1px solid rgba(255,136,68,.2) !important;
        }

        .tds-mega-service-label {
          color: #64748b !important;
          font: 800 .65rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: .12em !important;
          text-transform: uppercase !important;
        }

        .tds-mega-service-title {
          color: #0f172a !important;
          font: 800 1rem/1.26 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: -.02em !important;
        }

        .tds-mega-service-copy {
          max-width: 220px !important;
          color: #64748b !important;
          font: 500 .79rem/1.5 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        .tds-mega-rail {
          grid-column: 1 / -1 !important;
          min-height: 52px !important;
          padding: 12px 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 20px !important;
          text-align: center !important;
          background: #f8fafc !important;
          border-top: 1px solid #e2e8f0 !important;
        }

        .tds-mega-rail span {
          color: #64748b !important;
          font: 600 .76rem/1.4 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        .tds-mega-rail a {
          display: inline-flex !important;
          align-items: center !important;
          gap: 7px !important;
          color: #0f172a !important;
          text-decoration: none !important;
          font: 800 .78rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        .tds-mega-rail a:hover {
          color: #ff8844 !important;
        }

        .tds-mega-rail svg {
          width: 15px !important;
          height: 15px !important;
        }
      }

      @media (max-width: 900px) {
        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .dropdown-content.tds-offer-mega {
          position: static !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          width: 100% !important;
          max-width: none !important;
          margin: 8px 0 14px !important;
          padding: 0 !important;
          display: none !important;
          overflow: hidden !important;
          background: #fff !important;
          border: 1px solid #e2e8f0 !important;
          border-top: 2px solid #ff8844 !important;
          box-shadow: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: none !important;
        }

        nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav) .dropdown-content.tds-offer-mega.active {
          display: block !important;
        }

        .tds-mega-shell,
        .tds-mega-index {
          display: grid !important;
          grid-template-columns: 1fr !important;
          width: 100% !important;
        }

        .tds-mega-feature,
        .tds-mega-service {
          min-height: 0 !important;
          padding: 18px 16px !important;
          display: grid !important;
          grid-template-columns: 38px minmax(0, 1fr) !important;
          align-items: center !important;
          gap: 11px !important;
          text-align: left !important;
          text-decoration: none !important;
          border-radius: 0 !important;
        }

        .tds-mega-feature {
          color: #fff !important;
          background: #0f172a !important;
          border: 0 !important;
        }

        .tds-mega-service {
          color: #0f172a !important;
          background: #fff !important;
          border: 0 !important;
          border-top: 1px solid #e2e8f0 !important;
        }

        .tds-mega-feature-icon,
        .tds-mega-service-icon {
          grid-row: 1 / span 4 !important;
          width: 38px !important;
          height: 38px !important;
          display: grid !important;
          place-items: center !important;
          border-radius: 0 !important;
        }

        .tds-mega-feature-icon {
          color: #ffa366 !important;
          background: rgba(255,255,255,.08) !important;
          border: 1px solid rgba(255,255,255,.14) !important;
        }

        .tds-mega-service-icon {
          color: #ff8844 !important;
          background: #fff3ea !important;
          border: 1px solid rgba(255,136,68,.18) !important;
        }

        .tds-mega-feature-icon svg,
        .tds-mega-service-icon svg {
          width: 18px !important;
          height: 18px !important;
        }

        .tds-mega-kicker,
        .tds-mega-service-label {
          font: 800 .62rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: .12em !important;
          text-transform: uppercase !important;
        }

        .tds-mega-kicker { color: #ffa366 !important; }
        .tds-mega-service-label { color: #94a3b8 !important; }

        .tds-mega-feature-title,
        .tds-mega-service-title {
          margin: 0 !important;
          font: 800 .9rem/1.25 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: -.01em !important;
        }

        .tds-mega-feature-title { color: #fff !important; }
        .tds-mega-service-title { color: #0f172a !important; }

        .tds-mega-feature-copy,
        .tds-mega-service-copy,
        .tds-mega-feature-link,
        .tds-mega-rail {
          display: none !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tds-offer-mega,
        .tds-mega-service,
        .tds-mega-feature-link svg {
          transition: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function buildMenu(panel) {
    if (!panel || panel.dataset.tdsMegaReady === 'true') return;

    panel.dataset.tdsMegaReady = 'true';
    panel.classList.add('tds-offer-mega');
    panel.setAttribute('aria-label', 'What We Offer');

    var arrow = icon('M5 12h14M13 6l6 6-6 6');

    panel.innerHTML =
      '<div class="tds-mega-shell">' +
        '<a class="tds-mega-feature" href="/virtual-consultations">' +
          '<span class="tds-mega-feature-icon">' + icon('M15 10l4.6-2.3A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.4.9L15 14M4 6h11v12H4z') + '</span>' +
          '<span class="tds-mega-kicker">Start with care</span>' +
          '<span class="tds-mega-feature-title">Virtual Medical Consultations</span>' +
          '<span class="tds-mega-feature-copy">Speak with a qualified practitioner remotely for assessment, follow-up and chronic care support.</span>' +
          '<span class="tds-mega-feature-link">View consultation options ' + arrow + '</span>' +
        '</a>' +
        '<div class="tds-mega-index">' +
          '<a class="tds-mega-service" href="/ecg247">' +
            '<span class="tds-mega-service-icon">' + icon('M3 12h4l2-5 4 10 2-5h6') + '</span>' +
            '<span class="tds-mega-service-label">Monitor</span>' +
            '<span class="tds-mega-service-title">ECG247</span>' +
            '<span class="tds-mega-service-copy">Continuous remote heart-rhythm monitoring with a medically certified wearable sensor.</span>' +
          '</a>' +
          '<a class="tds-mega-service" href="/app">' +
            '<span class="tds-mega-service-icon">' + icon('M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2M10 18h4') + '</span>' +
            '<span class="tds-mega-service-label">Connect</span>' +
            '<span class="tds-mega-service-title">TeleDoctorSA App</span>' +
            '<span class="tds-mega-service-copy">Patient access, connected readings and digital follow-up in one mobile care experience.</span>' +
          '</a>' +
          '<a class="tds-mega-service" href="/ehr">' +
            '<span class="tds-mega-service-icon">' + icon('M6 3h12v18H6zM9 7h6M9 11h6M9 15h4') + '</span>' +
            '<span class="tds-mega-service-label">Record</span>' +
            '<span class="tds-mega-service-title">Electronic Health Records</span>' +
            '<span class="tds-mega-service-copy">Secure digital medical information designed to support continuity across connected care.</span>' +
          '</a>' +
        '</div>' +
        '<div class="tds-mega-rail">' +
          '<span>One connected care platform. Four clear ways to begin.</span>' +
          '<a href="/our-services">Explore all services ' + arrow + '</a>' +
        '</div>' +
      '</div>';
  }

  function init() {
    addStyles();

    var nav = document.querySelector('nav:not(.tds-mobile-nav):not(.tds-unified-mobile-nav)');
    if (!nav) return;

    var trigger = nav.querySelector('#openPanelBtn, .dropdown > a');
    var panel = nav.querySelector('#sidePanel, .dropdown-content');
    var dropdown = trigger ? trigger.closest('.dropdown') : null;

    if (!trigger || !panel || !dropdown) return;

    buildMenu(panel);
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-controls', panel.id || 'sidePanel');

    panel.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        panel.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', function (event) {
      if (window.innerWidth <= 900) return;
      if (!panel.classList.contains('active')) return;
      if (dropdown.contains(event.target)) return;
      panel.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      panel.classList.remove('active');
      trigger.setAttribute('aria-expanded', 'false');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
