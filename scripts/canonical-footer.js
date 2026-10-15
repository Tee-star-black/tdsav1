(function () {
  'use strict';

  if (window.__TDS_CANONICAL_FOOTER__) return;
  window.__TDS_CANONICAL_FOOTER__ = true;

  function renderFooter() {
    if (!document.body || document.getElementById('tds-canonical-footer')) return;

    var template = document.createElement('template');
    template.innerHTML = [
      '<footer id="tds-canonical-footer" class="tds-canonical-footer" aria-label="TeleDoctorSA site footer">',
      '  <div class="tds-foot-shell">',
      '    <div class="tds-foot-main">',
      '      <div class="tds-foot-brand">',
      '        <a class="tds-foot-logo-link" href="/" aria-label="TeleDoctorSA home">',
      '          <img src="/images/rebuild/logo.png" alt="TeleDoctorSA logo" width="54" height="54" loading="lazy">',
      '          <span><strong>TeleDoctorSA</strong><small>Your health, our technology.</small></span>',
      '        </a>',
      '        <p>Connected healthcare, made simpler.</p>',
      '      </div>',
      '      <div class="tds-foot-col">',
      '        <h2>Explore</h2>',
      '        <div class="tds-foot-links">',
      '          <a href="/our-services">Our services</a>',
      '          <a href="/virtual-consultations">Consultations</a>',
      '          <a href="/ecg247">ECG247 monitoring</a>',
      '          <a href="/about-us">About us</a>',
      '        </div>',
      '      </div>',
      '      <div class="tds-foot-col">',
      '        <h2>Get in touch</h2>',
      '        <div class="tds-foot-links">',
      '          <a href="tel:+27780336394">+27 78 033 6394</a>',
      '          <a href="mailto:info@teledoctorsa.co.za">info@teledoctorsa.co.za</a>',
      '          <a href="https://wa.me/27780336394?text=Hello%20TeleDoctorSA" target="_blank" rel="noopener noreferrer">WhatsApp us <span aria-hidden="true">&nearr;</span></a>',
      '          <a href="/contact-us">Contact page</a>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="tds-foot-bottom">',
      '      <span>&copy; ' + new Date().getFullYear() + ' TeleDoctorSA. All rights reserved.</span>',
      '      <div class="tds-foot-legal" aria-label="Policies">',
      '        <a href="/privacy-policy">Privacy</a>',
      '        <a href="/legal-notice">Legal</a>',
      '        <a href="/cookies-policy">Cookies</a>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</footer>'
    ].join('\n');

    var footer = template.content.firstElementChild;
    if (!footer) return;

    var previous = document.querySelector('footer.site-footer, footer.footer, body > footer, footer');
    if (previous) {
      previous.replaceWith(footer);
    } else {
      document.body.appendChild(footer);
    }

    // Old pages sometimes shipped more than one footer. Keep one consistent version.
    document.querySelectorAll('footer:not(#tds-canonical-footer)').forEach(function (item) {
      if (!item.closest('dialog, [role="dialog"]')) item.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooter, { once: true });
  } else {
    renderFooter();
  }
})();