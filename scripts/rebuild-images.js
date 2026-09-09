(function () {
  'use strict';

  if (window.__TDS_GLOBAL_V2__) return;
  window.__TDS_GLOBAL_V2__ = true;

  var LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];
  var isLocalPreview = LOCAL_HOSTS.indexOf(window.location.hostname) !== -1;

  var cleanRoutes = {
    '/': '/',
    '/index.html': '/',
    '/about-us': '/about-us',
    '/about-us.html': '/about-us',
    '/our-services': '/our-services',
    '/our-services.html': '/our-services',
    '/telemedia-suite': '/telemedia-suite',
    '/telemedia-suite.html': '/telemedia-suite',
    '/contact-us': '/contact-us',
    '/contact-us.html': '/contact-us',
    '/ehr': '/ehr',
    '/ehr.html': '/ehr',
    '/ehr/index.html': '/ehr',
    '/app': '/app',
    '/app.html': '/app',
    '/teledoctorsa-app.html': '/app',
    '/app/index.html': '/app',
    '/ecg247': '/ecg247',
    '/ecg247.html': '/ecg247',
    '/ecg247/index.html': '/ecg247',
    '/virtual-consultations': '/virtual-consultations',
    '/virtual-consultations.html': '/virtual-consultations',
    '/privacy-policy': '/privacy-policy',
    '/privacy-policy.html': '/privacy-policy',
    '/legal-notice': '/legal-notice',
    '/legal-notice.html': '/legal-notice',
    '/shop': '/shop',
    '/shop.html': '/shop',
    '/doctors': '/doctors',
    '/doctors.html': '/doctors',
    '/nurses': '/nurses',
    '/nurses.html': '/nurses',
    '/patients': '/patients',
    '/patients.html': '/patients',
    '/patients-portal': '/patients-portal',
    '/patients-portal.html': '/patients-portal'
  };

  var bareRoutes = {
    'index.html': '/',
    'about-us': '/about-us',
    'about-us.html': '/about-us',
    'our-services': '/our-services',
    'our-services.html': '/our-services',
    'telemedia-suite': '/telemedia-suite',
    'telemedia-suite.html': '/telemedia-suite',
    'contact-us': '/contact-us',
    'contact-us.html': '/contact-us',
    'ehr': '/ehr',
    'ehr.html': '/ehr',
    'app': '/app',
    'app.html': '/app',
    'teledoctorsa-app.html': '/app',
    'ecg247': '/ecg247',
    'ecg247.html': '/ecg247',
    'virtual-consultations': '/virtual-consultations',
    'virtual-consultations.html': '/virtual-consultations',
    'privacy-policy': '/privacy-policy',
    'privacy-policy.html': '/privacy-policy',
    'legal-notice': '/legal-notice',
    'legal-notice.html': '/legal-notice',
    'shop': '/shop',
    'shop.html': '/shop',
    'doctors': '/doctors',
    'doctors.html': '/doctors',
    'nurses': '/nurses',
    'nurses.html': '/nurses',
    'patients': '/patients',
    'patients.html': '/patients',
    'patients-portal': '/patients-portal',
    'patients-portal.html': '/patients-portal',
    'wellness.html': '/our-services',
    'clinician-portal.html': '/doctors'
  };

  var localRouteMap = {
    '/': '/index.html',
    '/about-us': '/about-us.html',
    '/our-services': '/our-services.html',
    '/telemedia-suite': '/telemedia-suite.html',
    '/contact-us': '/contact-us.html',
    '/ehr': '/ehr.html',
    '/app': '/teledoctorsa-app.html',
    '/ecg247': '/ecg247.html',
    '/virtual-consultations': '/virtual-consultations.html',
    '/privacy-policy': '/privacy-policy.html',
    '/legal-notice': '/legal-notice.html',
    '/shop': '/shop.html',
    '/doctors': '/doctors.html',
    '/nurses': '/nurses.html',
    '/patients': '/patients.html',
    '/patients-portal': '/patients-portal.html'
  };

  function ensureStyle(href, marker) {
    if (document.querySelector('link[' + marker + ']')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute(marker, '');
    document.head.appendChild(link);
  }

  function routeFromHref(rawHref) {
    if (!rawHref) return null;
    var raw = rawHref.trim();
    if (!raw || raw === '#' || raw.charAt(0) === '#') return null;
    if (/^(?:mailto:|tel:|javascript:|data:)/i.test(raw)) return null;

    var queryIndex = raw.indexOf('?');
    var hashIndex = raw.indexOf('#');
    var cut = raw.length;
    if (queryIndex >= 0) cut = Math.min(cut, queryIndex);
    if (hashIndex >= 0) cut = Math.min(cut, hashIndex);
    var bare = raw.slice(0, cut).replace(/^\.\//, '').replace(/^\.\.\//, '');

    if (bareRoutes[bare]) {
      return {
        route: bareRoutes[bare],
        suffix: raw.slice(cut)
      };
    }

    try {
      var url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin) return null;
      var path = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
      var route = cleanRoutes[path];
      if (!route) return null;
      return {
        route: route,
        suffix: url.search + url.hash
      };
    } catch (error) {
      return null;
    }
  }

  function normalizeInternalLinks() {
    document.querySelectorAll('a[href]').forEach(function (anchor) {
      var raw = anchor.getAttribute('href');
      var match = routeFromHref(raw);
      if (!match) return;

      if (anchor.closest('.services-section .service-card') && /book consultation/i.test(anchor.textContent || '')) {
        match.route = '/virtual-consultations';
      }

      var destination = match.route + match.suffix;
      if (isLocalPreview && localRouteMap[match.route]) {
        destination = localRouteMap[match.route] + match.suffix;
      }
      anchor.setAttribute('href', destination);
    });
  }

  function ensureFooter() {
    var existing = document.querySelector('footer:not(.footer-mobile), .site-footer, .footer:not(.footer-mobile)');
    if (existing) {
      var copyright = existing.querySelector('.footer-bottom p, .site-footer-copyright');
      if (copyright && copyright.textContent) {
        copyright.textContent = copyright.textContent.replace(/\b2025\b/g, '2026');
      }
      return;
    }

    var footer = document.createElement('footer');
    footer.className = 'footer tds-injected-footer';
    footer.setAttribute('data-tds-injected-footer', '');
    footer.innerHTML =
      '<div class="footer-content">' +
        '<div class="footer-section">' +
          '<div class="tds-footer-brandline">' +
            '<img src="/images/rebuild/logo.png" alt="TeleDoctorSA logo">' +
            '<div><strong>TeleDoctorSA</strong><span>Connected care across South Africa</span></div>' +
          '</div>' +
          '<p>Virtual consultations, ECG247 monitoring, digital records and connected care support from a real clinical team.</p>' +
        '</div>' +
        '<div class="footer-section">' +
          '<h3>Quick Links</h3>' +
          '<ul class="footer-links">' +
            '<li><a href="/">Home</a></li>' +
            '<li><a href="/our-services">Services</a></li>' +
            '<li><a href="/about-us">About</a></li>' +
            '<li><a href="/telemedia-suite">TeleMedia Suite</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="footer-section">' +
          '<h3>Care Paths</h3>' +
          '<ul class="footer-links">' +
            '<li><a href="/virtual-consultations">Virtual consultations</a></li>' +
            '<li><a href="/ecg247">ECG247 monitoring</a></li>' +
            '<li><a href="/app">TeleDoctorSA app</a></li>' +
            '<li><a href="/ehr">Electronic health records</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="footer-section">' +
          '<h3>Contact & Legal</h3>' +
          '<p><a href="tel:+27780336394">+27 78 033 6394</a><br><a href="mailto:info@teledoctorsa.co.za">info@teledoctorsa.co.za</a><br>29 Landor Street, Tulisa Park, Johannesburg, 2197</p>' +
          '<div class="tds-footer-legal"><a href="/privacy-policy">Privacy</a><a href="/legal-notice">Legal Notice</a><a href="/contact-us">Contact</a></div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom"><p>&copy; 2026 TeleDoctorSA. All rights reserved.</p></div>';

    document.body.appendChild(footer);
  }

  function installMegaMenuSafety() {
    var openButton = document.getElementById('openPanelBtn');
    var closeButton = document.getElementById('closePanelBtn');
    var panel = document.getElementById('sidePanel');
    var overlay = document.getElementById('sidePanelOverlay');

    if (!openButton || !panel || !overlay) return;

    function openPanel(event) {
      if (event) event.preventDefault();
      panel.classList.add('active');
      overlay.classList.add('active');
      openButton.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closePanel(event) {
      if (event) event.preventDefault();
      panel.classList.remove('active');
      overlay.classList.remove('active');
      openButton.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    openButton.setAttribute('aria-expanded', 'false');
    openButton.addEventListener('click', openPanel);
    if (closeButton) closeButton.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && panel.classList.contains('active')) closePanel();
    });
  }

  function installContactMenuSafety() {
    var dropdown = document.querySelector('.contact-dropdown');
    if (!dropdown) return;

    var button = dropdown.querySelector('button');
    var menu = dropdown.querySelector('.contact-menu');
    if (!button || !menu) return;

    function setOpen(open) {
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.style.opacity = open ? '1' : '0';
      menu.style.visibility = open ? 'visible' : 'hidden';
      menu.style.transform = open ? 'translateY(0)' : 'translateY(-8px)';
      menu.style.pointerEvents = open ? 'auto' : 'none';
    }

    button.setAttribute('type', 'button');
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });

    dropdown.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches) setOpen(true);
    });

    dropdown.addEventListener('mouseleave', function () {
      if (window.matchMedia('(hover: hover)').matches) setOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (!dropdown.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function installMobileMenuSafety() {
    var button = document.getElementById('hamburgerBtn');
    var links = document.getElementById('navLinks');
    var overlay = document.getElementById('mobileOverlay');
    if (!button || !links) return;

    function setOpen(open) {
      button.classList.toggle('active', open);
      links.classList.toggle('active', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (overlay) overlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    if (!button.hasAttribute('aria-expanded')) button.setAttribute('aria-expanded', 'false');

    button.addEventListener('click', function (event) {
      event.preventDefault();
      setOpen(button.getAttribute('aria-expanded') !== 'true');
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        setOpen(false);
      });
    }

    links.querySelectorAll('a[href]').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 900) setOpen(false);
      });
    });
  }

  function currentRoute() {
    var path = (window.location.pathname || '/').replace(/\/{2,}/g, '/');
    if (cleanRoutes[path]) return cleanRoutes[path];
    var last = path.split('/').pop() || 'index.html';
    if (bareRoutes[last]) return bareRoutes[last];
    return path.replace(/\/$/, '') || '/';
  }

  function installMobileDockV2() {
    var nav = document.querySelector('.tds-mobile-nav');
    var row = nav && nav.querySelector('.tds-mobile-nav__row');
    if (!nav || !row) return;

    row.innerHTML =
      '<a class="tds-mnav-item" href="/" data-route="/" aria-label="Home">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' +
        '<span>Home</span>' +
      '</a>' +
      '<a class="tds-mnav-item" href="/our-services" data-route="/our-services" aria-label="Services">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5h16v14H4zM8 5v14M4 10h16" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' +
        '<span>Services</span>' +
      '</a>' +
      '<a class="tds-mnav-item" href="/app" data-route="/app" aria-label="TeleDoctorSA App">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M10 17h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '<span>App</span>' +
      '</a>' +
      '<a class="tds-mnav-item" href="/virtual-consultations" data-route="/virtual-consultations" aria-label="Book a consultation">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="6" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.8"/><path d="M17 10l4-2v8l-4-2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' +
        '<span>Consult</span>' +
      '</a>' +
      '<button class="tds-mnav-item" type="button" data-tds-more-open aria-label="More">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/></svg>' +
        '<span>More</span>' +
      '</button>';

    var sheet = document.querySelector('.tds-offer-sheet');
    var backdrop = document.querySelector('.tds-offer-sheet-backdrop');
    if (sheet) {
      sheet.setAttribute('aria-label', 'More navigation');
      sheet.innerHTML =
        '<div class="tds-sheet-grab" aria-hidden="true"></div>' +
        '<h3 class="tds-sheet-title">More</h3>' +
        '<div class="tds-sheet-grid">' +
          '<a class="tds-sheet-card" href="/ehr"><span class="tds-sheet-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M7 4h10v16H7zM9 8h6M9 12h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span class="tds-sheet-content"><span class="tds-sheet-name">Health Records</span></span></a>' +
          '<a class="tds-sheet-card" href="/ecg247"><span class="tds-sheet-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M2 12h4l2-6 4 12 2-6h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="tds-sheet-content"><span class="tds-sheet-name">ECG247</span></span></a>' +
          '<a class="tds-sheet-card" href="/about-us"><span class="tds-sheet-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span class="tds-sheet-content"><span class="tds-sheet-name">About</span></span></a>' +
          '<a class="tds-sheet-card" href="/telemedia-suite"><span class="tds-sheet-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" stroke="currentColor" stroke-width="1.8"/></svg></span><span class="tds-sheet-content"><span class="tds-sheet-name">TeleMedia Suite</span></span></a>' +
          '<a class="tds-sheet-card" href="/contact-us"><span class="tds-sheet-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M5 5h14v11H9l-4 3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span class="tds-sheet-content"><span class="tds-sheet-name">Contact</span></span></a>' +
          '<a class="tds-sheet-card" href="/patients"><span class="tds-sheet-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M6 20c.7-4 2.8-6 6-6s5.3 2 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span class="tds-sheet-content"><span class="tds-sheet-name">Patient Access</span></span></a>' +
        '</div>';
    }

    function openMore(event) {
      if (event) event.preventDefault();
      document.documentElement.classList.add('tdsui-offer-sheet-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMore(event) {
      if (event) event.preventDefault();
      document.documentElement.classList.remove('tdsui-offer-sheet-open');
      document.body.style.overflow = '';
    }

    var moreButton = row.querySelector('[data-tds-more-open]');
    if (moreButton) moreButton.addEventListener('click', openMore);
    if (backdrop) backdrop.addEventListener('click', closeMore);
    if (sheet) {
      sheet.querySelectorAll('a[href]').forEach(function (link) {
        link.addEventListener('click', closeMore);
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && document.documentElement.classList.contains('tdsui-offer-sheet-open')) {
        closeMore();
      }
    });

    var active = currentRoute();
    row.querySelectorAll('[data-route]').forEach(function (item) {
      if (item.getAttribute('data-route') === active) {
        item.setAttribute('aria-current', 'page');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  function removeLegacyLayoutInjection() {
    var staleStyle = document.getElementById('tds-layout-refresh');
    if (staleStyle) staleStyle.remove();

    document.querySelectorAll('.tds-four-grid').forEach(function (element) {
      element.classList.remove('tds-four-grid');
    });
  }

  function init() {
    ensureStyle('/site-polish.css?v=20260909', 'data-tds-production-polish');
    ensureStyle('/site-global-v2.css?v=20260909', 'data-tds-global-v2');
    ensureStyle('/styles/ux-v3.css?v=20260909', 'data-tds-ux-v3');
    removeLegacyLayoutInjection();
    ensureFooter();
    normalizeInternalLinks();
    installMegaMenuSafety();
    installContactMenuSafety();
    installMobileMenuSafety();
    installMobileDockV2();
    normalizeInternalLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
