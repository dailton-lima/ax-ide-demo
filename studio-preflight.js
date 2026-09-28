/* Revisão didática do projeto antes de simular, baixar ou enviar. */
(() => {
  'use strict';
  const actions = document.querySelector('.editor-bottom-actions');
  if (!actions) return;

  const style = document.createElement('style');
  style.textContent = '.preflight-modal .modal{width:min(560px,100%)}.preflight-list{display:grid;gap:9px;margin:0;padding:0;list-style:none}.preflight-item{border:1px solid #dbe5f1;border-radius:8px;padding:11px 12px;color:#334155;font-size:13px}.preflight-item.error{border-color:#fecaca;background:#fff7f7;color:#b42318}.preflight-item.warning{border-color:#fde68a;background:#fffbeb;color:#92400e}.preflight-item.ok{border-color:#a7f3d0;background:#ecfdf5;color:#047857}.preflight-summary{margin:0;color:var(--muted);font-size:13px}';
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.className = 'btn secondary';
  button.type = 'button';
  button.textContent = 'Revisar projeto';
  button.setAttribute('aria-haspopup', 'dialog');
  actions.insertBefore(button, actions.querySelector('#download'));

  const dialog = document.createElement('div');
  dialog.className = 'backdrop preflight-modal';
  dialog.id = 'preflightModal';
  dialog.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="preflightTitle"><div class="mhead"><h2 id="preflightTitle">Revisar projeto</h2><div class="spacer"></div><button class="btn secondary" type="button" data-close-preflight>Fechar</button></div><div class="mbody"><p class="preflight-summary" data-preflight-summary></p><ul class="preflight-list" data-preflight-list></ul></div></div>';
  document.body.appendChild(dialog);
  const close = () => dialog.classList.remove('open');
  dialog.querySelector('[data-close-preflight]').onclick = close;
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });

  function review() {
    const errors = [], warnings = [];
    if (!workspace) return { errors: ['Abra ou crie um projeto para revisar.'], warnings };
    const roots = workspace.getTopBlocks(true);
    const starts = roots.filter(block => block.type === 'axioma_start');
    if (starts.length !== 1) errors.push(starts.length ? 'Mantenha apenas um bloco Início.' : 'Adicione um bloco Início ao projeto.');
    const issue = validate();
    if (issue) errors.push(issue);
    if (starts.length === 1 && !starts[0].getInputTargetBlock('STACK')) warnings.push('O bloco Início ainda não contém nenhuma ação.');
    const forever = roots.filter(block => block.type === 'axioma_forever');
    if (forever.some(block => !block.getInputTargetBlock('DO'))) warnings.push('Há um bloco Sempre sem ações internas.');
    if (!roots.some(block => !['axioma_start', 'axioma_forever'].includes(block.type))) warnings.push('Adicione uma ação para que o projeto produza um resultado observável.');
    return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
  }

  function open() {
    const result = review();
    const messages = [
      ...result.errors.map(text => ['error', text]),
      ...result.warnings.map(text => ['warning', text]),
      ...(!result.errors.length && !result.warnings.length ? [['ok', 'Tudo certo para simular ou enviar este projeto.']] : [])
    ];
    dialog.querySelector('[data-preflight-summary]').textContent = result.errors.length
      ? 'Corrija os itens em vermelho antes de enviar ao hub.'
      : result.warnings.length ? 'O projeto pode ser executado, mas vale revisar estes pontos.' : 'O projeto está pronto para a próxima etapa.';
    dialog.querySelector('[data-preflight-list]').innerHTML = messages.map(([kind, text]) => `<li class="preflight-item ${kind}">${text}</li>`).join('');
    dialog.classList.add('open');
  }

  button.onclick = open;
  window.axPreflight = Object.freeze({ review, open });
})();
