/* Monitor compacto de telemetria para as entradas do hub conectado. */
(() => {
  'use strict';
  const context = document.querySelector('.editor-contextbar');
  if (!context) return;
  const history = new Map();
  const labels = type => TYPES[type]?.label || type;
  const numeric = item => item.type === 'touch' ? (item.value ? 1 : 0) : Number(item.value);
  const keep = (port, value) => {
    const values = history.get(port) || [];
    values.push(value);
    if (values.length > 28) values.shift();
    history.set(port, values);
  };
  const path = values => {
    if (values.length < 2) return '';
    const low = Math.min(...values), high = Math.max(...values), span = high - low || 1;
    return values.map((value, index) => `${index ? 'L' : 'M'}${Math.round(index * 112 / (values.length - 1))},${Math.round(36 - ((value - low) * 30 / span))}`).join(' ');
  };

  const style = document.createElement('style');
  style.textContent = '.live-monitor-button{margin-left:auto}.live-monitor-modal .modal{width:min(760px,100%)}.live-monitor-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.live-monitor-card{display:grid;gap:8px;min-height:116px;padding:12px;border:1px solid #bfdbfe;border-radius:9px;background:linear-gradient(145deg,#eff6ff,#fff)}.live-monitor-card header{display:flex;justify-content:space-between;gap:6px;color:#475569;font-size:11px;font-weight:700}.live-monitor-card strong{color:#1d4ed8;font-size:20px}.live-monitor-card svg{width:100%;height:42px;overflow:visible}.live-monitor-card path{fill:none;stroke:#2563eb;stroke-linecap:round;stroke-linejoin:round;stroke-width:2.5}.live-monitor-empty{margin:0;color:var(--muted);font-size:13px}@media(max-width:620px){.live-monitor-grid{grid-template-columns:1fr 1fr}.live-monitor-button{font-size:0}.live-monitor-button:before{content:"Leituras";font-size:12px}}';
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.className = 'btn secondary live-monitor-button';
  button.type = 'button';
  button.textContent = 'Leituras';
  button.setAttribute('aria-haspopup', 'dialog');
  context.appendChild(button);

  const modal = document.createElement('div');
  modal.className = 'backdrop live-monitor-modal';
  modal.id = 'liveMonitorModal';
  modal.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="liveMonitorTitle"><div class="mhead"><h2 id="liveMonitorTitle">Leituras ao vivo</h2><div class="spacer"></div><button class="btn secondary" type="button" data-close-live-monitor>Fechar</button></div><div class="mbody" data-live-monitor-body></div></div>';
  document.body.appendChild(modal);
  const close = () => modal.classList.remove('open');
  modal.querySelector('[data-close-live-monitor]').onclick = close;
  modal.addEventListener('click', event => { if (event.target === modal) close(); });

  let lastPorts = [];
  const render = () => {
    const body = modal.querySelector('[data-live-monitor-body]');
    const ports = lastPorts.filter(item => item.type !== 'none');
    body.innerHTML = ports.length ? `<div class="live-monitor-grid">${ports.map(item => {
      const value = item.error ? 'Indisponível' : item.type === 'touch' ? (item.value ? 'Pressionado' : 'Solto') : String(item.value);
      const values = history.get(item.port) || [];
      return `<article class="live-monitor-card"><header><span>P${item.port} · ${labels(item.type)}</span><span>${item.error ? 'Erro' : 'Ao vivo'}</span></header><strong>${value}</strong><svg viewBox="0 0 112 42" role="img" aria-label="Histórico recente da porta ${item.port}"><path d="${path(values)}"></path></svg></article>`;
    }).join('')}</div>` : '<p class="live-monitor-empty">Conecte um hub e configure ao menos uma porta para acompanhar as leituras.</p>';
  };
  button.onclick = () => { render(); modal.classList.add('open'); };
  window.addEventListener('evora:live-sensors', event => {
    lastPorts = event.detail.ports;
    lastPorts.filter(item => item.type !== 'none' && !item.error).forEach(item => {
      const value = numeric(item);
      if (Number.isFinite(value)) keep(item.port, value);
    });
    if (modal.classList.contains('open')) render();
  });
  window.evoraLiveMonitor = Object.freeze({ render, history });
})();
