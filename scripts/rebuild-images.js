(function () {
  'use strict';

  var LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];
  var isLocalPreview = LOCAL_HOSTS.indexOf(window.location.hostname) !== -1;

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
    '/shop': '/shop.html'
  };

  function normalizePath(href) {
    if (!href || href.charAt(0) !== '/' || href.indexOf('//') === 0) return '';
    try {
      return new URL(href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    } catch (error) {
      return '';
    }
  }

  function installLocalRouteFallback() {
    if (!isLocalPreview) return;

    document.addEventListener('click', function (event) {
      var anchor = event.target.closest && event.target.closest('a[href]');
      if (!anchor) return;
      if (anchor.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref === '#' || rawHref.charAt(0) === '#') return;

      var path = normalizePath(rawHref);
      var localTarget = localRouteMap[path];
      if (!localTarget) return;

      var url = new URL(rawHref, window.location.origin);
      event.preventDefault();
      window.location.href = localTarget + url.search + url.hash;
    });
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

  function removeLegacyLayoutInjection() {
    var staleStyle = document.getElementById('tds-layout-refresh');
    if (staleStyle) staleStyle.remove();

    document.querySelectorAll('.tds-four-grid').forEach(function (element) {
      element.classList.remove('tds-four-grid');
    });
  }

  function init() {
    removeLegacyLayoutInjection();
    installLocalRouteFallback();
    installMegaMenuSafety();
    installContactMenuSafety();
    installMobileMenuSafety();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
