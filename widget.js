/* Display-only Jotform widget. No answer access, storage, or submission handler. */
(function () {
  'use strict';
  const root = document.getElementById('help-widget');
  const button = document.getElementById('help-button');
  const panel = document.getElementById('help-panel');
  const status = document.getElementById('help-status');
  // First-field proof. Other instances retain their existing layout until verified.
  const stationary = new URLSearchParams(location.search).get('qid') === '75';
  let desiredOpenHeight = 44;
  if (stationary) {
    const layout = document.createElement('style');
    layout.textContent = `
      html, body { overflow: hidden; }
      #help-widget { height: 44px; }
      #help-panel {
        position: fixed;
        top: 48px;
        right: 4px;
        left: auto;
        width: calc(100% - 8px);
        margin: 0;
        max-height: max(0px, calc(100vh - 52px));
        max-height: max(0px, calc(100dvh - 52px));
        overflow: auto;
      }
    `;
    document.head.appendChild(layout);
  }
  let connected = false;
  let lastHeight = -1;
  let frameRequest = 0;

  function resize() {
    cancelAnimationFrame(frameRequest);
    frameRequest = requestAnimationFrame(function () {
      panel.dataset.compact = String(root.getBoundingClientRect().width <= 330);
      let height = Math.ceil(root.getBoundingClientRect().height);
      if (stationary) {
        if (panel.hidden) height = 44;
        else {
          // scrollHeight retains the full text height when the viewport clips it.
          desiredOpenHeight = Math.ceil(panel.scrollHeight) + 52;
          height = Math.max(53, desiredOpenHeight);
        }
      }
      if (connected && height !== lastHeight) {
        lastHeight = height;
        window.JFCustomWidget.requestFrameResize({ height: height });
      }
      if (stationary && !panel.hidden && window.innerHeight > 44) {
        panel.style.visibility = 'visible';
      }
    });
  }

  function close(returnFocus) {
    panel.hidden = true;
    panel.style.visibility = '';
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
    if (stationary) panel.style.visibility = 'hidden';
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-describedby', panel.id);
    resize();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); close(true); }
  });
  document.addEventListener('pointerdown', function (event) {
    if (!button.contains(event.target) && !panel.contains(event.target)) close(false);
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
