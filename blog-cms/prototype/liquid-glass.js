/* Pointer-reactive light position for transient Liquid Glass controls.
   One delegated listener keeps dynamic editorial content compatible. */
(() => {
  'use strict';
  const controls = [
    '.side-nav .nav-item',
    '.topbar .menu',
    '.sidebar-signout',
    '.topbar-signout',
    '.content .primary',
    '.content .secondary',
    '.content .ghost',
    '#loginSubmit'
  ].join(',');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (reducedMotion?.matches) return;

  function illuminate(event) {
    if (event.type === 'pointermove' && event.pointerType === 'touch') return;
    const element = event.target?.closest?.(controls);
    if (!element || element.disabled) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
    element.style.setProperty('--lg-x', x.toFixed(1) + '%');
    element.style.setProperty('--lg-y', y.toFixed(1) + '%');
  }

  if ('PointerEvent' in window) {
    document.addEventListener('pointermove', illuminate, {passive:true});
    document.addEventListener('pointerdown', illuminate, {passive:true});
  } else {
    document.addEventListener('mousemove', illuminate, {passive:true});
    document.addEventListener('mousedown', illuminate, {passive:true});
  }
})();
