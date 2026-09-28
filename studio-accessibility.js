/* Acessibilidade compartilhada para modais do EVORA Studio. */
(() => {
  const contrastKey = 'evora-high-contrast';
  const reducedMotionKey = 'evora-reduced-motion';
  const contrastStyle = document.createElement('style');
  contrastStyle.textContent = `
    html.evora-high-contrast{--line:#64748b;--muted:#334155;--graphite:#0f172a}
    html.evora-high-contrast .editor-toolbar,html.evora-high-contrast .editor-workspace-panel,html.evora-high-contrast .axioma-simulator{border-color:#0f172a!important}
    html.evora-high-contrast .blocklyToolboxCategoryContainer.evora-category{border-color:#334155!important;border-left-color:var(--evora-category)!important}
    html.evora-high-contrast .blocklyFlyoutBackground{fill-opacity:1!important;stroke:#0f172a!important;stroke-width:2!important}
    html.evora-high-contrast :focus{outline:3px solid #7c3aed!important;outline-offset:2px!important}
    html.evora-reduced-motion .axsim-motor.axsim-running .shaft{animation:none!important}
    html.evora-reduced-motion *{scroll-behavior:auto!important}
    .home-nav-settings{margin-top:auto;padding-top:14px;border-top:1px solid var(--line)}
    .settings-modal{width:min(520px,100%)}.settings-option{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px;border:1px solid var(--line);border-radius:10px}.settings-option>div{display:grid;gap:3px}.settings-option strong{color:var(--graphite);font-size:14px}.settings-option p{margin:0;color:var(--muted);font-size:12px}
    .nav-icon[data-icon="settings"]:before{content:'⚙';position:static;font-size:15px;line-height:1}
  `;
  document.head.appendChild(contrastStyle);
  const setHighContrast = active => {
    document.documentElement.classList.toggle('evora-high-contrast', active);
    localStorage.setItem(contrastKey, String(active));
    const button = document.querySelector('[data-high-contrast]');
    if (button) { button.setAttribute('aria-pressed', String(active)); button.textContent = active ? 'Alto contraste: ligado' : 'Alto contraste'; }
  };
  const setReducedMotion = active => {
    document.documentElement.classList.toggle('evora-reduced-motion', active);
    localStorage.setItem(reducedMotionKey, String(active));
    const button = document.querySelector('[data-reduced-motion]');
    if (button) { button.setAttribute('aria-pressed', String(active)); button.textContent = active ? 'Reduzir animações: ligado' : 'Reduzir animações'; }
  };
  const setupSettings = () => {
    const nav = document.querySelector('.home-nav');
    if (!nav || document.querySelector('[data-open-settings]')) return;
    const navGroup = document.createElement('div');
    navGroup.className = 'home-nav-settings';
    navGroup.innerHTML = '<button class="home-nav-item" type="button" data-open-settings><span class="nav-icon" data-icon="settings" aria-hidden="true"></span>Configurações</button>';
    nav.appendChild(navGroup);
    const modalNode = document.createElement('div');
    modalNode.className = 'backdrop'; modalNode.id = 'settingsModal';
    modalNode.innerHTML = '<div class="modal settings-modal"><div class="mhead"><h2>Configurações</h2><div class="spacer"></div><button class="btn secondary" data-close="settingsModal">Fechar</button></div><div class="mbody"><section class="settings-option"><div><strong>Alto contraste</strong><p>Reforça bordas, textos e foco para melhorar a leitura.</p></div><button class="btn secondary" type="button" data-high-contrast aria-pressed="false">Alto contraste</button></section><section class="settings-option"><div><strong>Reduzir animações</strong><p>Diminui movimentos contínuos no simulador.</p></div><button class="btn secondary" type="button" data-reduced-motion aria-pressed="false">Reduzir animações</button></section></div></div>';
    document.body.appendChild(modalNode);
    navGroup.querySelector('[data-open-settings]').onclick = () => window.modal?.('settingsModal', true);
    modalNode.querySelector('[data-close]').onclick = () => window.modal?.('settingsModal', false);
    modalNode.querySelector('[data-high-contrast]').onclick = () => setHighContrast(!document.documentElement.classList.contains('evora-high-contrast'));
    modalNode.querySelector('[data-reduced-motion]').onclick = () => setReducedMotion(!document.documentElement.classList.contains('evora-reduced-motion'));
    setHighContrast(localStorage.getItem(contrastKey) === 'true');
    setReducedMotion(localStorage.getItem(reducedMotionKey) === 'true');
  };
  setupSettings();

  const previousModal = window.modal;
  let returnFocus = null;
  const focusable = root => [...root.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(element => !element.closest('.hidden'));
  const activeModal = () => document.querySelector('.backdrop.open');

  window.modal = (id, open) => {
    const backdrop = document.getElementById(id);
    if (!backdrop) return previousModal?.(id, open);
    if (open) {
      returnFocus = document.activeElement;
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      if (!backdrop.getAttribute('aria-label')) backdrop.setAttribute('aria-label', backdrop.querySelector('h2')?.textContent || 'Janela');
      previousModal?.(id, true);
      requestAnimationFrame(() => focusable(backdrop)[0]?.focus());
      return;
    }
    previousModal?.(id, false);
    const focusTarget = returnFocus;
    returnFocus = null;
    if (focusTarget?.isConnected) focusTarget.focus();
  };

  document.addEventListener('keydown', event => {
    const backdrop = activeModal();
    if (!backdrop) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      window.modal(backdrop.id, false);
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusable(backdrop);
    if (!items.length) return;
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.addEventListener('click', event => {
    const backdrop = event.target.classList?.contains('backdrop') ? event.target : null;
    if (backdrop?.classList.contains('open')) window.modal(backdrop.id, false);
  });
})();
