(function () {
  'use strict';

  var form = document.getElementById('appDemoForm');
  var status = document.getElementById('appDemoStatus');
  if (!form || !status) return;

  var button = form.querySelector('button[type="submit"]');
  var actionUrl = form.getAttribute('action') || '/api/leads.php';
  var fallbackWhatsApp = 'https://wa.me/27780336394?text=Hello%20TeleDoctorSA%2C%20I%20would%20like%20to%20book%20an%20app%20demo.';

  function value(name) {
    var field = form.elements.namedItem(name);
    return field && typeof field.value === 'string' ? field.value.trim() : '';
  }

  function showStatus(type, message, showFallback) {
    status.className = 'app-sales-status ' + (type === 'success' ? 'is-success' : 'is-error');
    status.replaceChildren();
    status.appendChild(document.createTextNode(message));
    if (showFallback) {
      var a = document.createElement('a');
      a.href = fallbackWhatsApp;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Request via WhatsApp';
      status.appendChild(a);

      var email = document.createElement('a');
      email.href = 'mailto:info@teledoctorsa.co.za?subject=App%20Demo%20Enquiry';
      email.textContent = 'Email us instead';
      status.appendChild(email);
    }
    status.setAttribute('tabindex', '-1');
    status.focus({ preventScroll: true });
  }

  function tracking() {
    var params = new URLSearchParams(window.location.search);
    var result = {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
      var v = params.get(key);
      if (v) result[key] = v.slice(0, 100);
    });
    return result;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var consent = form.elements.namedItem('consent');
    var payload = {
      name: value('name'),
      email: value('email'),
      phone: value('phone'),
      preferredContact: value('preferredContact'),
      role: value('role'),
      demoType: value('demoType'),
      organization: value('organization'),
      service: 'app-access',
      timeframe: '',
      message: value('message'),
      website: value('website'),
      consent: Boolean(consent && consent.checked),
      leadSource: 'app-demo-page',
      leadIntent: 'guided-demo',
      pageUrl: window.location.href.slice(0, 600),
      pagePath: window.location.pathname,
      referrer: document.referrer.slice(0, 600),
      tracking: tracking()
    };

    var original = button ? button.innerHTML : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'Submitting request...';
    }
    status.className = 'app-sales-status';
    status.textContent = '';

    try {
      var response = await fetch(actionUrl, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      var result = await response.json().catch(function () { return null; });
      if (!response.ok || !result || result.ok !== true) {
        throw new Error(result && result.error ? result.error : 'We could not submit your request right now.');
      }

      form.reset();
      showStatus('success', 'Your demo request was submitted. Reference: ' + (result.leadId || 'received') + '. Our team aims to contact you within one business day.', false);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'app_demo',
          lead_source: 'app-demo-page',
          method: 'website_form'
        });
      }
    } catch (error) {
      showStatus('error', (error && error.message ? error.message : 'Request could not be sent.') + ' You can also reach our team directly:', true);
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = original;
      }
    }
  });

  document.querySelectorAll('a[href="https://demo-patient.teledoctorsa.co.za/"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'select_content', { content_type: 'demo', item_id: 'patient-demo' });
      }
    });
  });
})();