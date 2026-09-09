(function () {
  'use strict';

  function removeMobileBottomNavigation() {
    if (!document.getElementById('tds-remove-mobile-bottom-nav')) {
      var style = document.createElement('style');
      style.id = 'tds-remove-mobile-bottom-nav';
      style.textContent = `
        .tds-mobile-nav,
        .tds-offer-sheet,
        .tds-offer-sheet-backdrop,
        .tds-unified-mobile-nav,
        .tds-unified-offer-sheet,
        .tds-unified-offer-backdrop,
        .sticky-mobile-cta,
        .mobile-bottom-nav,
        .bottom-nav,
        .bottom-navigation,
        .mobile-navigation {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        @media (max-width: 900px) {
          body {
            padding-bottom: 0 !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.querySelectorAll(
      '.tds-mobile-nav, .tds-offer-sheet, .tds-offer-sheet-backdrop, ' +
      '.tds-unified-mobile-nav, .tds-unified-offer-sheet, .tds-unified-offer-backdrop, ' +
      '.sticky-mobile-cta, .mobile-bottom-nav, .bottom-nav, .bottom-navigation, .mobile-navigation'
    ).forEach(function (element) {
      element.setAttribute('aria-hidden', 'true');
      element.style.setProperty('display', 'none', 'important');
    });
  }

  function ensureCookiePolicyLinks() {
    var selectors = [
      '.site-footer-legal-links',
      '.footer-legal-links',
      'footer .legal-links'
    ];

    document.querySelectorAll(selectors.join(',')).forEach(function (container) {
      if (!container.querySelector('a[href*="cookies-policy"], a[href*="cookie-policy"]')) {
        var link = document.createElement('a');
        link.href = '/cookies-policy';
        link.textContent = 'Cookie Policy';
        container.appendChild(link);
      }

      if (!container.querySelector('[data-cookie-settings]')) {
        var settings = document.createElement('button');
        settings.type = 'button';
        settings.className = 'tds-cookie-settings-link';
        settings.setAttribute('data-cookie-settings', '');
        settings.textContent = 'Cookie Settings';
        container.appendChild(settings);
      }
    });
  }

  function loadOnce(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  function maintainGlobalUi() {
    removeMobileBottomNavigation();
    ensureCookiePolicyLinks();
  }

  maintainGlobalUi();
  loadOnce('tds-rebuild-images-core-loader', '/scripts/rebuild-images-core.js');
  loadOnce('tds-home-mobile-polish-loader', '/scripts/home-mobile-polish.js');
  loadOnce('tds-cookie-notice-loader', '/scripts/cookie-notice.js');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maintainGlobalUi);
  }

  var observer = new MutationObserver(maintainGlobalUi);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
