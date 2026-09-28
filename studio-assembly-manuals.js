/* Estrutura de manuais visuais para os Projetos prontos. */
(() => {
  'use strict';
  const projects = window.EVORA_PROJECT_EXAMPLES || [];
  const manuals = new Map(projects.map(project => [project.id, {
    projectId: project.id,
    status: 'planned',
    version: 1,
    cover: null,
    parts: [],
    steps: []
  }]));

  const style = document.createElement('style');
  style.textContent = '.assembly-modal .modal{width:min(760px,100%)}.assembly-state{display:grid;grid-template-columns:180px 1fr;gap:20px;align-items:stretch}.assembly-preview{display:grid;place-items:center;min-height:180px;border:1px dashed #93c5fd;border-radius:10px;background:linear-gradient(145deg,#eff6ff,#f8fafc);color:#2563eb;text-align:center;font-size:12px;font-weight:700}.assembly-preview span{display:grid;gap:7px;max-width:125px}.assembly-preview i{width:36px;height:36px;margin:auto;border:2px solid currentColor;border-radius:7px;position:relative}.assembly-preview i:after{content:"";position:absolute;left:8px;right:8px;top:16px;border-top:2px solid currentColor}.assembly-copy{display:grid;align-content:center;gap:10px}.assembly-copy h3{margin:0;font-size:18px}.assembly-copy p{margin:0;color:var(--muted);font-size:13px}.assembly-ready-list{display:grid;gap:7px;margin:3px 0 0;padding:0;list-style:none}.assembly-ready-list li{display:flex;gap:8px;align-items:center;color:#475569;font-size:12px}.assembly-ready-list li:before{content:"";width:7px;height:7px;border-radius:50%;background:#93c5fd}.robot-actions{display:flex;gap:8px;margin-top:auto}.robot-actions .btn{flex:1}.robot-actions .btn.secondary{background:#fff}@media(max-width:600px){.assembly-state{grid-template-columns:1fr}.assembly-preview{min-height:132px}}';
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.className = 'backdrop assembly-modal';
  modal.id = 'assemblyManualModal';
  modal.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="assemblyManualTitle"><div class="mhead"><h2 id="assemblyManualTitle">Manual de montagem</h2><div class="spacer"></div><button class="btn secondary" type="button" data-close-assembly>Fechar</button></div><div class="mbody" data-assembly-body></div></div>';
  document.body.appendChild(modal);
  const close = () => modal.classList.remove('open');
  modal.querySelector('[data-close-assembly]').onclick = close;
  modal.addEventListener('click', event => { if (event.target === modal) close(); });

  const valid = manual => manual?.status === 'ready' && manual.cover && manual.parts.length && manual.steps.length && manual.steps.every(step => step.image && step.text);
  const open = id => {
    const project = projects.find(item => item.id === id);
    const manual = manuals.get(id);
    if (!project || !manual) return;
    const body = modal.querySelector('[data-assembly-body]');
    if (!valid(manual)) {
      body.innerHTML = `<section class="assembly-state"><div class="assembly-preview" aria-hidden="true"><span><i></i>Imagens da montagem serão adicionadas aqui.</span></div><div class="assembly-copy"><h3>${project.title}</h3><p>O espaço do manual está preparado, mas esta montagem ainda não foi publicada.</p><ul class="assembly-ready-list"><li>Capa do robô</li><li>Lista de peças</li><li>Passos ilustrados</li></ul></div></section>`;
    } else {
      body.innerHTML = `<img class="assembly-cover" src="${manual.cover}" alt="${project.title} montado"><section><h3>Peças</h3><ul>${manual.parts.map(part => `<li>${part}</li>`).join('')}</ul></section><ol class="assembly-steps">${manual.steps.map(step => `<li><img src="${step.image}" alt=""><p>${step.text}</p></li>`).join('')}</ol>`;
    }
    modal.classList.add('open');
  };

  window.EVORA_ASSEMBLY_MANUALS = manuals;
  window.evoraOpenAssemblyManual = open;
})();
