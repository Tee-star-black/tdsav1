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

  var release = '20261021-mobile-refinement';
  // Local static servers do not read production .htaccess URL rewrites.
  // This delegated bridge keeps all public-page navigation working in VS Code Live Server
  // and python -m http.server, including links created by the canonical nav and footer.
  function installLocalRoutes() {
    var localHosts = ['localhost', '127.0.0.1', '::1', '[::1]'];
    if (localHosts.indexOf(window.location.hostname) === -1 || window.__TDS_LOCAL_ROUTE_BRIDGE__) return;

    window.__TDS_LOCAL_ROUTE_BRIDGE__ = true;
    var routes = {
      '/': '/index.html',
      '/about-us': '/about-us.html',
      '/our-services': '/our-services.html',
      '/telemedia-suite': '/telemedia-suite.html',
      '/contact-us': '/contact-us.html',
      '/virtual-consultations': '/virtual-consultations.html',
      '/ehr': '/ehr.html',
      '/ecg247': '/ecg247.html',
      '/app': '/teledoctorsa-app.html',
      '/patients': 'https://demo-patient.teledoctorsa.co.za/',
      '/doctors': '/doctors.html',
      '/nurses': '/nurses.html',
      '/patients-portal': '/patients-portal.html',
      '/privacy-policy': '/privacy-policy.html',
      '/legal-notice': '/legal-notice.html',
      '/cookies-policy': '/cookies-policy.html',
      '/upvio': '/upvio.html',
      '/qr-codes': '/qr-codes.html',
      '/health-conference': '/health-conference.html'
    };
    document.addEventListener('click', function (event) {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      var anchor = event.target.closest && event.target.closest('a[href]');
      if (!anchor || anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank') return;
      var href = anchor.getAttribute('href');
      if (!href || href.charAt(0) !== '/' || href.slice(0, 2) === '//') return;

      var url;
      try { url = new URL(href, window.location.origin); } catch (error) { return; }
      if (url.origin !== window.location.origin) return;

      var path = url.pathname.replace(/\/+$/, '') || '/';
      var mapped = routes[path];
      if (!mapped) return;

      event.preventDefault();
      var target = mapped.charAt(0) === '/' ? mapped + url.search + url.hash : mapped;
      window.location.assign(target);
    }, true);
  }

  installLocalRoutes();


  loadStyleOnce('tds-center-alignment-loader', '/styles/center-alignment.css?v=' + release);
  loadStyleOnce('tds-home-hero-center-loader', '/styles/home-hero-center.css?v=' + release);
  loadStyleOnce('tds-mobile-navigation-refinement', '/styles/mobile-navigation.css?v=' + release);
  loadStyleOnce('tds-home-experience-refinement', '/styles/home-experience.css?v=' + release);
  loadOnce('tds-rebuild-images-core-loader', '/scripts/rebuild-images-core.js?v=20261019-ecg-layout');
  loadOnce('tds-canonical-nav-loader', '/scripts/canonical-nav.js?v=' + release);
  loadOnce('tds-nav-back-controls-loader', '/scripts/nav-back-controls.js?v=' + release);
  loadOnce('tds-nav-brand-icons-loader', '/scripts/nav-brand-icons.js?v=' + release);
  loadOnce('tds-footer-full-bleed-guard-loader', '/scripts/footer-full-bleed-guard.js?v=' + release);
  // One minimal brand footer for every public page using this shared loader.
  loadStyleOnce('tds-unified-footer-style', '/styles/unified-footer.css?v=20261015-navfix1');
  loadOnce('tds-canonical-footer-loader', '/scripts/canonical-footer.js?v=20261019-app-refresh');
})();

