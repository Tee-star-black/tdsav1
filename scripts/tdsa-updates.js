(function () {
  'use strict';
  var root = document.querySelector('[data-tdsa-updates]');
  if (!root || typeof HTMLDialogElement === 'undefined') return;
  var launcher = root.querySelector('[data-updates-launcher]');
  var panel = root.querySelector('dialog');
  var notice = root.querySelector('[data-updates-notice]');
  var dot = root.querySelector('.tdsa-updates-dot');
  // Change this key when the featured announcement changes.
  var noticeKey = 'tdsa-update-ecg247-guide-20261009';
  var seen = false;
  try { seen = sessionStorage.getItem(noticeKey) === 'seen'; } catch (_) {}
  dot.hidden = seen;
  launcher.hidden = false;

  function dismissNotice() {
    notice.hidden = true;
    dot.hidden = true;
    seen = true;
    try { sessionStorage.setItem(noticeKey, 'seen'); } catch (_) {}
  }

  function openUpdates() {
    dismissNotice();
    if (!panel.open) panel.showModal();
    launcher.setAttribute('aria-expanded', 'true');
  }

  launcher.addEventListener('click', openUpdates);
  root.querySelector('[data-updates-view]').addEventListener('click', openUpdates);
  root.querySelector('[data-updates-dismiss]').addEventListener('click', dismissNotice);
  root.querySelector('[data-updates-close]').addEventListener('click', function () { panel.close(); });
  panel.addEventListener('close', function () {
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus({ preventScroll: true });
  });
  panel.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    var controls = panel.querySelectorAll('button, a[href]');
    var first = controls[0];
    var last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  panel.addEventListener('click', function (event) {
    var bounds = panel.getBoundingClientRect();
    if (event.target === panel && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) panel.close();
  });

  // A compact prompt appears once per tab session, without moving focus.
  window.setTimeout(function () {
    if (seen || panel.open || document.hidden || document.querySelector('dialog[open], .modal.active, .tds-mega-panel.active')) return;
    notice.hidden = false;
  }, 8000);
})();
