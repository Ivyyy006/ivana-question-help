/* Standalone component. No parent-form access, networking, or storage. */
(function () {
  'use strict';
  const registry = JSON.parse(document.getElementById('ivana-help-content').textContent);
  const records = new Map();
  let current = null;
  let sequence = 0;

  function close(returnFocus) {
    if (!current) return;
    const old = current;
    current = null;
    old.panel.hidden = true;
    old.button.setAttribute('aria-expanded', 'false');
    old.button.removeAttribute('aria-describedby');
    if (returnFocus) old.button.focus({ preventScroll: true });
  }

  function place(record) {
    const { button, panel } = record;
    const field = button.closest('.demo-field') || button.parentElement;
    const fieldWidth = field.getBoundingClientRect().width;
    const width = Math.max(1, Math.min(354, fieldWidth, window.innerWidth - 24));
    panel.dataset.compact = String(fieldWidth <= 330);
    panel.style.width = width + 'px';
    panel.style.maxHeight = Math.max(1, window.innerHeight - 24) + 'px';
    const trigger = button.getBoundingClientRect();
    const gap = 8;
    const above = Math.max(0, trigger.top - 12 - gap);
    const below = Math.max(0, window.innerHeight - trigger.bottom - 12 - gap);
    const naturalHeight = panel.getBoundingClientRect().height;
    const useAbove = naturalHeight <= above || (naturalHeight > below && above >= below);
    const available = useAbove ? above : below;
    panel.style.maxHeight = Math.max(1, available) + 'px';
    const actualHeight = panel.getBoundingClientRect().height;
    const x = Math.min(window.innerWidth - width - 12, Math.max(12, trigger.right - width));
    const y = useAbove ? trigger.top - gap - actualHeight : trigger.bottom + gap;
    panel.style.left = x + 'px';
    panel.style.top = Math.max(12, y) + 'px';
    panel.dataset.placement = useAbove ? 'above' : 'below';
  }

  function open(record) {
    if (current === record) { close(false); return; }
    close(false);
    current = record;
    record.panel.hidden = false;
    record.button.setAttribute('aria-expanded', 'true');
    record.button.setAttribute('aria-describedby', record.panel.id);
    place(record);
  }

  document.querySelectorAll('[data-ivana-help]').forEach(button => {
    const key = button.dataset.ivanaHelp;
    if (typeof registry[key] !== 'string') return;
    const panel = document.createElement('div');
    panel.id = 'ivana-help-panel-' + (++sequence);
    panel.className = 'ivana-tooltip-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', button.getAttribute('aria-label'));
    panel.hidden = true;
    panel.textContent = registry[key];
    document.body.appendChild(panel);
    button.setAttribute('aria-controls', panel.id);
    button.setAttribute('aria-expanded', 'false');
    const record = { button, panel };
    records.set(button, record);
    button.addEventListener('click', () => open(record));
  });

  document.addEventListener('pointerdown', event => {
    if (current && !current.button.contains(event.target) && !current.panel.contains(event.target)) close(false);
  });
  document.addEventListener('focusin', event => {
    if (current && !current.button.contains(event.target) && !current.panel.contains(event.target)) close(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && current) { event.preventDefault(); close(true); }
  });
  window.addEventListener('resize', () => { if (current) place(current); });
  document.addEventListener('scroll', () => { if (current) place(current); }, true);
  window.addEventListener('beforeprint', () => close(false));
  document.fonts.ready.then(() => { if (current) place(current); });
})();
