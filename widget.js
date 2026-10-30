/* Display-only Jotform widget. No answer access, storage, or submission handler. */
(function () {
  'use strict';
  const root = document.getElementById('help-widget');
  const button = document.getElementById('help-button');
  const panel = document.getElementById('help-panel');
  const status = document.getElementById('help-status');
  let connected = false;
  let lastHeight = -1;
  let frameRequest = 0;

  function resize() {
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(function () {
      panel.dataset.compact = String(root.getBoundingClientRect().width <= 330);
      const height = Math.ceil(root.getBoundingClientRect().height);
      if (connected && height !== lastHeight) {
        lastHeight = height;
        window.JFCustomWidget.requestFrameResize({ height: height });
      }
    });
  }

  function close(returnFocus) {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-describedby');
    if (returnFocus) button.focus({ preventScroll: true });
    resize();
  }

  function configure(text, label) {
    if (typeof text !== 'string' || !text.trim()) {
      button.disabled = true;
      status.textContent = 'Set HelpText in this widget’s Jotform settings.';
      status.hidden = false;
      close(false);
      return;
    }
    // Plain text only. Markup in settings cannot execute or alter the document.
    panel.textContent = text;
    button.setAttribute('aria-label', typeof label === 'string' && label.trim() ? label : 'Open question help');
    status.hidden = true;
    button.disabled = false;
    resize();
  }

  button.addEventListener('click', function () {
    if (button.getAttribute('aria-expanded') === 'true') { close(false); return; }
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-describedby', panel.id);
    resize();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); }
  });
  document.addEventListener('pointerdown', function (event) {
    if (!root.contains(event.target)) close(false);
  });
  window.addEventListener('blur', function () { close(false); });
  window.addEventListener('beforeprint', function () { close(false); });
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(root);
  if (document.fonts) document.fonts.ready.then(resize);

  // A direct browser preview is explicit and never carries applicant answers.
  if (window.self === window.top && new URLSearchParams(location.search).get('preview') === '1') {
    configure('Your ZIP code helps us identify health insurance options available in your area.', 'Help for ZIP Code');
  } else if (window.JFCustomWidget && typeof window.JFCustomWidget.subscribe === 'function') {
    window.JFCustomWidget.subscribe('ready', function () {
      connected = true;
      configure(window.JFCustomWidget.getWidgetSetting('HelpText'), window.JFCustomWidget.getWidgetSetting('HelpLabel'));
    });
  } else {
    status.textContent = 'Jotform connection unavailable. Reload this widget inside Jotform.';
  }
})();
