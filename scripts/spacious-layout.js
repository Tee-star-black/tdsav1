(function () {
  'use strict';

  if (!document.querySelector('link[data-tds-production-polish]')) {
    var polish = document.createElement('link');
    polish.rel = 'stylesheet';
    polish.href = '/site-polish.css?v=20260909';
    polish.setAttribute('data-tds-production-polish', '');
    document.head.appendChild(polish);
  }

  if (!document.querySelector('link[data-tds-global-v2]')) {
    var globalCss = document.createElement('link');
    globalCss.rel = 'stylesheet';
    globalCss.href = '/site-global-v2.css?v=20260909';
    globalCss.setAttribute('data-tds-global-v2', '');
    document.head.appendChild(globalCss);
  }

  if (!window.__TDS_GLOBAL_V2__ && !document.querySelector('script[data-tds-global-runtime]')) {
    var script = document.createElement('script');
    script.src = '/scripts/rebuild-images.js?v=20260909';
    script.setAttribute('data-tds-global-runtime', '');
    document.head.appendChild(script);
  }
})();
