(function () {
  'use strict';

  if (window.__TDS_COOKIE_NOTICE__) return;
  window.__TDS_COOKIE_NOTICE__ = true;

  var STORAGE_KEY = 'tds_cookie_consent';
  var COOKIE_NAME = 'tds_cookie_consent';
  var MAX_AGE = 60 * 60 * 24 * 180;

  function readPreference() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || '';
    } catch (error) {
      var match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : '';
    }
  }

  function savePreference(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {}

    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + MAX_AGE + '; SameSite=Lax; Secure';

    window.TDSCookieConsent = value;
    window.dispatchEvent(new CustomEvent('tds:cookie-consent', { detail: { preference: value } }));
  }

  function addStyles() {
    if (document.getElementById('tds-cookie-notice-styles')) return;

    var style = document.createElement('style');
    style.id = 'tds-cookie-notice-styles';
    style.textContent = `
      .tds-cookie-notice {
        position: fixed;
        left: 18px;
        bottom: 18px;
        z-index: 12000;
        width: min(390px, calc(100vw - 36px));
        padding: 15px;
        border: 1px solid rgba(15,23,42,.12);
        border-radius: 8px;
        background: rgba(255,255,255,.97);
        color: #0f172a;
        box-shadow: 0 18px 50px rgba(15,23,42,.18);
        -webkit-backdrop-filter: blur(14px);
        backdrop-filter: blur(14px);
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        opacity: 0;
        transform: translateY(14px);
        transition: opacity .2s ease, transform .2s ease;
      }

      .tds-cookie-notice.is-visible {
        opacity: 1;
        transform: translateY(0);
      }

      .tds-cookie-notice__top {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .tds-cookie-notice__icon {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        flex: 0 0 34px;
        border-radius: 6px;
        background: #fff3ea;
        color: #e36d2f;
        font-size: 17px;
      }

      .tds-cookie-notice h2 {
        margin: 1px 0 5px;
        color: #0f172a;
        font-size: .9rem;
        line-height: 1.2;
        letter-spacing: -.015em;
      }

      .tds-cookie-notice p {
        margin: 0;
        color: #64748b;
        font-size: .75rem;
        line-height: 1.45;
      }

      .tds-cookie-notice p a {
        color: #b95522;
        font-weight: 700;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .tds-cookie-notice__actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 12px;
      }

      .tds-cookie-notice button {
        min-height: 38px;
        padding: 8px 10px;
        border-radius: 5px;
        font: 800 .72rem/1 'Plus Jakarta Sans', system-ui, sans-serif;
        cursor: pointer;
      }

      .tds-cookie-notice__essential {
        border: 1px solid #cbd5e1;
        background: #fff;
        color: #334155;
      }

      .tds-cookie-notice__accept {
        border: 1px solid #ff8844;
        background: #ff8844;
        color: #0f172a;
      }

      .tds-cookie-settings-link {
        appearance: none;
        border: 0;
        padding: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      @media (max-width: 640px) {
        .tds-cookie-notice {
          left: 12px;
          right: 12px;
          bottom: 12px;
          width: auto;
          padding: 13px;
        }

        .tds-cookie-notice__icon {
          width: 30px;
          height: 30px;
          flex-basis: 30px;
          font-size: 15px;
        }

        .tds-cookie-notice h2 { font-size: .84rem; }
        .tds-cookie-notice p { font-size: .71rem; }
        .tds-cookie-notice button { min-height: 36px; font-size: .69rem; }
      }

      @media (prefers-reduced-motion: reduce) {
        .tds-cookie-notice { transition: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function removeNotice() {
    var notice = document.querySelector('.tds-cookie-notice');
    if (!notice) return;
    notice.classList.remove('is-visible');
    window.setTimeout(function () {
      if (notice.parentNode) notice.parentNode.removeChild(notice);
    }, 220);
  }

  function choose(value) {
    savePreference(value);
    removeNotice();
  }

  function showNotice(force) {
    addStyles();
    if (!force && readPreference()) return;
    if (document.querySelector('.tds-cookie-notice')) return;

    var notice = document.createElement('aside');
    notice.className = 'tds-cookie-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-label', 'Cookie preferences');
    notice.innerHTML =
      '<div class="tds-cookie-notice__top">' +
        '<div class="tds-cookie-notice__icon" aria-hidden="true">◌</div>' +
        '<div>' +
          '<h2>Cookie preferences</h2>' +
          '<p>We use essential browser storage to keep the site working. Optional technologies are used only when enabled. <a href="/cookies-policy">Read policy</a>.</p>' +
        '</div>' +
      '</div>' +
      '<div class="tds-cookie-notice__actions">' +
        '<button type="button" class="tds-cookie-notice__essential">Essential only</button>' +
        '<button type="button" class="tds-cookie-notice__accept">Accept</button>' +
      '</div>';

    notice.querySelector('.tds-cookie-notice__essential').addEventListener('click', function () {
      choose('essential');
    });

    notice.querySelector('.tds-cookie-notice__accept').addEventListener('click', function () {
      choose('all');
    });

    document.body.appendChild(notice);
    window.requestAnimationFrame(function () {
      notice.classList.add('is-visible');
    });
  }

  function installSettingsLinks() {
    document.querySelectorAll('[data-cookie-settings]').forEach(function (control) {
      if (control.dataset.cookieSettingsReady === 'true') return;
      control.dataset.cookieSettingsReady = 'true';
      control.addEventListener('click', function (event) {
        event.preventDefault();
        showNotice(true);
      });
    });
  }

  window.TDSCookiePreferences = {
    get: readPreference,
    open: function () { showNotice(true); },
    set: choose
  };

  function init() {
    window.TDSCookieConsent = readPreference();
    installSettingsLinks();
    showNotice(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  var observer = new MutationObserver(installSettingsLinks);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
