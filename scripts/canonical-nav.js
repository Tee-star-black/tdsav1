(function () {
  'use strict';

  if (window.__TDS_CANONICAL_NAV_V2__) return;
  window.__TDS_CANONICAL_NAV_V2__ = true;

  var MOBILE_MAX = 1100;
  var WHATSAPP_URL = 'https://wa.me/27780336394?text=Hi%20TeleDoctorSA%2C%20please%20may%20you%20contact%20me%3F%20Thanks.';
  var FACEBOOK_URL = 'https://www.facebook.com/DrMukudu/';
  var INSTAGRAM_URL = 'https://www.instagram.com/drmukudu_andpartners/';

  function svg(path) {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="' + path + '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function chevron() {
    return svg('m7 10 5 5 5-5');
  }

  function arrow() {
    return svg('M5 12h14M13 6l6 6-6 6');
  }

  function addStyles() {
    if (document.getElementById('tds-canonical-nav-v2-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-canonical-nav-v2-styles';
    style.textContent = `
      body.tds-nav-open {
        overflow: hidden !important;
      }

      #tdsSiteNav {
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
        background: #fff !important;
        border: 0 !important;
        border-bottom: 1px solid #e2e8f0 !important;
        border-radius: 0 !important;
        box-shadow: 0 8px 28px rgba(15,23,42,.07) !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
        overflow: visible !important;
        z-index: 2147483000 !important;
      }

      #tdsSiteNav *,
      #tdsSiteNav *::before,
      #tdsSiteNav *::after {
        box-sizing: border-box !important;
      }

      #tdsSiteNav .tds-nav-logo {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        flex: 0 0 auto !important;
        color: #0f172a !important;
        text-decoration: none !important;
        background: transparent !important;
        border: 0 !important;
      }

      #tdsSiteNav .tds-nav-logo img {
        width: 42px !important;
        height: 42px !important;
        max-width: 42px !important;
        max-height: 42px !important;
        object-fit: contain !important;
      }

      #tdsSiteNav .tds-nav-brand {
        display: inline-flex !important;
        align-items: baseline !important;
        color: #0f172a !important;
        font: 800 1.1rem/1 'Plus Jakarta Sans', system-ui, sans-serif !important;
        letter-spacing: -.03em !important;
        white-space: nowrap !important;
      }

      #tdsSiteNav .tds-nav-brand span {
        color: #ff8844 !important;
      }

      #tdsNavLinks {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: clamp(12px, 1.5vw, 22px) !important;
        margin: 0 !important;
        padding: 0 !important;
        min-width: 0 !important;
      }

      #tdsNavLinks > a,
      #tdsOfferTrigger {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        min-height: 40px !important;
        margin: 0 !important;
        padding: 9px 0 !important;
        color: #0f172a !important;
        background: transparent !important;
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        text-decoration: none !important;
        white-space: nowrap !important;
        font: 700 .84rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
        cursor: pointer !important;
      }

      #tdsNavLinks > a:hover,
      #tdsNavLinks > a[aria-current='page'],
      #tdsOfferTrigger:hover,
      #tdsOfferTrigger[aria-expanded='true'] {
        color: #ff8844 !important;
      }

      #tdsOfferTrigger svg,
      #tdsContactButton svg {
        width: 15px !important;
        height: 15px !important;
        flex: 0 0 15px !important;
      }

      #tdsNavMenuButton {
        display: none !important;
        width: 44px !important;
        height: 44px !important;
        min-width: 44px !important;
        margin: 0 !important;
        padding: 10px !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 5px !important;
        background: #fff !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        cursor: pointer !important;
      }

      #tdsNavMenuButton span {
        width: 21px !important;
        height: 2px !important;
        display: block !important;
        background: #0f172a !important;
        border-radius: 0 !important;
        transform-origin: center !important;
        transition: transform 180ms ease, opacity 180ms ease !important;
      }

      #tdsNavMenuButton.is-open span:nth-child(1) {
        transform: translateY(7px) rotate(45deg) !important;
      }

      #tdsNavMenuButton.is-open span:nth-child(2) {
        opacity: 0 !important;
      }

      #tdsNavMenuButton.is-open span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg) !important;
      }

      #tdsOfferPanel {
        position: fixed !important;
        top: 70px !important;
        left: 50% !important;
        right: auto !important;
        width: min(1180px, calc(100vw - 48px)) !important;
        max-width: 1180px !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
        overflow: hidden !important;
        background: #fff !important;
        border: 1px solid rgba(15,23,42,.1) !important;
        border-top: 3px solid #ff8844 !important;
        border-radius: 0 !important;
        box-shadow: 0 28px 70px rgba(15,23,42,.16) !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
        transform: translate(-50%, -12px) !important;
        transition: opacity 180ms ease, transform 260ms cubic-bezier(.22,1,.36,1), visibility 180ms ease !important;
        z-index: 2147483002 !important;
      }

      #tdsOfferPanel.is-open {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translate(-50%, 0) !important;
      }

      #tdsOfferPanel .tds-mega-shell {
        display: grid !important;
        grid-template-columns: minmax(300px, 1.08fr) minmax(0, 2.15fr) !important;
        width: 100% !important;
        background: #fff !important;
      }

      #tdsOfferPanel .tds-mega-feature {
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

      #tdsOfferPanel .tds-mega-feature:hover {
        background: #162033 !important;
      }

      #tdsOfferPanel .tds-mega-feature-icon,
      #tdsOfferPanel .tds-mega-service-icon {
        display: grid !important;
        place-items: center !important;
        flex: 0 0 auto !important;
        border-radius: 0 !important;
      }

      #tdsOfferPanel .tds-mega-feature-icon {
        width: 48px !important;
        height: 48px !important;
        color: #ffa366 !important;
        background: rgba(255,255,255,.08) !important;
        border: 1px solid rgba(255,255,255,.16) !important;
      }

      #tdsOfferPanel .tds-mega-feature-icon svg,
      #tdsOfferPanel .tds-mega-service-icon svg,
      #tdsOfferPanel .tds-mega-rail svg,
      #tdsOfferPanel .tds-mega-feature-link svg {
        width: 18px !important;
        height: 18px !important;
      }

      #tdsOfferPanel .tds-mega-kicker,
      #tdsOfferPanel .tds-mega-service-label {
        font: 800 .67rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
        letter-spacing: .13em !important;
        text-transform: uppercase !important;
      }

      #tdsOfferPanel .tds-mega-kicker { color: #ffa366 !important; }
      #tdsOfferPanel .tds-mega-service-label { color: #94a3b8 !important; }

      #tdsOfferPanel .tds-mega-feature-title {
        max-width: 320px !important;
        color: #fff !important;
        font: 800 clamp(1.35rem,1.8vw,1.72rem)/1.12 'Plus Jakarta Sans', system-ui, sans-serif !important;
        letter-spacing: -.035em !important;
      }

      #tdsOfferPanel .tds-mega-feature-copy {
        max-width: 330px !important;
        color: rgba(248,250,252,.72) !important;
        font: 500 .86rem/1.55 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsOfferPanel .tds-mega-feature-link {
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
        color: #fff !important;
        font: 800 .82rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsOfferPanel .tds-mega-index {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        min-width: 0 !important;
        background: #fff !important;
      }

      #tdsOfferPanel .tds-mega-service {
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

      #tdsOfferPanel .tds-mega-service:hover {
        background: #fff8f3 !important;
        transform: translateY(-2px) !important;
      }

      #tdsOfferPanel .tds-mega-service-icon {
        width: 44px !important;
        height: 44px !important;
        color: #ff8844 !important;
        background: #fff3ea !important;
        border: 1px solid rgba(255,136,68,.2) !important;
      }

      #tdsOfferPanel .tds-mega-service-title {
        color: #0f172a !important;
        font: 800 1rem/1.26 'Plus Jakarta Sans', system-ui, sans-serif !important;
        letter-spacing: -.02em !important;
      }

      #tdsOfferPanel .tds-mega-service-copy {
        max-width: 220px !important;
        color: #64748b !important;
        font: 500 .79rem/1.5 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsOfferPanel .tds-mega-rail {
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

      #tdsOfferPanel .tds-mega-rail span {
        color: #64748b !important;
        font: 600 .76rem/1.4 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsOfferPanel .tds-mega-rail a {
        display: inline-flex !important;
        align-items: center !important;
        gap: 7px !important;
        color: #0f172a !important;
        text-decoration: none !important;
        font: 800 .78rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsContact {
        position: relative !important;
        display: block !important;
      }

      #tdsContactButton {
        min-height: 40px !important;
        margin: 0 !important;
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

      #tdsContactButton:hover,
      #tdsContact.is-open #tdsContactButton {
        background: #ff8844 !important;
        border-color: #ff8844 !important;
      }

      #tdsContactMenu {
        position: absolute !important;
        top: calc(100% + 12px) !important;
        right: 0 !important;
        width: 320px !important;
        min-width: 320px !important;
        margin: 0 !important;
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
        z-index: 2147483003 !important;
      }

      #tdsContact.is-open #tdsContactMenu {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        transform: translateY(0) !important;
      }

      #tdsContactMenu .tds-contact-header {
        padding: 10px 10px 12px !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }

      #tdsContactMenu .tds-contact-title {
        color: #0f172a !important;
        font: 800 .9rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsContactMenu .tds-contact-subtitle {
        margin-top: 4px !important;
        color: #64748b !important;
        font: 500 .73rem/1.4 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsContactMenu .tds-contact-options {
        display: grid !important;
        gap: 4px !important;
      }

      #tdsContactMenu .tds-contact-option {
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

      #tdsContactMenu .tds-contact-option:hover {
        background: #fff8f3 !important;
        border-color: rgba(255,136,68,.22) !important;
      }

      #tdsContactMenu .tds-contact-icon {
        width: 34px !important;
        height: 34px !important;
        display: grid !important;
        place-items: center !important;
        color: #ff8844 !important;
        background: #fff3ea !important;
        border: 1px solid rgba(255,136,68,.18) !important;
        border-radius: 0 !important;
        font: 800 .72rem/1 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsContactMenu .tds-contact-name {
        display: block !important;
        color: #0f172a !important;
        font: 800 .8rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsContactMenu .tds-contact-desc {
        display: block !important;
        margin-top: 2px !important;
        color: #64748b !important;
        font: 500 .7rem/1.35 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }

      #tdsNavBackdrop {
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
        z-index: 2147482998 !important;
        transition: opacity 180ms ease, visibility 180ms ease !important;
      }

      #tdsNavBackdrop.is-open {
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }

      #tdsMobileConnect {
        display: none !important;
      }

      @media (max-width: 1100px) {
        #tdsSiteNav {
          min-height: 64px !important;
          padding: 10px 16px !important;
          gap: 12px !important;
        }

        #tdsSiteNav .tds-nav-logo img {
          width: 40px !important;
          height: 40px !important;
        }

        #tdsSiteNav .tds-nav-brand {
          font-size: 1rem !important;
        }

        #tdsNavMenuButton {
          display: flex !important;
        }

        #tdsNavLinks {
          position: fixed !important;
          top: 0 !important;
          right: 0 !important;
          width: min(88vw, 390px) !important;
          height: 100dvh !important;
          margin: 0 !important;
          padding: 84px 22px 28px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          justify-content: flex-start !important;
          gap: 0 !important;
          overflow-y: auto !important;
          overscroll-behavior: contain !important;
          background: #fff !important;
          border: 0 !important;
          border-left: 1px solid #e2e8f0 !important;
          box-shadow: -18px 0 48px rgba(15,23,42,.16) !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: translateX(100%) !important;
          transition: transform 280ms cubic-bezier(.22,1,.36,1), opacity 180ms ease, visibility 180ms ease !important;
          z-index: 2147483001 !important;
        }

        #tdsNavLinks.is-open {
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: translateX(0) !important;
        }

        #tdsNavLinks > a,
        #tdsOfferTrigger,
        #tdsContactButton {
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
          box-shadow: none !important;
          text-align: left !important;
          text-decoration: none !important;
          font: 700 .98rem/1.35 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        #tdsOfferPanel {
          position: static !important;
          top: auto !important;
          left: auto !important;
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

        #tdsOfferPanel.is-open {
          display: block !important;
        }

        #tdsOfferPanel .tds-mega-shell,
        #tdsOfferPanel .tds-mega-index {
          display: grid !important;
          grid-template-columns: 1fr !important;
          width: 100% !important;
        }

        #tdsOfferPanel .tds-mega-feature,
        #tdsOfferPanel .tds-mega-service {
          min-height: 0 !important;
          padding: 16px 14px !important;
          display: grid !important;
          grid-template-columns: 38px minmax(0,1fr) !important;
          align-items: center !important;
          gap: 10px !important;
          text-align: left !important;
          border: 0 !important;
          border-top: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
          transform: none !important;
        }

        #tdsOfferPanel .tds-mega-feature {
          background: #0f172a !important;
          border-top: 0 !important;
        }

        #tdsOfferPanel .tds-mega-feature-icon,
        #tdsOfferPanel .tds-mega-service-icon {
          grid-row: 1 / span 4 !important;
          width: 38px !important;
          height: 38px !important;
        }

        #tdsOfferPanel .tds-mega-feature-title,
        #tdsOfferPanel .tds-mega-service-title {
          margin: 0 !important;
          font: 800 .9rem/1.25 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }

        #tdsOfferPanel .tds-mega-feature-copy,
        #tdsOfferPanel .tds-mega-service-copy,
        #tdsOfferPanel .tds-mega-feature-link,
        #tdsOfferPanel .tds-mega-rail {
          display: none !important;
        }

        #tdsContact {
          width: 100% !important;
        }

        #tdsContactMenu {
          position: static !important;
          width: 100% !important;
          min-width: 0 !important;
          margin: 8px 0 14px !important;
          padding: 8px !important;
          display: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          pointer-events: auto !important;
          transform: none !important;
          box-shadow: none !important;
        }

        #tdsContact.is-open #tdsContactMenu {
          display: grid !important;
        }

        #tdsMobileConnect {
          display: block !important;
          margin-top: 24px !important;
          padding-top: 18px !important;
          border-top: 1px solid #e2e8f0 !important;
        }

        #tdsMobileConnect .tds-mobile-connect-label {
          display: block !important;
          margin-bottom: 11px !important;
          color: #64748b !important;
          font: 800 .7rem/1.2 'Plus Jakarta Sans', system-ui, sans-serif !important;
          letter-spacing: .12em !important;
          text-transform: uppercase !important;
        }

        #tdsMobileConnect .tds-mobile-connect-row {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
        }

        #tdsMobileConnect a {
          min-width: 44px !important;
          height: 44px !important;
          padding: 0 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #0f172a !important;
          background: #fff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 0 !important;
          text-decoration: none !important;
          font: 800 .7rem/1 'Plus Jakarta Sans', system-ui, sans-serif !important;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        #tdsSiteNav *,
        #tdsSiteNav *::before,
        #tdsSiteNav *::after,
        #tdsNavBackdrop {
          transition: none !important;
          animation: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function megaMenuMarkup() {
    var next = arrow();
    return '' +
      '<div class="tds-mega-shell">' +
        '<a class="tds-mega-feature" href="/virtual-consultations">' +
          '<span class="tds-mega-feature-icon">' + svg('M15 10l4.6-2.3A1 1 0 0 1 21 8.6v6.8a1 1 0 0 1-1.4.9L15 14M4 6h11v12H4z') + '</span>' +
          '<span class="tds-mega-kicker">Start with care</span>' +
          '<span class="tds-mega-feature-title">Virtual Medical Consultations</span>' +
          '<span class="tds-mega-feature-copy">Speak with a qualified practitioner remotely for assessment, follow-up and chronic care support.</span>' +
          '<span class="tds-mega-feature-link">View consultation options ' + next + '</span>' +
        '</a>' +
        '<div class="tds-mega-index">' +
          '<a class="tds-mega-service" href="/ecg247">' +
            '<span class="tds-mega-service-icon">' + svg('M3 12h4l2-5 4 10 2-5h6') + '</span>' +
            '<span class="tds-mega-service-label">Monitor</span>' +
            '<span class="tds-mega-service-title">ECG247 Monitoring</span>' +
            '<span class="tds-mega-service-copy">Continuous remote heart rhythm monitoring for stronger follow-up evidence.</span>' +
          '</a>' +
          '<a class="tds-mega-service" href="/app">' +
            '<span class="tds-mega-service-icon">' + svg('M8 2h8a2 2 0 0 1 2 2v16H6V4a2 2 0 0 1 2-2zM10 17h4') + '</span>' +
            '<span class="tds-mega-service-label">Connect</span>' +
            '<span class="tds-mega-service-title">TeleDoctorSA App</span>' +
            '<span class="tds-mega-service-copy">Messaging, appointment support and digital follow-up as onboarding expands.</span>' +
          '</a>' +
          '<a class="tds-mega-service" href="/ehr">' +
            '<span class="tds-mega-service-icon">' + svg('M6 3h12v18H6zM9 7h6M9 11h6M9 15h4') + '</span>' +
            '<span class="tds-mega-service-label">Records</span>' +
            '<span class="tds-mega-service-title">Electronic Health Records</span>' +
            '<span class="tds-mega-service-copy">Secure access to consultation notes, results and longitudinal care history.</span>' +
          '</a>' +
        '</div>' +
        '<div class="tds-mega-rail">' +
          '<span>Need a broader view of the platform?</span>' +
          '<a href="/our-services">Explore all services ' + next + '</a>' +
        '</div>' +
      '</div>';
  }

  function buildNav() {
    var nav = document.createElement('nav');
    nav.id = 'tdsSiteNav';
    nav.setAttribute('data-tds-canonical-nav', 'true');
    nav.setAttribute('aria-label', 'Primary navigation');

    nav.innerHTML = '' +
      '<a href="/" class="tds-nav-logo" aria-label="TeleDoctorSA home">' +
        '<img src="/images/rebuild/logo.png" alt="TeleDoctorSA logo">' +
        '<span class="tds-nav-brand">TeleDoctor<span>SA</span></span>' +
      '</a>' +
      '<button id="tdsNavMenuButton" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="tdsNavLinks">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
      '<div id="tdsNavLinks">' +
        '<div class="tds-offer-dropdown">' +
          '<button id="tdsOfferTrigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="tdsOfferPanel">What We Offer ' + chevron() + '</button>' +
          '<div id="tdsOfferPanel" aria-label="What We Offer">' + megaMenuMarkup() + '</div>' +
        '</div>' +
        '<a href="/our-services">Services</a>' +
        '<a href="/about-us">About</a>' +
        '<a href="/telemedia-suite">TeleMedia Suite</a>' +
        '<a href="/contact-us">Contact</a>' +
        '<div id="tdsContact">' +
          '<button id="tdsContactButton" type="button" aria-expanded="false" aria-controls="tdsContactMenu">Contact us ' + chevron() + '</button>' +
          '<div id="tdsContactMenu">' +
            '<div class="tds-contact-header"><div class="tds-contact-title">Get in touch</div><div class="tds-contact-subtitle">Choose your preferred contact method</div></div>' +
            '<div class="tds-contact-options">' +
              '<a class="tds-contact-option" href="' + WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer"><span class="tds-contact-icon">WA</span><span><span class="tds-contact-name">WhatsApp</span><span class="tds-contact-desc">Chat with the TeleDoctorSA team</span></span></a>' +
              '<a class="tds-contact-option" href="tel:+27780336394"><span class="tds-contact-icon">TEL</span><span><span class="tds-contact-name">Call</span><span class="tds-contact-desc">+27 78 033 6394</span></span></a>' +
              '<a class="tds-contact-option" href="mailto:info@teledoctorsa.co.za"><span class="tds-contact-icon">@</span><span><span class="tds-contact-name">Email</span><span class="tds-contact-desc">info@teledoctorsa.co.za</span></span></a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div id="tdsMobileConnect">' +
          '<span class="tds-mobile-connect-label">Connect with TeleDoctorSA</span>' +
          '<div class="tds-mobile-connect-row">' +
            '<a href="' + WHATSAPP_URL + '" target="_blank" rel="noopener noreferrer">WA</a>' +
            '<a href="' + FACEBOOK_URL + '" target="_blank" rel="noopener noreferrer">FB</a>' +
            '<a href="' + INSTAGRAM_URL + '" target="_blank" rel="noopener noreferrer">IG</a>' +
            '<a href="tel:+27780336394">Call</a>' +
          '</div>' +
        '</div>' +
      '</div>';

    return nav;
  }

  function normalizePath(value) {
    var path = (value || '/').split('?')[0].split('#')[0];
    path = path.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    path = path.replace(/\/$/, '') || '/';
    var aliases = {
      '/teledoctorsa-app': '/app'
    };
    return aliases[path] || path;
  }

  function markActive(nav) {
    var current = normalizePath(window.location.pathname);
    nav.querySelectorAll('#tdsNavLinks > a[href]').forEach(function (link) {
      var href = normalizePath(link.getAttribute('href'));
      if (href === current) link.setAttribute('aria-current', 'page');
    });
  }

  function removeLegacyTopNavigation() {
    document.querySelectorAll('#mobileOverlay, .mobile-overlay, .side-panel-overlay, .tds-mobile-nav, .tds-unified-mobile-nav').forEach(function (node) {
      node.remove();
    });

    document.querySelectorAll('nav').forEach(function (nav) {
      if (nav.id === 'tdsSiteNav') return;
      var isTopLevel = nav.parentElement === document.body;
      var looksLikePrimary = !!(
        nav.querySelector('.logo') ||
        nav.querySelector('.nav-links') ||
        nav.querySelector('.hamburger') ||
        nav.querySelector('[id*="hamburger"]') ||
        nav.classList.contains('top-nav') ||
        nav.classList.contains('navbar') ||
        nav.classList.contains('main-nav') ||
        nav.classList.contains('site-nav')
      );
      if (isTopLevel || looksLikePrimary) nav.remove();
    });

    document.querySelectorAll('#sidePanel').forEach(function (panel) { panel.remove(); });
  }

  function install() {
    if (!document.body) return;

    addStyles();
    removeLegacyTopNavigation();

    var existing = document.getElementById('tdsSiteNav');
    if (existing) existing.remove();
    var oldBackdrop = document.getElementById('tdsNavBackdrop');
    if (oldBackdrop) oldBackdrop.remove();

    var nav = buildNav();
    var backdrop = document.createElement('div');
    backdrop.id = 'tdsNavBackdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    document.body.insertBefore(nav, document.body.firstChild);
    nav.insertAdjacentElement('afterend', backdrop);

    var menuButton = nav.querySelector('#tdsNavMenuButton');
    var links = nav.querySelector('#tdsNavLinks');
    var offerTrigger = nav.querySelector('#tdsOfferTrigger');
    var offerPanel = nav.querySelector('#tdsOfferPanel');
    var contact = nav.querySelector('#tdsContact');
    var contactButton = nav.querySelector('#tdsContactButton');

    function isMobile() {
      return window.innerWidth <= MOBILE_MAX;
    }

    function setOffer(open) {
      offerPanel.classList.toggle('is-open', !!open);
      offerTrigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function setContact(open) {
      contact.classList.toggle('is-open', !!open);
      contactButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function setMobileMenu(open) {
      if (!isMobile() && open) return;
      links.classList.toggle('is-open', !!open);
      menuButton.classList.toggle('is-open', !!open);
      backdrop.classList.toggle('is-open', !!open);
      document.body.classList.toggle('tds-nav-open', !!open);
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (!open) {
        setOffer(false);
        setContact(false);
      }
    }

    menuButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setMobileMenu(!links.classList.contains('is-open'));
    });

    offerTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setContact(false);
      setOffer(!offerPanel.classList.contains('is-open'));
    });

    contactButton.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOffer(false);
      setContact(!contact.classList.contains('is-open'));
    });

    backdrop.addEventListener('click', function () {
      setMobileMenu(false);
    });

    nav.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (isMobile()) setMobileMenu(false);
        else {
          setOffer(false);
          setContact(false);
        }
      });
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target)) {
        setOffer(false);
        setContact(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (links.classList.contains('is-open')) {
        setMobileMenu(false);
        menuButton.focus();
      } else {
        setOffer(false);
        setContact(false);
      }
    });

    window.addEventListener('resize', function () {
      if (!isMobile()) setMobileMenu(false);
      setOffer(false);
      setContact(false);
    }, { passive: true });

    markActive(nav);
    document.body.setAttribute('data-tds-canonical-nav-ready', 'true');
    window.__TDS_CANONICAL_NAV_READY__ = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
