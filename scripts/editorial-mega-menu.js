/* Accessible editorial mega menu, preserves existing site navigation. */
(function () {
 'use strict';
 function init() {
  var legacy = document.getElementById('openPanelBtn');
  if (!legacy || document.getElementById('tdsMegaTrigger')) return;
  var container = legacy.closest('.dropdown');
  if (!container) return;
  var nav = container.closest('nav');
  if (nav) nav.classList.add('tds-editorial-nav');
  container.className = 'tds-mega';
  container.innerHTML = [
    '<button id="tdsMegaTrigger" class="tds-mega-trigger" type="button" aria-expanded="false" aria-controls="tdsMegaPanel">What We Offer <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>',
    '<div id="tdsMegaPanel" class="tds-mega-panel" aria-label="What We Offer" hidden>',
    '<div class="tds-mega-topline"><div><span class="tds-mega-kicker">TELEDOCTORSA / SOLUTIONS</span><strong>Connected care, made simpler.</strong><p>Explore our digital healthcare services and patient solutions.</p></div><a class="tds-mega-feature" href="/contact-us">Book a demo &#8599;</a></div>',
    '<div class="tds-mega-items">',
    '<a class="tds-mega-item" href="/ehr"><span class="tds-mega-icon"><i data-lucide="clipboard-list"></i></span><span><strong>Electronic Health Records</strong><small>Access and manage secure digital patient information.</small></span></a>',
    '<a class="tds-mega-item" href="/app"><span class="tds-mega-icon"><i data-lucide="smartphone"></i></span><span><strong>TeleDoctorSA App</strong><small>Connected patient monitoring and digital care pathways.</small></span></a>',
    '<a class="tds-mega-item" href="/ecg247"><span class="tds-mega-icon"><i data-lucide="activity"></i></span><span><strong>ECG247 Heart Monitoring</strong><small>Discover remote heart rhythm monitoring and device guidance.</small></span></a>',
    '<a class="tds-mega-item" href="/virtual-consultations"><span class="tds-mega-icon"><i data-lucide="video"></i></span><span><strong>Virtual Consultations</strong><small>Connect with a healthcare professional remotely.</small></span></a>',
    '</div><div class="tds-mega-footer"><span>Care that connects patients and clinicians.</span><a href="/our-services">Explore all services &#8594;</a></div>',
    '</div>'
  ].join('');
  var trigger = document.getElementById('tdsMegaTrigger');
  var panel = document.getElementById('tdsMegaPanel');
  function setOpen(open) {
   trigger.setAttribute('aria-expanded', String(open));
   panel.hidden = !open;
   panel.classList.toggle('is-open', open);
  }
  trigger.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setOpen(trigger.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', function (e) { if (!container.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') { setOpen(false); trigger.focus(); } });
  panel.addEventListener('click', function (e) {
   if (e.target.closest('a')) setOpen(false);
  });
  if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
})();
