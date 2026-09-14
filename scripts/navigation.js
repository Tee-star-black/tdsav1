(function () {
  'use strict';
  var LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1'];
  var isLocalPreview = LOCAL_HOSTS.indexOf(window.location.hostname) !== -1;
  var localRouteMap = {
    '/': '/index.html', '/about-us': '/about-us.html', '/our-services': '/our-services.html',
    '/telemedia-suite': '/telemedia-suite.html', '/contact-us': '/contact-us.html', '/ehr': '/ehr.html',
    '/app': '/teledoctorsa-app.html', '/ecg247': '/ecg247.html', '/virtual-consultations': '/virtual-consultations.html',
    '/privacy-policy': '/privacy-policy.html', '/legal-notice': '/legal-notice.html', '/shop': '/shop.html'
  };
  function localTarget(href) {
    if (!isLocalPreview || !href || href.charAt(0) !== '/' || href.indexOf('//') === 0) return '';
    try {
      var url = new URL(href, window.location.origin);
      var path = url.pathname.replace(/\/$/, '') || '/';
      return localRouteMap[path] ? localRouteMap[path] + url.search + url.hash : '';
    } catch (error) { return ''; }
  }
  function init() {
    var hamburger = document.getElementById('hamburgerBtn');
    var navLinks = document.getElementById('navLinks');
    var mobileOverlay = document.getElementById('mobileOverlay');
    var openPanelBtn = document.getElementById('openPanelBtn');
    var closePanelBtn = document.getElementById('closePanelBtn');
    var sidePanel = document.getElementById('sidePanel');
    var sidePanelOverlay = document.getElementById('sidePanelOverlay');
    var contactDropdown = document.querySelector('.contact-dropdown');
    var contactButton = contactDropdown ? contactDropdown.querySelector('button') : null;
    var contactMenu = contactDropdown ? contactDropdown.querySelector('.contact-menu') : null;
    var mainNav = document.querySelector('nav:not(.tds-mobile-nav):not(.site-footer-legal-links)');

    function setMobile(open) {
      if (!hamburger || !navLinks) return;
      hamburger.classList.toggle('active', open); navLinks.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (mobileOverlay) mobileOverlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    function setPanel(open) {
      if (!openPanelBtn || !sidePanel || !sidePanelOverlay) return;
      sidePanel.classList.toggle('active', open); sidePanelOverlay.classList.toggle('active', open);
      openPanelBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    function setContact(open) {
      if (!contactButton || !contactMenu) return;
      contactButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      contactMenu.style.opacity = open ? '1' : '0'; contactMenu.style.visibility = open ? 'visible' : 'hidden';
      contactMenu.style.transform = open ? 'translateY(0)' : 'translateY(-8px)';
      contactMenu.style.pointerEvents = open ? 'auto' : 'none';
    }

    if (hamburger && navLinks) {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.addEventListener('click', function(e){ e.preventDefault(); setMobile(hamburger.getAttribute('aria-expanded') !== 'true'); });
    }
    if (mobileOverlay) mobileOverlay.addEventListener('click', function(){ setMobile(false); });
    if (openPanelBtn) {
      openPanelBtn.setAttribute('aria-expanded', 'false');
      openPanelBtn.addEventListener('click', function(e){ e.preventDefault(); setPanel(true); });
    }
    if (closePanelBtn) closePanelBtn.addEventListener('click', function(e){ e.preventDefault(); setPanel(false); });
    if (sidePanelOverlay) sidePanelOverlay.addEventListener('click', function(){ setPanel(false); });
    if (contactButton && contactMenu) {
      contactButton.type = 'button'; contactButton.setAttribute('aria-expanded','false');
      contactButton.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); setContact(contactButton.getAttribute('aria-expanded') !== 'true'); });
    }
    document.addEventListener('click', function(e){
      if (contactDropdown && !contactDropdown.contains(e.target)) setContact(false);
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      if (window.innerWidth <= 900 && navLinks && navLinks.contains(a)) setMobile(false);
      var target = localTarget(a.getAttribute('href'));
      if (!target || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); window.location.href = target;
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') { setMobile(false); setPanel(false); setContact(false); } });
    if (mainNav) window.addEventListener('scroll', function(){ mainNav.classList.toggle('scrolled', window.scrollY > 10); }, {passive:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
