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

  loadOnce('tds-rebuild-images-core-loader', '/scripts/rebuild-images-core.js');
  loadOnce('tds-unified-mobile-nav-loader', '/scripts/mobile-nav.js');
  loadOnce('tds-footer-full-bleed-guard-loader', '/scripts/footer-full-bleed-guard.js');
})();
