/* Dois níveis de blocos: início simples e recursos completos quando necessários. */
(() => {
  'use strict';
  const storageKey = 'axioma-studio-block-level-v1';
  const sourceToolbox = document.getElementById('toolbox');
  const basicBlocks = {
    'Programa': ['axioma_start', 'axioma_forever'],
    'Motores': ['axioma_motor_speed', 'axioma_motor_stop', 'axioma_stop_all', 'axioma_servo_angle', 'axioma_encoder_reset'],
    'Movimento': ['axioma_robot_move', 'axioma_robot_turn', 'axioma_robot_stop'],
    'Sensores': ['axioma_touch', 'axioma_line_value', 'axioma_light_value', 'axioma_pot_value', 'axioma_battery_level', 'axioma_button_pressed', 'axioma_encoder_position'],
    'Ações': ['axioma_wait', 'axioma_wait_seconds', 'axioma_tone', 'axioma_play_wav', 'axioma_show_image', 'axioma_clear_display'],
    'Controle': ['controls_if', 'controls_repeat_ext', 'axioma_wait_until', 'axioma_wait_button'],
    'Lógica': ['logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean'],
    'Matemática': ['math_number', 'math_arithmetic', 'math_constrain', 'math_random_int'],
    'Texto': ['text', 'text_join', 'text_print']
  };
  const alwaysVisible = new Set(['Programa', 'Motores', 'Movimento', 'Sensores', 'Ações', 'Controle', 'Variáveis', 'Lógica', 'Matemática', 'Texto']);
  let level = localStorage.getItem(storageKey) === 'advanced' ? 'advanced' : 'basic';

  const modeControl = document.createElement('div');
  modeControl.className = 'block-level';
  modeControl.innerHTML = '<span>Blocos</span><button type="button" data-level="basic">Básico</button><button type="button" data-level="advanced">Avançado</button>';
  document.querySelector('.worktop').insertBefore(modeControl, document.getElementById('tags'));
  const style = document.createElement('style');
  style.textContent = `
    .block-level{align-items:center;display:flex;gap:2px;margin-left:12px;background:#f2f4f7;border:1px solid var(--line);border-radius:7px;padding:3px}.block-level span{color:var(--muted);font-size:11px;margin:0 4px}.block-level button{background:transparent;border:0;border-radius:5px;color:#667085;font-size:12px;font-weight:700;padding:4px 7px}.block-level button.active{background:#fff;color:#1d2939;box-shadow:0 1px 2px #1018281a}@media(max-width:680px){.block-level span{display:none}.block-level{margin-left:auto}.tags{display:none}}
  `;
  document.head.appendChild(style);

  const currentCategory = (root, name) => [...root.querySelectorAll(':scope > category')].find(node => node.getAttribute('name') === name);
  const filteredToolbox = () => {
    const clone = sourceToolbox.cloneNode(true);
    if (level === 'advanced') return clone;
    [...clone.querySelectorAll(':scope > category')].forEach(category => {
      const name = category.getAttribute('name');
      if (!alwaysVisible.has(name)) { category.remove(); return; }
      const allowed = basicBlocks[name];
      if (!allowed) return;
      [...category.querySelectorAll(':scope > block')].forEach(block => { if (!allowed.includes(block.getAttribute('type'))) block.remove(); });
      [...category.querySelectorAll(':scope > sep')].forEach(separator => separator.remove());
    });
    return clone;
  };
  const applyLevel = () => {
    workspace.updateToolbox(filteredToolbox());
    modeControl.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.dataset.level === level));
    document.getElementById('status').textContent = level === 'basic' ? 'Modo básico: blocos essenciais' : 'Modo avançado: todos os blocos';
    window.dispatchEvent(new CustomEvent('evora:block-level', { detail: { level } }));
  };

  // Permite que extensões visuais do editor reconstruam o toolbox atual.
  window.evoraRefreshToolbox = applyLevel;
  modeControl.querySelectorAll('button').forEach(button => button.onclick = () => {
    level = button.dataset.level; localStorage.setItem(storageKey, level); applyLevel();
  });
  applyLevel();

  /* Atualizações de sensores e troca de abas recriam a caixa de ferramentas. */
  const openProjectWithLearningMode = openProject;
  openProject = function (id) { openProjectWithLearningMode(id); applyLevel(); };
  document.getElementById('savePorts').addEventListener('click', () => setTimeout(applyLevel, 0));
})();
