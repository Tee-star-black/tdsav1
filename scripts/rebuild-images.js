(function () {
  'use strict';

  function loadOnce(id, src) {
    if (document.getElementById(id)) return;
    var script = document.createElement('script');
    script.id = id;
    script.async = false;
    script.src = src;
    document.head.appendChild(script);
  }

  function loadStyleOnce(id, href) {
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  var release = '20260914-nav3';

  loadStyleOnce('tds-center-alignment-loader', '/styles/center-alignment.css?v=' + release);
  loadOnce('tds-rebuild-images-core-loader', '/scripts/rebuild-images-core.js?v=' + release);
  loadOnce('tds-canonical-nav-loader', '/scripts/canonical-nav.js?v=' + release);
  loadOnce('tds-unified-mobile-nav-loader', '/scripts/mobile-nav.js?v=' + release);
  loadOnce('tds-editorial-mega-menu-loader', '/scripts/mega-menu.js?v=' + release);
  loadOnce('tds-footer-full-bleed-guard-loader', '/scripts/footer-full-bleed-guard.js?v=' + release);
})();
