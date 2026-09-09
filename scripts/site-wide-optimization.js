(function () {
  'use strict';
  if (document.querySelector('link[data-tds-production-polish]')) return;
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/site-polish.css?v=20260909';
  link.setAttribute('data-tds-production-polish', '');
  document.head.appendChild(link);
})();
