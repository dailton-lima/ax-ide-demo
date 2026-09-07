/* Leituras de entrada no hub conectado, sem gravar nem executar projeto. */
(() => {
  'use strict';
  const panel = document.getElementById('sensorLive');
  const style = document.createElement('style');
  style.textContent = `.sensor-live{align-items:center;color:var(--muted);display:flex;flex-wrap:wrap;font-size:12px;gap:6px;margin-top:7px;min-height:18px}.sensor-live b{color:#344054}.sensor-live .live-value{background:#f2f4f7;border-radius:999px;color:#344054;padding:3px 7px}.sensor-live .live-value.error{background:#fef3f2;color:#b42318}`;
  document.head.appendChild(style);
  let polling = false;
  const configured = () => window.axPortConfigForBlock ? window.axPortConfigForBlock(null) : project()?.config || [];
  const label = type => TYPES[type]?.label || type;
  const clear = () => { panel.textContent = ''; };
  async function refresh() {
    if (polling || !activeId || !dot.classList.contains('ok')) { if (!dot.classList.contains('ok')) clear(); return; }
    const ports = configured();
    if (!ports.some(type => type !== 'none')) { clear(); return; }
    polling = true;
    try {
      const response = await req('/api/sensors?ports=' + ports.join(','));
      const data = await response.json();
      panel.innerHTML = '<b>Leituras do hub conectado:</b>' + (data.ports || []).filter(item => item.type !== 'none').map(item => {
        const value = item.error ? 'indisponível' : item.type === 'touch' ? (item.value ? 'pressionado' : 'solto') : String(item.value);
        return `<span class="live-value${item.error ? ' error' : ''}">P${item.port} · ${label(item.type)}: ${value}</span>`;
      }).join('');
    } catch (_) {
      // A conexão principal já é exibida pelo indicador superior; não poluir a
      // área de programação a cada tentativa falha.
    } finally { polling = false; }
  }
  const previousOpen = openProject;
  openProject = function (id) { previousOpen(id); setTimeout(refresh, 0); };
  setInterval(refresh, 400);
})();
