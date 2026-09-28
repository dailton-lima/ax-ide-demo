/* Ajuste de largura entre o simulador e o workspace, persistido por navegador. */
(() => {
  const key = 'evora-editor-simulator-width';
  const start = () => {
    const editor = document.querySelector('#programming .editor');
    const simulator = editor?.querySelector('.axioma-simulator');
    if (!editor || !simulator || editor.querySelector('.editor-splitter')) return;

    const defaultWidth = () => Math.round(Math.max(300, Math.min(390, (editor.clientWidth || 1440) * .27)));
    const saved = Number(localStorage.getItem(key));
    if (Number.isFinite(saved) && saved >= 300 && saved <= 520) editor.style.setProperty('--evora-simulator-width', `${saved}px`);
    const splitter = document.createElement('div');
    splitter.className = 'editor-splitter';
    splitter.tabIndex = 0;
    splitter.setAttribute('role', 'separator');
    splitter.setAttribute('aria-label', 'Ajustar largura do simulador');
    splitter.title = 'Arraste para ajustar. Clique duas vezes para restaurar.';
    splitter.setAttribute('aria-orientation', 'vertical');
    splitter.setAttribute('aria-valuemin', '300');
    splitter.setAttribute('aria-valuemax', '520');
    editor.appendChild(splitter);

    const apply = width => {
      const available = editor.clientWidth || 960;
      const next = Math.round(Math.max(300, Math.min(Math.min(520, available - 560), width)));
      editor.style.setProperty('--evora-simulator-width', `${next}px`);
      splitter.setAttribute('aria-valuenow', String(next));
      splitter.setAttribute('aria-valuetext', `${next} pixels`);
      localStorage.setItem(key, String(next));
      const workspace = Blockly.getMainWorkspace?.();
      if (workspace) Blockly.svgResize(workspace);
    };
    const current = () => Math.round(simulator.getBoundingClientRect().width);
    apply(current());
    splitter.addEventListener('pointerdown', event => {
      event.preventDefault(); splitter.setPointerCapture(event.pointerId); splitter.classList.add('dragging');
      const origin = event.clientX, width = current();
      const move = moveEvent => apply(width + moveEvent.clientX - origin);
      const end = () => { splitter.classList.remove('dragging'); splitter.removeEventListener('pointermove', move); splitter.removeEventListener('pointerup', end); splitter.removeEventListener('pointercancel', end); };
      splitter.addEventListener('pointermove', move); splitter.addEventListener('pointerup', end); splitter.addEventListener('pointercancel', end);
    });
    splitter.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const width = event.key === 'Home' ? 300 : event.key === 'End' ? 520 : current() + (event.key === 'ArrowLeft' ? -20 : 20);
      apply(width);
    });
    splitter.addEventListener('dblclick', () => {
      localStorage.removeItem(key);
      apply(defaultWidth());
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
