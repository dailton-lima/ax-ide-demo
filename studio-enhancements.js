/* Camada de experiência do Axioma Studio: projetos, mídia e simulador local. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, properties = {}) => Object.assign(document.createElement(tag), properties);
  const modalHost = document.body;
  const projectAssets = new Map();
  let lastProjectId = null;

  const saveNow = () => {
    const previous = axAllowProjectSave;
    axAllowProjectSave = true;
    persist();
    axAllowProjectSave = previous;
  };
  const markDirty = () => axSetDirty(activeId);
  const notify = message => { const node = $('#status'); if (node) node.textContent = message; };
  const safeAssetMaps = () => ({ audio: new Map(audio), images: new Map(images) });
  const rememberAssets = id => { if (id) projectAssets.set(id, safeAssetMaps()); };
  const restoreAssets = id => {
    const stored = projectAssets.get(id) || { audio: new Map(), images: new Map() };
    audio.clear(); images.clear();
    stored.audio.forEach((data, name) => audio.set(name, data));
    stored.images.forEach((data, name) => images.set(name, data));
    assetsRender();
  };

  const style = make('style');
  style.textContent = `
    .files-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
    .file{position:relative}.file-actions{display:flex;gap:6px;margin-top:auto}.file-actions button{background:none;border:0;color:#475467;font-size:12px;padding:0}.file-actions button:hover{color:var(--blue)}
    .feature-modal .modal{width:min(980px,100%)}.feature-modal .mbody{max-height:72vh;overflow:auto}.feature-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.feature-card{border:1px solid var(--line);border-radius:9px;padding:14px;text-align:left;background:#fff}.feature-card h3{font-size:15px;margin:0 0 5px}.feature-card p{font-size:12px;color:var(--muted);margin:0 0 12px}.feature-card .btn{padding:6px 8px}
    .media-library{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}.media-card{border:1px solid var(--line);border-radius:8px;padding:10px;display:grid;gap:8px}.media-card b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.media-card img{width:100%;aspect-ratio:1;object-fit:contain;background:#101828;border-radius:6px}.media-card audio{max-width:100%}.media-card .btn{justify-self:start;padding:5px 7px}
    .sim-layout{display:grid;grid-template-columns:minmax(270px,1fr) minmax(300px,1fr);gap:18px}.sim-robot{min-height:330px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(145deg,#eef4ff,#fff);display:grid;place-items:center;position:relative;overflow:hidden}.robot-body{height:160px;width:190px;border:7px solid #344054;border-radius:40px;background:#fff;box-shadow:0 12px 25px #10182822;display:grid;place-items:center;position:relative}.robot-screen{width:78px;height:78px;border-radius:8px;background:#0f172a;color:#d1fae5;display:grid;place-items:center;font-size:11px;text-align:center;padding:5px}.wheel{position:absolute;height:58px;width:24px;border-radius:12px;background:#1d2939;top:44px}.wheel.left{left:-25px}.wheel.right{right:-25px}.wheel.active{background:#2563eb;box-shadow:0 0 0 5px #bfdbfe}.motor-label{position:absolute;font-size:11px;font-weight:800;color:#fff;top:22px}.wheel.left .motor-label{left:5px}.wheel.right .motor-label{right:5px}.sim-controls{display:grid;gap:11px}.sim-controls label{font-size:12px;color:var(--muted);display:grid;gap:4px}.sim-controls input{width:100%}.sim-console{min-height:220px;max-height:300px;overflow:auto;background:#101828;color:#d1fae5;border-radius:8px;padding:11px;font:12px/1.5 ui-monospace,Consolas,monospace;white-space:pre-wrap}.sim-error{color:#b42318;background:#fef3f2;border-radius:6px;padding:9px;font-size:12px}.challenge-progress{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}.challenge-chip{border-radius:999px;background:#f2f4f7;padding:4px 8px;font-size:12px}.challenge-chip.done{background:#dcfae6;color:#067647}
    @media(max-width:760px){.sim-layout{grid-template-columns:1fr}.feature-modal .mhead{position:sticky;top:0;background:#fff;z-index:1}}
  `;
  document.head.appendChild(style);

  const createModal = (id, title) => {
    const shell = make('div', { className: 'backdrop feature-modal', id });
    shell.innerHTML = `<div class="modal"><div class="mhead"><h2>${title}</h2><div class="spacer"></div><button class="btn secondary" type="button">Fechar</button></div><div class="mbody"></div></div>`;
    $('.mhead button', shell).onclick = () => shell.classList.remove('open');
    modalHost.appendChild(shell); return shell;
  };
  const openModal = modal => modal.classList.add('open');

  /* Projetos e exemplos */
  const libraryModal = createModal('libraryModal', 'Projetos e desafios');
  const libraryBody = $('.mbody', libraryModal);
  const examples = [
    { id: 'ola', title: 'Primeiros passos', text: 'Exibe uma ação simples e toca um som.', challenge: 'Faça o robô tocar um som diferente.', build: () => [{ type: 'axioma_tone', fields: { FREQ: 660, DURATION: 250 } }] },
    { id: 'andar', title: 'Robô em movimento', text: 'Move dois motores e para com freio.', challenge: 'Faça o robô andar para trás por dois segundos.', build: () => [{ type: 'axioma_motor_stop_mode', fields: { PORT: '1', BRAKE: 'True' } }, { type: 'axioma_robot_move', fields: { LEFT: '1', RIGHT: '2', SPEED: 60 } }, { type: 'axioma_wait_seconds', fields: { SECONDS: 1 } }, { type: 'axioma_stop_all' }] },
    { id: 'toque', title: 'Reação ao toque', text: 'Configura P1 como toque e aguarda o botão.', challenge: 'Faça um som quando o sensor for pressionado.', config: ['touch', 'none', 'none', 'none', 'none', 'none'], build: () => [{ type: 'axioma_wait_until', value: { COND: { type: 'axioma_touch', fields: { PORT: '1' } } } }, { type: 'axioma_tone', fields: { FREQ: 880, DURATION: 180 } }] },
    { id: 'linha', title: 'Leitura de linha', text: 'Declara P1 como sensor de linha para explorar o valor.', challenge: 'Use “se” para reagir a uma leitura baixa.', config: ['line', 'none', 'none', 'none', 'none', 'none'], build: () => [] }
  ];
  const completed = () => { try { return new Set(JSON.parse(localStorage.getItem('axioma-studio-challenges-v1') || '[]')); } catch { return new Set(); } };
  const markCompleted = id => { const set = completed(); set.add(id); localStorage.setItem('axioma-studio-challenges-v1', JSON.stringify([...set])); };
  const connectStatement = (parent, child) => { parent.getInput('STACK').connection.connect(child.previousConnection); return child; };
  const appendBlock = (previous, type, fields = {}, value = null) => {
    const block = workspace.newBlock(type);
    Object.entries(fields).forEach(([name, value]) => block.getField(name)?.setValue(String(value)));
    if (value) {
      const child = workspace.newBlock(value.type);
      Object.entries(value.fields || {}).forEach(([name, item]) => child.getField(name)?.setValue(String(item)));
      child.initSvg(); child.render();
      block.getInput(value.name || 'COND')?.connection.connect(child.outputConnection);
    }
    block.initSvg(); block.render();
    if (previous.nextConnection) previous.nextConnection.connect(block.previousConnection);
    return block;
  };
  const installExample = example => {
    if (activeId) rememberAssets(activeId);
    const item = fresh(example.title.toLowerCase().replace(/[^a-zà-ÿ0-9]+/gi, '-'));
    item.config = example.config ? [...example.config] : Array(6).fill('none');
    projects.push(item); saveNow();
    openProject(item.id);
    workspace.clear();
    const start = workspace.newBlock('axioma_start'); start.initSvg(); start.render(); start.moveBy(48, 42);
    let previous = start;
    example.build().forEach(definition => {
      const block = workspace.newBlock(definition.type);
      Object.entries(definition.fields || {}).forEach(([name, value]) => block.getField(name)?.setValue(String(value)));
      if (definition.value) {
        const valueBlock = workspace.newBlock(definition.value.type);
        Object.entries(definition.value.fields || {}).forEach(([name, value]) => valueBlock.getField(name)?.setValue(String(value)));
        valueBlock.initSvg(); valueBlock.render();
        block.getInput(definition.value.name || 'COND')?.connection.connect(valueBlock.outputConnection);
      }
      block.initSvg(); block.render();
      if (previous === start) connectStatement(start, block); else previous.nextConnection.connect(block.previousConnection);
      previous = block;
    });
    project().workspace = Blockly.serialization.workspaces.save(workspace);
    tagsRender(); axRefreshSensorToolbox?.(); generate(); markDirty(); markCompleted(example.id); renderLibrary();
  };
  const renderLibrary = () => {
    const done = completed();
    libraryBody.innerHTML = `<p class="notice">Use estes projetos como ponto de partida. Eles abrem como um novo programa editável e não substituem seu trabalho atual.</p><div class="challenge-progress">${examples.map(item => `<span class="challenge-chip ${done.has(item.id) ? 'done' : ''}">${done.has(item.id) ? '✓ ' : ''}${item.title}</span>`).join('')}</div><div class="feature-grid">${examples.map(item => `<article class="feature-card"><h3>${item.title}</h3><p>${item.text}</p><p><b>Desafio:</b> ${item.challenge}</p><button class="btn primary" data-example="${item.id}">Abrir exemplo</button></article>`).join('')}</div>`;
    $$('[data-example]', libraryBody).forEach(button => button.onclick = () => installExample(examples.find(item => item.id === button.dataset.example)));
  };
  renderLibrary();

  const addFilesActions = () => {
    const head = $('.files-head .files-head-actions') || make('div', { className: 'files-head-actions' });
    if (!head.parentElement) $('.files-head').appendChild(head);
    head.innerHTML = '<button class="btn secondary" id="openLibrary">Exemplos e desafios</button><button class="btn secondary" id="importProject">Importar projeto</button><input id="importProjectFile" type="file" accept="application/json,.axioma.json" hidden>';
    $('#openLibrary').onclick = () => openModal(libraryModal);
    $('#importProject').onclick = () => $('#importProjectFile').click();
    $('#importProjectFile').onchange = async event => {
      const file = event.target.files[0]; if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        if (!payload.project || !Array.isArray(payload.project.config)) throw Error('arquivo de projeto inválido');
        const imported = { ...payload.project, id: uid(), name: clean(payload.project.name || 'projeto-importado'), updatedAt: Date.now() };
        projects.push(imported); saveNow();
        if (payload.assets) {
          const decode = item => Uint8Array.from(atob(item), char => char.charCodeAt(0));
          projectAssets.set(imported.id, { audio: new Map((payload.assets.audio || []).map(([name, data]) => [name, decode(data)])), images: new Map((payload.assets.images || []).map(([name, data]) => [name, decode(data)])) });
        }
        renderFiles(); notify('Projeto importado.');
      } catch (error) { alert('Não foi possível importar: ' + error.message); }
      event.target.value = '';
    };
  };
  const encodeBytes = data => {
    let text = ''; const bytes = new Uint8Array(data);
    for (let index = 0; index < bytes.length; index += 0x8000) text += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return btoa(text);
  };
  const exportProject = async item => {
    rememberAssets(activeId); const stored = projectAssets.get(item.id) || { audio: new Map(), images: new Map() };
    const payload = { version: 1, project: item, assets: { audio: [...stored.audio].map(([name, data]) => [name, encodeBytes(data)]), images: [...stored.images].map(([name, data]) => [name, encodeBytes(data)]) } };
    const link = make('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(payload)], { type: 'application/json' })); link.download = asset(item.name) + '.axioma.json'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 0);
  };
  const duplicateProject = item => {
    const copy = JSON.parse(JSON.stringify(item)); copy.id = uid(); copy.name = clean(item.name + ' cópia'); copy.updatedAt = Date.now(); projects.push(copy);
    const stored = projectAssets.get(item.id); if (stored) projectAssets.set(copy.id, { audio: new Map(stored.audio), images: new Map(stored.images) });
    saveNow(); renderFiles(); notify('Cópia criada.');
  };
  const originalRenderFiles = renderFiles;
  renderFiles = function () {
    originalRenderFiles(); addFilesActions();
    $$('[data-file]', fileGrid).forEach(card => {
      const item = projects.find(project => project.id === card.dataset.file); if (!item) return;
      const actions = make('div', { className: 'file-actions' });
      const rename = make('button', { type: 'button', textContent: 'Renomear' });
      rename.onclick = event => { event.stopPropagation(); const name = prompt('Novo nome do programa:', item.name); if (!name) return; item.name = clean(name); item.updatedAt = Date.now(); saveNow(); renderFiles(); };
      const duplicate = make('button', { type: 'button', textContent: 'Duplicar' }); duplicate.onclick = event => { event.stopPropagation(); duplicateProject(item); };
      const exportButton = make('button', { type: 'button', textContent: 'Exportar' }); exportButton.onclick = event => { event.stopPropagation(); exportProject(item); };
      actions.append(rename, duplicate, exportButton); card.appendChild(actions);
    });
  };
  renderFiles();

  /* Biblioteca de mídia */
  const mediaModal = createModal('mediaModal', 'Biblioteca de mídia');
  const mediaBody = $('.mbody', mediaModal);
  const rgb565Preview = bytes => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 240;
    const ctx = canvas.getContext('2d'); const image = ctx.createImageData(240, 240);
    for (let pixel = 0, offset = 0; pixel < 240 * 240; pixel++, offset += 2) {
      const value = (bytes[offset] << 8) | bytes[offset + 1]; const target = pixel * 4;
      image.data[target] = ((value >> 11) & 31) * 255 / 31; image.data[target + 1] = ((value >> 5) & 63) * 255 / 63; image.data[target + 2] = (value & 31) * 255 / 31; image.data[target + 3] = 255;
    }
    ctx.putImageData(image, 0, 0); return canvas.toDataURL('image/png');
  };
  const renderMedia = () => {
    mediaBody.innerHTML = '<p class="notice">Os arquivos abaixo pertencem ao programa aberto. Áudio é convertido para WAV PCM 16 kHz antes do envio e imagens são convertidas para RGB565 240 × 240.</p><div class="media-library" id="mediaLibraryList"></div>';
    const list = $('#mediaLibraryList', mediaBody);
    const add = (name, kind, data) => {
      const card = make('article', { className: 'media-card' }); card.appendChild(make('b', { textContent: name + (kind === 'audio' ? '.wav' : '.rgb565') }));
      if (kind === 'audio') { const player = make('audio', { controls: true }); player.src = URL.createObjectURL(new Blob([data], { type: 'audio/wav' })); card.appendChild(player); }
      else card.appendChild(make('img', { src: rgb565Preview(data), alt: name }));
      const remove = make('button', { className: 'btn danger', textContent: 'Remover', type: 'button' });
      remove.onclick = () => { (kind === 'audio' ? audio : images).delete(name); rememberAssets(activeId); assetsRender(); markDirty(); renderMedia(); };
      card.appendChild(remove); list.appendChild(card);
    };
    audio.forEach((data, name) => add(name, 'audio', data)); images.forEach((data, name) => add(name, 'image', data));
    if (!list.children.length) list.textContent = 'Nenhuma mídia adicionada a este programa.';
  };
  const mediaButton = make('button', { className: 'btn secondary', id: 'mediaLibraryButton', textContent: 'Mídia' });
  $('#portsBtn').before(mediaButton); mediaButton.onclick = () => { renderMedia(); openModal(mediaModal); };
  $('#audioFiles').addEventListener('change', () => setTimeout(() => { rememberAssets(activeId); markDirty(); }, 0));
  $('#imageFiles').addEventListener('change', () => setTimeout(() => { rememberAssets(activeId); markDirty(); }, 0));

  /* Simulador removido da plataforma: mantido inativo até uma decisão futura. */
  if (false) {
  /* Simulador visual determinístico */
  const simulatorModal = createModal('simulatorModal', 'Simulador do Axioma Block');
  const simulatorBody = $('.mbody', simulatorModal);
  simulatorBody.innerHTML = `<div class="sim-layout"><section class="sim-robot"><div class="robot-body"><div class="wheel left"><span class="motor-label">A</span></div><div class="wheel right"><span class="motor-label">B</span></div><div class="robot-screen" id="simScreen">Pronto</div></div></section><section class="sim-controls"><div class="row"><button class="btn primary" id="runSimulation">Executar programa</button><button class="btn secondary" id="resetSimulation">Limpar</button></div><label>Sensor de toque P1 <input id="simTouch" type="checkbox"></label><label>Botão do bloco pressionado <select id="simButton"><option value="">Nenhum</option><option value="left">Esquerdo</option><option value="right">Direito</option><option value="center">Central</option><option value="pair">Pareamento</option></select></label><label>Sensor analógico P1 <input id="simAnalog" type="range" min="0" max="4095" value="2048"><span id="simAnalogValue">2048</span></label><label>Bateria <input id="simBattery" type="range" min="0" max="100" value="65"><span id="simBatteryValue">65%</span></label><div class="sim-error hidden" id="simError"></div><div class="sim-console" id="simConsole">Pronto para simular.</div></section></div>`;
  const consoleNode = $('#simConsole', simulatorBody), errorNode = $('#simError', simulatorBody), screenNode = $('#simScreen', simulatorBody);
  const log = message => { consoleNode.textContent += '\n' + message; consoleNode.scrollTop = consoleNode.scrollHeight; };
  const resetVisual = () => { $$('.wheel', simulatorBody).forEach(node => node.classList.remove('active')); screenNode.textContent = 'Pronto'; consoleNode.textContent = 'Pronto para simular.'; errorNode.classList.add('hidden'); };
  const getNumber = (block, field) => Number(block.getFieldValue(field) || 0);
  const runSimulation = () => {
    resetVisual(); const failure = message => { throw Error(message); };
    const state = {
      motors: { 1: 0, 2: 0, 3: 0, 4: 0 }, operations: 0, elapsed: 0, timer: 0,
      procedures: new Map(workspace.getAllBlocks().filter(block => block.type === 'procedures_defnoreturn').map(block => [block.getFieldValue('NAME'), block]))
    };
    let currentBlock = null;
    const setMotor = (port, speed) => { state.motors[port] = speed; const wheel = Number(port) === 1 ? $('.wheel.left', simulatorBody) : Number(port) === 2 ? $('.wheel.right', simulatorBody) : null; if (wheel) wheel.classList.toggle('active', speed !== 0); log(`Motor ${'ABCD'[Number(port) - 1]}: ${speed}%`); };
    const readValue = block => {
      if (!block) return 0;
      if (block.type === 'math_number') return Number(block.getFieldValue('NUM') || 0);
      if (block.type === 'text') return block.getFieldValue('TEXT') || '';
      if (block.type === 'axioma_battery_level') return Number($('#simBattery', simulatorBody).value);
      if (block.type === 'axioma_timer_ms') return state.elapsed - state.timer;
      if (['axioma_analog', 'axioma_line_value', 'axioma_light_value', 'axioma_pot_value'].includes(block.type)) return Number($('#simAnalog', simulatorBody).value);
      if (block.type === 'math_arithmetic') { const left = Number(readValue(block.getInputTargetBlock('A'))), right = Number(readValue(block.getInputTargetBlock('B'))); return ({ ADD: left + right, MINUS: left - right, MULTIPLY: left * right, DIVIDE: right ? left / right : 0, POWER: left ** right })[block.getFieldValue('OP')] ?? 0; }
      if (block.type === 'text_join') return [...block.inputList].filter(input => input.name?.startsWith('ADD')).map(input => readValue(block.getInputTargetBlock(input.name))).join('');
      return block.getFieldValue('NUM') || block.getFieldValue('TEXT') || 0;
    };
    const readBoolean = block => {
      if (!block) return false;
      if (block.type === 'axioma_touch') return $('#simTouch', simulatorBody).checked;
      if (block.type === 'axioma_button_pressed') return $('#simButton', simulatorBody).value === block.getFieldValue('BUTTON');
      if (block.type === 'logic_boolean') return block.getFieldValue('BOOL') === 'TRUE';
      if (block.type === 'logic_negate') return !readBoolean(block.getInputTargetBlock('BOOL'));
      if (block.type === 'logic_operation') { const left = readBoolean(block.getInputTargetBlock('A')), right = readBoolean(block.getInputTargetBlock('B')); return block.getFieldValue('OP') === 'AND' ? left && right : left || right; }
      if (block.type === 'logic_compare') { const left = readValue(block.getInputTargetBlock('A')), right = readValue(block.getInputTargetBlock('B')); return ({ EQ: left === right, NEQ: left !== right, LT: left < right, LTE: left <= right, GT: left > right, GTE: left >= right })[block.getFieldValue('OP')] || false; }
      failure('Condição não suportada pelo simulador: ' + block.type);
    };
    const runStack = first => {
      for (let block = first; block; block = block.getNextBlock()) {
        currentBlock = block;
        if (++state.operations > 300) failure('Limite de 300 operações atingido. O programa pode conter uma repetição infinita.');
        switch (block.type) {
          case 'axioma_motor_speed': setMotor(block.getFieldValue('PORT'), getNumber(block, 'SPEED')); break;
          case 'axioma_robot_move': setMotor(block.getFieldValue('LEFT'), getNumber(block, 'SPEED')); setMotor(block.getFieldValue('RIGHT'), getNumber(block, 'SPEED')); break;
          case 'axioma_motor_stop': setMotor(block.getFieldValue('PORT'), 0); break;
          case 'axioma_stop_all': Object.keys(state.motors).forEach(port => setMotor(port, 0)); log('Todos os motores parados'); break;
          case 'axioma_motor_timed': setMotor(block.getFieldValue('PORT'), getNumber(block, 'SPEED')); log(`Aguardou ${getNumber(block, 'SECONDS')} s`); setMotor(block.getFieldValue('PORT'), 0); break;
          case 'axioma_wait': state.elapsed += getNumber(block, 'MS'); log(`Aguardou ${getNumber(block, 'MS')} ms`); break;
          case 'axioma_wait_seconds': state.elapsed += getNumber(block, 'SECONDS') * 1000; log(`Aguardou ${getNumber(block, 'SECONDS')} s`); break;
          case 'axioma_wait_button': if ($('#simButton', simulatorBody).value !== block.getFieldValue('BUTTON')) failure('O botão esperado não está pressionado no simulador.'); log('Botão pressionado'); break;
          case 'axioma_reset_timer': state.timer = state.elapsed; log('Temporizador redefinido'); break;
          case 'axioma_log': log(String(readValue(block.getInputTargetBlock('TEXT')))); break;
          case 'axioma_comment': break;
          case 'text_print': log(String(readValue(block.getInputTargetBlock('TEXT')))); break;
          case 'procedures_callnoreturn': { const definition = state.procedures.get(block.getFieldValue('NAME')); if (!definition) failure('Função não encontrada: ' + block.getFieldValue('NAME')); runStack(definition.getInputTargetBlock('STACK')); break; }
          case 'axioma_list_add': log('Item adicionado à lista'); break;
          case 'axioma_list_remove': log('Item removido da lista'); break;
          case 'axioma_tone': log(`Som: ${getNumber(block, 'FREQ')} Hz por ${getNumber(block, 'DURATION')} ms`); break;
          case 'axioma_servo_angle': log(`Servo ${block.getFieldValue('PORT')}: ${getNumber(block, 'ANGLE')}°`); break;
          case 'axioma_clear_display': screenNode.textContent = 'Tela limpa'; log('Tela limpa'); break;
          case 'axioma_show_image': screenNode.textContent = 'Imagem\n' + (block.getFieldValue('ASSET') || ''); log('Imagem exibida'); break;
          case 'axioma_play_wav': log('Áudio: ' + (block.getFieldValue('ASSET') || 'não selecionado')); break;
          case 'controls_repeat_ext': { const times = Number(block.getInputTargetBlock('TIMES')?.getFieldValue('NUM') || 0); for (let i = 0; i < Math.min(times, 100); i++) runStack(block.getInputTargetBlock('DO')); break; }
          case 'controls_if': { let executed = false; for (let index = 0; block.getInput('IF' + index); index++) if (readBoolean(block.getInputTargetBlock('IF' + index))) { runStack(block.getInputTargetBlock('DO' + index)); executed = true; break; } if (!executed && block.getInput('ELSE')) runStack(block.getInputTargetBlock('ELSE')); break; }
          case 'axioma_wait_until': if (!readBoolean(block.getInputTargetBlock('COND'))) failure('“esperar até que” não foi satisfeito. Ative o toque P1 ou altere a condição.'); log('Condição satisfeita'); break;
          case 'axioma_start': runStack(block.getInputTargetBlock('STACK')); break;
          default: failure('O simulador ainda não executa o bloco “' + block.type + '”.');
        }
      }
    };
    try {
      const issue = validate(); if (issue) failure(issue);
      const start = workspace.getTopBlocks(true).find(block => block.type === 'axioma_start'); if (!start) failure('Adicione um bloco Início.');
      log('Iniciando ' + project().name + '...'); runStack(start.getInputTargetBlock('STACK')); screenNode.textContent = 'Concluído'; log('Simulação concluída.');
    } catch (error) {
      errorNode.textContent = error.message; errorNode.classList.remove('hidden'); log('ERRO: ' + error.message);
      if (currentBlock) { currentBlock.select(); workspace.centerOnBlock(currentBlock.id); }
    }
  };
  $('#runSimulation', simulatorBody).onclick = runSimulation; $('#resetSimulation', simulatorBody).onclick = resetVisual;
  ['simAnalog', 'simBattery'].forEach(id => $('#' + id, simulatorBody).oninput = event => $('#' + id + 'Value', simulatorBody).textContent = event.target.value + (id === 'simBattery' ? '%' : ''));
  const simulatorButton = make('button', { className: 'btn secondary', id: 'simulatorButton', textContent: 'Simular' });
  mediaButton.after(simulatorButton); simulatorButton.onclick = () => { resetVisual(); openModal(simulatorModal); };
  }

  const inheritedOpenProject = openProject;
  openProject = function (id) {
    if (lastProjectId && lastProjectId !== id) rememberAssets(lastProjectId);
    inheritedOpenProject(id); lastProjectId = id; restoreAssets(id);
  };
  const inheritedNewProject = newProject;
  newProject = function () { inheritedNewProject(); lastProjectId = activeId; restoreAssets(activeId); };
})();
