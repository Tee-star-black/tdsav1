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

  function loadOnce(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }

  removeMobileBottomNavigation();
  loadOnce('tds-rebuild-images-core-loader', '/scripts/rebuild-images-core.js');

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeMobileBottomNavigation);
  }

  var observer = new MutationObserver(removeMobileBottomNavigation);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
