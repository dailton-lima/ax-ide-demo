/* Critérios verificáveis para os Projetos prontos da EVORA. */
(() => {
  'use strict';
  const contextBar = document.querySelector('.editor-contextbar');
  if (!contextBar) return;
  const rules = Object.freeze({
    rover: [['axioma_robot_move', 'Movimento da base'], ['axioma_stop_all', 'Parada segura'], ['axioma_tone', 'Confirmação sonora']],
    giro: [['axioma_motor_speed', 'Dois motores em sentidos opostos', 2], ['axioma_stop_all', 'Parada segura']],
    dancarino: [['axioma_robot_move', 'Movimentos da coreografia', 2], ['axioma_stop_all', 'Parada final'], ['axioma_tone', 'Som de encerramento']],
    guardiao: [['axioma_wait_until', 'Espera pelo toque'], ['axioma_touch', 'Leitura do sensor de toque'], ['axioma_stop_all', 'Parada após o toque']],
    inclinacao: [['axioma_wait_until', 'Espera por inclinação'], ['axioma_imu_tilted', 'Leitura da IMU'], ['axioma_tone', 'Alerta sonoro']],
    sinalizador: [['axioma_servo_angle', 'Três posições do servo', 3]]
  });
  const style = document.createElement('style');
  style.textContent = '.challenge-button{margin-left:6px}.challenge-modal .modal{width:min(620px,100%)}.challenge-intro{margin:0;color:var(--muted);font-size:13px}.challenge-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.challenge-check{display:flex;gap:9px;align-items:center;padding:10px;border:1px solid #fde68a;border-radius:8px;background:#fffbeb;color:#92400e;font-size:13px}.challenge-check:before{content:"○";font-size:17px;font-weight:700}.challenge-check.done{border-color:#a7f3d0;background:#ecfdf5;color:#047857}.challenge-check.done:before{content:"✓"}.challenge-score{color:#2563eb;font-size:12px;font-weight:800}@media(max-width:820px){.challenge-button{display:none}}';
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.className = 'btn secondary challenge-button';
  button.type = 'button';
  button.textContent = 'Desafio';
  button.hidden = true;
  button.setAttribute('aria-haspopup', 'dialog');
  contextBar.appendChild(button);

  const modal = document.createElement('div');
  modal.className = 'backdrop challenge-modal';
  modal.id = 'challengeModal';
  modal.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="challengeTitle"><div class="mhead"><h2 id="challengeTitle">Desafio do projeto</h2><div class="spacer"></div><button class="btn secondary" type="button" data-close-challenge>Fechar</button></div><div class="mbody" data-challenge-body></div></div>';
  document.body.appendChild(modal);
  const close = () => modal.classList.remove('open');
  modal.querySelector('[data-close-challenge]').onclick = close;
  modal.addEventListener('click', event => { if (event.target === modal) close(); });

  const evaluate = () => {
    const context = project()?.challengeContext;
    const checks = rules[context?.id] || [];
    const blocks = workspace?.getAllBlocks(false) || [];
    return { context, checks: checks.map(([type, label, minimum = 1]) => ({ label, done: blocks.filter(block => block.type === type).length >= minimum })) };
  };
  const render = () => {
    const result = evaluate();
    button.hidden = !result.context;
    if (!result.context) return;
    const complete = result.checks.filter(check => check.done).length;
    modal.querySelector('[data-challenge-body]').innerHTML = `<p class="challenge-intro">${result.context.text}</p><p class="challenge-score">${complete}/${result.checks.length} critérios atendidos</p><ul class="challenge-list">${result.checks.map(check => `<li class="challenge-check${check.done ? ' done' : ''}">${check.label}</li>`).join('')}</ul>`;
  };
  button.onclick = () => { render(); modal.classList.add('open'); };
  let observedWorkspace = null;
  const observeWorkspace = () => {
    if (!workspace || workspace === observedWorkspace) return;
    observedWorkspace = workspace;
    workspace.addChangeListener(() => { if (modal.classList.contains('open')) render(); });
  };
  const previousOpenProject = openProject;
  openProject = function (id) { previousOpenProject(id); observeWorkspace(); render(); };
  observeWorkspace();
  window.evoraChallengeCheck = Object.freeze({ evaluate, render });
})();
