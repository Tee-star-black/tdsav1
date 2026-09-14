(function(){
  var root = document.documentElement;
  var body = document.body;
  var sheet = document.querySelector('.tds-offer-sheet');
  var backdrop = document.querySelector('.tds-offer-sheet-backdrop');
  var lastFocusedEl = null;
  var isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isDataSaver = !!(navigator.connection && navigator.connection.saveData);

  root.classList.remove('tdsui-offer-sheet-open');

  function getFocusable(container){
    if(!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'));
  }

  function trapFocus(e){
    if(!root.classList.contains('tdsui-offer-sheet-open') || e.key !== 'Tab') return;
    var focusables = getFocusable(sheet);
    if(!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if(e.shiftKey && document.activeElement === first){
      e.preventDefault();
      last.focus();
    }else if(!e.shiftKey && document.activeElement === last){
      e.preventDefault();
      first.focus();
    }
  }

  function setBodyLock(locked){
    if(locked){
      body.dataset.tdsPrevOverflow = body.style.overflow || '';
      body.style.overflow = 'hidden';
    }else{
      body.style.overflow = body.dataset.tdsPrevOverflow || '';
      delete body.dataset.tdsPrevOverflow;
    }
  }

  function openSheet(){
    lastFocusedEl = document.activeElement;
    root.classList.add('tdsui-offer-sheet-open');
    setBodyLock(true);
    var focusables = getFocusable(sheet);
    if(focusables.length){ focusables[0].focus(); }
  }

  function closeSheet(){
    root.classList.remove('tdsui-offer-sheet-open');
    setBodyLock(false);
    if(lastFocusedEl && typeof lastFocusedEl.focus === 'function'){
      lastFocusedEl.focus();
    }
  }

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && root.classList.contains('tdsui-offer-sheet-open')){
      closeSheet();
      return;
    }
    trapFocus(e);
  });

  // Ripple effect
  document.querySelectorAll('.tds-mnav-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      if(isReducedMotion || isDataSaver) return;
      var ripple = document.createElement('span');
      var rect = this.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var x = e.clientX - rect.left - size / 2;
      var y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.6)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple-effect 0.6s ease-out';
      ripple.style.pointerEvents = 'none';
      this.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 600);
    });
  });

  // Bounce-on-scroll only when motion allowed
  var lastScroll = 0;
  var nav = document.querySelector('.tds-mobile-nav');
  if (nav && !isReducedMotion && !isDataSaver) {
    window.addEventListener('scroll', function() {
      var currentScroll = window.pageYOffset;
      if (Math.abs(currentScroll - lastScroll) > 50) {
        nav.style.animation = 'none';
        setTimeout(function() {
          nav.style.animation = 'floatNav 3s ease-in-out infinite';
        }, 10);
      }
      lastScroll = currentScroll;
    });
  } else if (nav) {
    nav.style.animation = 'none';
  }

  // Swipe down to close sheet
  var startY = 0;
  if(sheet){
    sheet.addEventListener('touchstart', function(e){
      startY = (e.touches && e.touches[0]) ? e.touches[0].clientY : 0;
    }, {passive:true});
    sheet.addEventListener('touchend', function(e){
      var endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : startY;
      if(endY - startY > 60){ closeSheet(); }
    }, {passive:true});
  }

  document.querySelectorAll('[data-tds-offer-open]').forEach(function(btn){
    btn.addEventListener('click', openSheet);
  });
  document.querySelectorAll('[data-tds-offer-close]').forEach(function(el){
    el.addEventListener('click', closeSheet);
  });
  document.querySelectorAll('.tds-offer-sheet a').forEach(function(a){
    a.addEventListener('click', closeSheet);
  });

  document.querySelectorAll('.tds-mobile-nav a.tds-mnav-item[data-page]').forEach(function(link){
    link.addEventListener('click', function(e){
      var page = link.getAttribute('data-page') || '';
      var forcedTargets = {
        about: 'about-us.html',
        telemedia: 'telemedia-suite.html'
      };
      var target = forcedTargets[page];
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = target;
      }
    });
  });

  document.querySelectorAll('.nav-links a[href="/telemedia-suite"], a.tds-mnav-item[href="/telemedia-suite"]').forEach(function(link){
    link.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      window.location.href = 'telemedia-suite.html';
    });
  });

  function syncActiveNav(){
    var path = (location.pathname || '').split('/').pop() || 'index.html';
    path = path.toLowerCase();
    var map = {
      'index.html':'home',
      'about-us.html':'about',
      'contact-us.html':'contact',
      'our-services.html':'services',
      'telemedia-suite.html':'telemedia',
      'app.html':'telemedia',
      'teledoctorsa-app.html':'telemedia',
      'ehr.html':'offer',
      'ecg247.html':'offer',
      'virtual-consultations.html':'offer'
    };
    var key = map[path] || '';
    document.querySelectorAll('.tds-mnav-item').forEach(function(el){
      var p = el.getAttribute('data-page') || '';
      if(p && p === key){
        el.setAttribute('aria-current','page');
      }else{
        el.removeAttribute('aria-current');
      }
    });
  }

  syncActiveNav();
  window.addEventListener('popstate', syncActiveNav);
  window.addEventListener('pageshow', syncActiveNav);
})();
