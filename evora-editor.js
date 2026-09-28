/* Composição do editor EVORA: simulador fixo à esquerda, criação à direita. */
(() => {
  'use strict';

  const screen = document.getElementById('programming');
  const shell = screen?.querySelector('.shell');
  const bar = shell?.querySelector('.bar');
  const editor = shell?.querySelector('.editor');
  const simulator = editor?.querySelector('.axioma-simulator');
  const work = editor?.querySelector('.work');
  const contextBar = work?.querySelector('.worktop');
  const codePanel = editor?.querySelector('.side');
  if (!screen || !shell || !bar || !editor || !simulator || !work || !contextBar || !codePanel) return;

  const byId = id => document.getElementById(id);
  const allFiles = byId('allFiles');
  const newTab = byId('newTab');
  const tabs = byId('tabs');
  const fileTitle = byId('fileTitle');
  const saveFile = byId('saveFile');
  const portsButton = byId('portsBtn');
  const mediaButton = byId('mediaLibraryButton');
  const multiHubButton = byId('multiHubBtn');
  const sendButton = byId('send');
  const downloadButton = byId('download');
  const deviceButton = byId('deviceBtn');
  const deviceText = byId('deviceText');
  const deviceDot = byId('dot');

  allFiles.textContent = 'Projetos';
  newTab.textContent = 'Novo';
  saveFile.textContent = 'Salvar';
  sendButton.textContent = 'Enviar ao hub';

  const main = document.createElement('div');
  main.className = 'editor-toolbar-main';
  const sub = document.createElement('div');
  sub.className = 'editor-toolbar-sub';

  const projectGroup = document.createElement('div');
  projectGroup.className = 'editor-project-name';
  const titleLabel = document.createElement('label');
  titleLabel.htmlFor = 'fileTitle';
  titleLabel.textContent = 'Projeto';
  projectGroup.append(titleLabel, fileTitle);

  const viewGroup = document.createElement('div');
  viewGroup.className = 'editor-view-switch';
  viewGroup.setAttribute('role', 'group');
  viewGroup.setAttribute('aria-label', 'Área de programação');
  viewGroup.innerHTML = '<button type="button" data-editor-view="blocks">Blocos</button><button type="button" data-editor-view="python">Python</button>';

  const hubStatus = document.createElement('button');
  hubStatus.type = 'button';
  hubStatus.className = 'editor-hub-status';
  hubStatus.innerHTML = '<span class="editor-hub-dot" aria-hidden="true"></span><span data-editor-hub-text>Hub desconectado</span>';
  hubStatus.onclick = () => deviceButton?.click();

  const primaryActions = document.createElement('div');
  primaryActions.className = 'editor-primary-actions';

  const tabGroup = document.createElement('div');
  tabGroup.className = 'editor-tabs-group';
  tabGroup.append(tabs, newTab);

  const toolGroup = document.createElement('div');
  toolGroup.className = 'editor-tool-group';
  const configMenu = document.createElement('details');
  configMenu.className = 'editor-config-menu';
  const configSummary = document.createElement('summary');
  configSummary.textContent = 'Configurar';
  const configPanel = document.createElement('div');
  configPanel.className = 'editor-config-panel';
  [portsButton, mediaButton, multiHubButton].filter(Boolean).forEach(button => {
    button.setAttribute('aria-label', button.textContent.trim());
    configPanel.appendChild(button);
  });
  configMenu.append(configSummary, configPanel);
  toolGroup.appendChild(configMenu);

  main.append(allFiles, projectGroup, tabGroup, viewGroup, toolGroup);
  bar.replaceChildren(main);
  bar.classList.add('editor-toolbar');

  const workspacePanel = document.createElement('section');
  workspacePanel.className = 'editor-workspace-panel';
  workspacePanel.setAttribute('aria-label', 'Área de programação');
  editor.insertBefore(workspacePanel, work);
  contextBar.classList.add('editor-contextbar');
  workspacePanel.append(contextBar, work, codePanel);
  codePanel.id = 'codePanel';
  codePanel.setAttribute('aria-label', 'Código Python do projeto');

  const workspaceHeader = document.createElement('div');
  workspaceHeader.className = 'editor-workspace-heading';
  workspaceHeader.innerHTML = '<div><span data-workspace-kicker>Programa</span><strong data-workspace-title>Editor de blocos</strong></div>';
  contextBar.prepend(workspaceHeader);

  const bottomBar = document.createElement('footer');
  bottomBar.className = 'editor-bottom-bar';
  const bottomStatus = document.createElement('div');
  bottomStatus.className = 'editor-bottom-status';
  bottomStatus.innerHTML = '<span aria-hidden="true"></span><div><strong>Projeto local</strong><small data-bottom-status>Pronto para programar</small></div>';
  const bottomActions = document.createElement('div');
  bottomActions.className = 'editor-bottom-actions';
  bottomActions.append(saveFile, downloadButton, sendButton);
  bottomBar.append(bottomStatus, bottomActions);
  shell.appendChild(bottomBar);

  const statusNode = byId('status');
  const syncBottomStatus = () => {
    const value = statusNode?.textContent?.trim() || 'Pronto para programar';
    bottomStatus.querySelector('[data-bottom-status]').textContent = value;
    bottomStatus.classList.toggle('ok', statusNode?.classList.contains('ok'));
  };
  if (statusNode) new MutationObserver(syncBottomStatus).observe(statusNode, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  syncBottomStatus();

  configPanel.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { configMenu.open = false; }));

  const setView = view => {
    const next = view === 'python' ? 'python' : 'blocks';
    screen.dataset.editorView = next;
    viewGroup.querySelectorAll('button').forEach(button => {
      const active = button.dataset.editorView === next;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    workspaceHeader.querySelector('[data-workspace-title]').textContent = next === 'python' ? 'Código Python' : 'Editor de blocos';
    workspaceHeader.querySelector('[data-workspace-kicker]').textContent = next === 'python' ? 'Visualização' : 'Programa';
    localStorage.setItem('evora-editor-view-v2', next);
    requestAnimationFrame(() => {
      if (typeof workspace !== 'undefined' && workspace) Blockly.svgResize(workspace);
      window.dispatchEvent(new Event('resize'));
    });
  };

  viewGroup.querySelectorAll('button').forEach(button => button.onclick = () => setView(button.dataset.editorView));

  const syncHubStatus = () => {
    const connected = deviceDot?.classList.contains('ok');
    const label = connected ? deviceText?.textContent || 'Hub conectado' : 'Hub desconectado';
    hubStatus.classList.toggle('connected', connected);
    hubStatus.querySelector('[data-editor-hub-text]').textContent = label;
  };
  if (deviceText) new MutationObserver(syncHubStatus).observe(deviceText, { childList: true, characterData: true, subtree: true });
  if (deviceDot) new MutationObserver(syncHubStatus).observe(deviceDot, { attributes: true, attributeFilter: ['class'] });
  syncHubStatus();

  const previousOpenProject = openProject;
  openProject = function evoraOpenProject(id) {
    previousOpenProject(id);
    document.body.dataset.evoraScreen = 'programming';
    setTimeout(() => setView(localStorage.getItem('evora-editor-view-v2') || 'blocks'), 0);
  };
  setView(localStorage.getItem('evora-editor-view-v2') || 'blocks');

  const motorBlockTypes = new Set(['axioma_motor_speed', 'axioma_motor_stop', 'axioma_stop_all', 'axioma_servo_angle', 'axioma_motor_timed', 'axioma_motor_stop_mode', 'axioma_encoder_reset', 'axioma_move_rotations', 'axioma_move_distance']);
  // Cada família recebe uma cor exclusiva; Motores não compartilha mais o azul de Movimento.
  theme.setBlockStyle('motors', { colourPrimary: '#d95d39', colourSecondary: '#b94727', colourTertiary: '#963619' });
  theme.setBlockStyle('robot_motion', { colourPrimary: '#2563eb', colourSecondary: '#1d4ed8', colourTertiary: '#1e40af' });
  theme.setBlockStyle('text_blocks', { colourPrimary: '#0284c7', colourSecondary: '#0369a1', colourTertiary: '#075985' });
  theme.setCategoryStyle('motor_category', { colour: '#d95d39' });
  theme.setCategoryStyle('movement_category', { colour: '#2563eb' });
  theme.setCategoryStyle('sensor_category', { colour: '#0f9f8c' });
  theme.setCategoryStyle('action_category', { colour: '#8b5cf6' });
  theme.setCategoryStyle('control_category', { colour: '#e67e22' });
  theme.setCategoryStyle('variables_category', { colour: '#147fa8' });
  theme.setCategoryStyle('functions_category', { colour: '#6d4bc4' });
  theme.setCategoryStyle('logic_category', { colour: '#d14c72' });
  theme.setCategoryStyle('math_category', { colour: '#34875b' });
  theme.setCategoryStyle('text_category', { colour: '#0284c7' });
  motorBlockTypes.forEach(type => {
    const definition = Blockly.Blocks[type];
    if (!definition?.init || definition.__evoraMotorStyle) return;
    const originalInit = definition.init;
    definition.init = function evoraMotorInit() { originalInit.call(this); this.setStyle('motors'); };
    definition.__evoraMotorStyle = true;
  });
  workspace.setTheme?.(theme);
  window.evoraRefreshToolbox?.();
  const syncStackShadows = () => {
    document.querySelectorAll('.blocklyDraggable.evora-stack-root').forEach(root => root.classList.remove('evora-stack-root'));
    workspace.getTopBlocks(false).forEach(block => block.getSvgRoot?.()?.classList.add('evora-stack-root'));
  };
  workspace.addChangeListener(() => setTimeout(syncStackShadows, 0));
  setTimeout(syncStackShadows, 0);

  const style = document.createElement('style');
  style.textContent = `
    body[data-evora-screen="programming"]{overflow:hidden}
    #programming{background:var(--bg)}
    #programming.active{height:calc(100dvh - 64px);min-height:0;overflow:hidden}
    #programming .shell{max-width:none;height:100%;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;padding:10px 14px 10px;overflow:hidden}
    #programming .editor-toolbar{position:relative;z-index:100;display:block;height:auto;min-height:0;margin:0 0 8px;padding:0;border:1px solid var(--line);border-radius:9px;background:#fff;overflow:visible}
    .editor-toolbar-main{display:flex;align-items:center;gap:10px;min-height:54px;padding:8px 10px;border-top:3px solid var(--blue)}
    .editor-project-name{width:min(280px,24vw);display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:8px}
    .editor-project-name label{color:var(--muted);font-size:11px;font-weight:650}
    #programming .editor-project-name .title{width:100%;height:35px;border-radius:6px;font-weight:650}
    .editor-view-switch{display:flex;padding:3px;border:1px solid var(--line);border-radius:7px;background:#f1f5f9}
    .editor-view-switch button{min-width:82px;border:0;border-radius:5px;padding:7px 12px;color:var(--muted);background:transparent;font-size:12px;font-weight:700}
    .editor-view-switch button.active{color:#fff;background:var(--blue)}
    .editor-view-switch{flex:0 0 auto;margin-left:auto}.editor-primary-actions{margin-left:auto;display:flex;align-items:center;gap:7px}
    .editor-hub-status{min-height:35px;max-width:180px;display:flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:7px;padding:7px 10px;color:var(--muted);background:#fff;font-size:11px;font-weight:650;white-space:nowrap;overflow:hidden}
    .editor-hub-status span:last-child{overflow:hidden;text-overflow:ellipsis}.editor-hub-dot{flex:0 0 auto;width:7px;height:7px;border-radius:50%;background:#94a3b8}.editor-hub-status.connected{color:#047857;border-color:#a7f3d0;background:#f0fdf4}.editor-hub-status.connected .editor-hub-dot{background:var(--green)}
    .editor-tabs-group{min-width:90px;flex:1 1 320px;display:flex;align-items:center;gap:6px;overflow:hidden}.editor-tabs-group .tabs{min-width:0;max-width:none;overflow-x:auto;scrollbar-width:thin}.editor-tabs-group #newTab{flex:0 0 auto}
    .editor-tool-group{flex:0 0 auto;display:flex;align-items:center;gap:6px}
    .editor-config-menu{position:relative}.editor-config-menu summary{list-style:none;cursor:pointer;border:1px solid var(--line);border-radius:7px;padding:7px 28px 7px 11px;color:var(--graphite);background:#fff;font-size:12px;font-weight:700;position:relative}.editor-config-menu summary::-webkit-details-marker{display:none}.editor-config-menu summary:after{content:'';position:absolute;right:11px;top:12px;width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg)}.editor-config-menu[open] summary{color:var(--blue);border-color:#93c5fd}.editor-config-panel{position:absolute;right:0;top:calc(100% + 7px);z-index:50;min-width:180px;display:grid;gap:4px;padding:6px;border:1px solid var(--line);border-radius:9px;background:#fff;box-shadow:0 12px 28px rgba(15,23,42,.14)}.editor-config-panel .btn{width:100%;border:0;text-align:left;box-shadow:none;background:#fff}.editor-config-panel .btn:hover{background:var(--blue-soft)}
    #programming .editor{position:relative;z-index:1;display:grid!important;grid-template-columns:var(--evora-simulator-width,clamp(300px,27vw,390px)) minmax(560px,1fr)!important;gap:10px;height:100%;min-height:0;overflow:auto}
    .editor-splitter{position:absolute;z-index:10;top:14px;bottom:14px;left:calc(var(--evora-simulator-width,clamp(300px,27vw,390px)) + 3px);width:10px;cursor:col-resize;touch-action:none}.editor-splitter:before{content:'';position:absolute;top:50%;left:3px;width:4px;height:42px;transform:translateY(-50%);border-radius:99px;background:#cbd5e1;transition:background .14s ease}.editor-splitter:hover:before,.editor-splitter:focus:before,.editor-splitter.dragging:before{background:var(--blue)}.editor-splitter:focus-visible{outline:2px solid var(--blue);outline-offset:2px;border-radius:99px}
    #programming .axioma-simulator{display:flex!important;position:sticky;left:0;top:0;order:0;width:auto;min-width:0;height:100%;min-height:0;max-height:none;padding:10px;border:1px solid #bfdbfe;border-top:4px solid var(--blue);border-radius:11px;background:#eff6ff;z-index:2}
    body.axsim-fullscreen #programming .axioma-simulator.fullscreen{position:fixed!important;inset:0!important;left:0!important;top:0!important;width:100vw!important;height:100dvh!important;min-width:0!important;min-height:0!important;max-width:none!important;max-height:none!important;margin:0!important;padding:14px!important;border:0!important;border-radius:0!important;z-index:1000000!important}
    body.axsim-fullscreen #programming .editor{z-index:auto!important;overflow:visible!important}
    body.axsim-fullscreen #programming .axioma-simulator.fullscreen .axsim-stage{grid-template-columns:repeat(auto-fit,minmax(320px,1fr));padding:18px}
    body.axsim-fullscreen #programming .axioma-simulator.fullscreen .axsim-hub-scene{min-width:0}
    #programming .axioma-simulator .axsim-head{min-height:38px;padding:0 2px 7px;border-bottom:1px solid var(--line)}
    #programming .axioma-simulator .axsim-stage{flex:1;min-height:0;overflow:auto;background-color:#dbeafe;background-image:radial-gradient(circle,rgba(255,255,255,.85) 1px,transparent 1.5px);background-size:22px 22px;border-color:#bfdbfe}
    #programming .axioma-simulator .axsim-devices.actuators,#programming .axioma-simulator .axsim-devices.sensors{grid-template-columns:repeat(2,minmax(0,1fr));align-items:stretch;gap:8px;margin:10px 0 16px;position:static;height:auto;padding:0;border:0;background:transparent;backdrop-filter:none;z-index:auto}
    #programming .axioma-simulator .axsim-device{display:grid;grid-template-columns:72px minmax(0,1fr);grid-template-areas:"port port" "art name" "control control";align-items:center;min-width:0;min-height:88px;padding:6px;border:1px solid #cbdcec;border-radius:9px;background:rgba(255,255,255,.86);overflow:hidden}
    #programming .axioma-simulator .axsim-device:only-child{grid-column:1/-1}
    #programming .axioma-simulator .axsim-devices.sensors .axsim-device{--hub:#0f9f8c;border-color:#a7f3d0;background:linear-gradient(135deg,#ecfdf5,#f0fdf4)}
    #programming .axioma-simulator .axsim-devices.sensors .axsim-port{background:#0f9f8c}
    #programming .axioma-simulator .axsim-devices.sensors .axsim-control input{accent-color:#0f9f8c}
    #programming .axioma-simulator .axsim-port{grid-area:port;justify-self:start;margin:0 0 2px;padding:2px 7px}
    #programming .axioma-simulator .axsim-art{grid-area:art;width:70px;height:48px;max-width:100%;flex:none}
    #programming .axioma-simulator .axsim-device-name{grid-area:name;align-self:center;margin:0;padding:0 3px;color:#344054;font-size:10px;line-height:1.25;text-align:left;white-space:normal}
    #programming .axioma-simulator .axsim-control{grid-area:control;width:100%;max-width:none;margin-top:4px}
    #programming .axioma-simulator .axsim-devices.imu{grid-template-columns:1fr;margin:10px 0 0}
    #programming .axioma-simulator .axsim-device.axsim-imu{--hub:#0f9f8c;grid-template-columns:82px minmax(0,1fr);grid-template-areas:"port port" "art name" "controls controls";justify-items:stretch;min-height:0;padding:8px;border-color:#a7f3d0;background:linear-gradient(135deg,#ecfdf5,#f0fdf4)}
    #programming .axioma-simulator .axsim-imu .axsim-port{background:#0f9f8c;justify-self:start}
    #programming .axioma-simulator .axsim-imu .axsim-art{width:82px;height:62px;justify-self:start}
    #programming .axioma-simulator .axsim-imu .axsim-device-name{width:auto;padding:0;text-align:left;white-space:normal}
    #programming .axioma-simulator .axsim-imu-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%;margin-top:5px}
    #programming .axioma-simulator .axsim-imu-axis-group{display:grid;gap:4px;min-width:0}
    #programming .axioma-simulator .axsim-imu-axis-group strong{color:#047857;font-size:9px}
    #programming .axioma-simulator .axsim-imu-control{display:grid;grid-template-columns:16px minmax(0,1fr) 38px;align-items:center;gap:4px;color:#475569;font-size:9px;font-weight:800}
    #programming .axioma-simulator .axsim-imu-control input{accent-color:#0f9f8c;min-width:0;width:100%}
    #programming .axioma-simulator .axsim-imu-control output{text-align:right}
    #programming .axioma-simulator .axsim-devices.actuators .axsim-device{grid-template-columns:1fr;grid-template-areas:"port" "art" "name";justify-items:center;min-height:104px}
    #programming .axioma-simulator .axsim-devices.actuators .axsim-port{justify-self:start}
    #programming .axioma-simulator .axsim-devices.actuators .axsim-art{justify-self:center}
    #programming .axioma-simulator .axsim-devices.actuators .axsim-device-name{width:100%;padding:0;text-align:center;white-space:nowrap}
    #programming .axioma-simulator .axsim-cable{margin:0 auto}
    #programming .axioma-simulator .axsim-hub-scene{min-width:0;padding:10px}
    #programming .axioma-simulator .axsim-hub-scene{border-color:#cbdcec;border-radius:12px;background:rgba(255,255,255,.9);box-shadow:none}
    #programming .axioma-simulator .axsim-hub-head{min-height:24px;margin-bottom:10px;color:#1e293b;font-size:11px}
    #programming .axioma-simulator .axsim-battery{padding:3px 6px;border-radius:5px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:700}
    #programming .axioma-simulator .axsim-hub-body{width:164px;height:196px;border:2px solid #64748b;border-radius:18px;background:linear-gradient(150deg,#ffffff,#e2e8f0);box-shadow:inset 0 0 0 5px #f8fafc,0 5px 10px rgba(15,23,42,.12)}
    #programming .axioma-simulator .axsim-lcd-frame{left:17px;top:18px;width:128px;height:84px;border:3px solid #334155;border-radius:9px;background:#0f172a}
    #programming .axioma-simulator .axsim-lcd{background:#c7ead8;color:#164e3a;font-size:10px}
    #programming .axioma-simulator .axsim-logo{color:#2563eb;font-size:11px;letter-spacing:.1em}
    #programming .axioma-simulator .axsim-device.axsim-motor{border-color:#bfdbfe;background:linear-gradient(180deg,#fff,#f8fbff);box-shadow:inset 0 3px 0 #2563eb}
    #programming .axioma-simulator .axsim-motor .axsim-port{background:#2563eb}
    #programming .axioma-simulator .axsim-motor .axsim-art{width:106px;height:58px;margin-top:1px}
    #programming .axioma-simulator .axsim-motor-art text{font-size:13px;font-weight:850}
    #programming .axioma-simulator .axsim-motor .axsim-device-name{color:#475569;font-size:10px;font-weight:750;letter-spacing:.01em}
    #programming .axioma-simulator .axsim-motor-art .shaft{transform-box:fill-box;transform-origin:center}
    #programming .axioma-simulator .axsim-motor.axsim-running .shaft{animation:axsim-spin .55s linear infinite}
    #programming .axioma-simulator .axsim-motor.axsim-reverse .shaft{animation-direction:reverse}
    #programming .axioma-simulator .axsim-device:not(.axsim-motor) .axsim-art{filter:none}
    #programming .editor-workspace-panel{min-width:560px;height:100%;min-height:0;display:flex;flex-direction:column;border:1px solid #ddd6fe;border-top:4px solid var(--purple);border-radius:11px;background:#fff;overflow:hidden}
    #programming .editor-contextbar{min-height:48px;height:auto;display:flex;align-items:center;gap:10px;padding:6px 10px;border:0;border-bottom:1px solid var(--line);border-radius:0;background:#fff}
    .editor-workspace-heading{min-width:128px;padding-right:10px;border-right:1px solid var(--line)}.editor-workspace-heading>div{display:grid;gap:1px}.editor-workspace-heading span{color:var(--muted);font-size:9px;font-weight:650}.editor-workspace-heading strong{font-size:12px}
    #programming .editor-contextbar #status{min-width:130px;font-size:10px}
    #programming .work{display:flex!important;flex:1;min-height:0;border:0;border-radius:0;background:#f8fafc}
    #programming #blocklyDiv{height:auto;min-height:0;flex:1}
    #programming .side{display:none!important;flex:1;min-height:0;max-height:none;padding:18px;border:0;border-radius:0;background:#fff;overflow:auto}
    #programming .side .media{display:none}
    #programming .side pre{flex:1;max-height:none;border-color:#1e293b;border-radius:7px;background:#0f172a;color:#dbeafe}
    #programming[data-editor-view="python"] .work{display:none!important}
    #programming[data-editor-view="python"] .side{display:flex!important}
    #programming[data-editor-view="python"] .block-level,#programming[data-editor-view="python"] .tags{display:none}
    #programming[data-editor-view="python"] .editor-contextbar #status{margin-left:auto}
    .editor-bottom-bar{position:sticky;bottom:0;z-index:20;min-height:50px;margin-top:8px;display:flex;align-items:center;gap:12px;padding:7px 9px 7px 13px;border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 -4px 18px rgba(15,23,42,.08)}
    .editor-bottom-status{min-width:0;display:flex;align-items:center;gap:9px}.editor-bottom-status>span{width:9px;height:9px;border-radius:50%;background:#94a3b8;box-shadow:0 0 0 4px #f1f5f9}.editor-bottom-status.ok>span{background:var(--green);box-shadow:0 0 0 4px #d1fae5}.editor-bottom-status>div{min-width:0;display:grid}.editor-bottom-status strong{font-size:11px}.editor-bottom-status small{max-width:48vw;overflow:hidden;color:var(--muted);font-size:10px;text-overflow:ellipsis;white-space:nowrap}.editor-bottom-actions{margin-left:auto;display:flex;align-items:center;gap:7px}.editor-bottom-actions #send{min-width:150px;background:var(--green);border-color:var(--green)}.editor-bottom-actions #send:hover{background:#059669}.editor-bottom-actions #download{border-color:#c4b5fd;color:#6d28d9;background:#f5f3ff}
    .blocklyToolboxDiv{width:184px!important;border-right:1px solid var(--line)!important;background:#f8fafc!important;box-shadow:3px 0 12px rgba(15,23,42,.04)}
    .blocklyToolboxContents{display:grid!important;gap:7px;padding:10px!important}.blocklyTreeRow{width:100%!important;height:46px!important;margin:0!important;padding:0 10px!important;border:1px solid #dbe5f1!important;border-left:1px solid #dbe5f1!important;border-radius:8px!important;background:#fff!important;box-shadow:0 1px 1px rgba(15,23,42,.03);transition:border-color .14s ease,background .14s ease,transform .14s ease}.blocklyTreeRow:hover{border-color:#93c5fd!important;background:#fff!important;transform:translateY(-1px)}.blocklyTreeSelected{border-color:var(--blue)!important;background:var(--blue-soft)!important;box-shadow:inset 3px 0 0 var(--blue)}.blocklyTreeRow.evora-category{border-color:color-mix(in srgb,var(--evora-category) 26%,white)!important;background:color-mix(in srgb,var(--evora-category) 7%,white)!important;box-shadow:inset 3px 0 0 var(--evora-category),0 1px 1px rgba(15,23,42,.03)}.blocklyTreeRow.evora-category:hover{border-color:var(--evora-category)!important;background:color-mix(in srgb,var(--evora-category) 12%,white)!important}.blocklyTreeRow.evora-category.blocklyTreeSelected{background:color-mix(in srgb,var(--evora-category) 16%,white)!important;box-shadow:inset 4px 0 0 var(--evora-category),0 3px 8px color-mix(in srgb,var(--evora-category) 14%,transparent)}.blocklyTreeRow.evora-category.blocklyTreeSelected .blocklyTreeLabel{color:var(--evora-category)!important}.blocklyTreeLabel{font-family:"Aptos","Segoe UI Variable","Segoe UI",Arial,sans-serif!important;font-size:12px!important;font-weight:750!important;letter-spacing:-.01em}.blocklyTreeSelected .blocklyTreeLabel{color:var(--blue)!important}.blocklyTreeIcon{width:20px!important;height:20px!important;margin-right:8px!important;border:0!important;border-radius:6px!important;opacity:1!important;transform:none!important}
    .blocklyToolboxCategoryGroup{display:grid!important;width:184px!important;gap:7px!important;padding:10px!important}.blocklyToolboxCategoryContainer{width:100%!important;min-height:46px!important;margin:0!important;padding:0 13px!important;display:flex!important;align-items:center!important;border:1px solid #dbe5f1!important;border-radius:8px!important;background:#fff!important;box-shadow:0 1px 1px rgba(15,23,42,.03);transition:filter .14s ease,transform .14s ease}.blocklyToolboxCategoryContainer:hover{transform:translateY(-1px);cursor:pointer}.blocklyToolboxCategoryContainer.evora-category{border-color:var(--evora-category)!important;background:var(--evora-category)!important;box-shadow:none;cursor:pointer}.blocklyToolboxCategoryContainer.evora-category:hover{filter:brightness(1.08)}.blocklyToolboxCategoryContainer.evora-category[aria-selected="true"]{background:color-mix(in srgb,var(--evora-category) 82%,#0f172a)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.32)}.blocklyToolboxCategoryContainer.evora-category:before,.blocklyToolboxCategoryContainer .blocklyToolboxCategoryIcon,.blocklyToolboxCategoryContainer .blocklyTreeIcon,.blocklyToolboxCategoryContainer [class*="Icon"]{display:none!important}.blocklyToolboxCategoryContainer.evora-category>*,.blocklyToolboxCategoryContainer.evora-category .blocklyToolboxCategory,.blocklyToolboxCategoryContainer.evora-category .blocklyToolboxCategory.blocklyToolboxSelected{display:flex!important;align-items:center!important;width:100%!important;min-height:44px!important;margin:0!important;padding:0!important;background:transparent!important;box-shadow:none!important}.blocklyToolboxCategoryContainer .evora-category-icon-slot{display:block!important;flex:0 0 22px!important;width:22px!important;height:22px!important;min-height:0!important;margin:0 8px 0 0!important;padding:0!important;background:transparent!important;box-shadow:none!important}.blocklyToolboxCategoryContainer .blocklyToolboxCategoryLabel{display:flex!important;align-items:center!important;min-height:44px!important;margin:0!important;padding:0!important;background:transparent!important}.blocklyToolboxCategoryContainer *{color:#fff!important;font-family:"Aptos","Segoe UI Variable","Segoe UI",Arial,sans-serif!important;font-size:12px!important;font-weight:750!important;letter-spacing:-.01em;line-height:1!important}
    .blocklyFlyoutBackground{fill:#ffffff!important;fill-opacity:.92!important;stroke:#cbd5e1!important;stroke-width:1!important}.blocklyFlyout{filter:drop-shadow(8px 0 12px rgba(15,23,42,.08))}.blocklyFlyout .blocklyText{font-family:"Aptos","Segoe UI Variable","Segoe UI",Arial,sans-serif!important;font-weight:700!important}.blocklyMainBackground{fill:#f8fafc!important;stroke:none!important}.blocklyScrollbarHandle{fill:#94a3b8!important;rx:5px}.blocklyZoom>image,.blocklyTrash>image{opacity:.72}.blocklyDraggable .blocklyPath{stroke:none!important}.blocklyFlyout .blocklyDraggable:not(.blocklyDragging),.blocklyDraggable.evora-stack-root:not(.blocklyDragging){filter:drop-shadow(0 3px 2px rgba(15,23,42,.14))}.blocklySelected>.blocklyPath{stroke:none!important;filter:brightness(.94)}
    .media-import-actions{display:flex;flex-wrap:wrap;gap:8px}.media-import-actions label{cursor:pointer}
    @media(max-width:1050px){
      .editor-project-name{width:min(210px,23vw)}.editor-toolbar-main{gap:7px}.editor-tool-group .btn{padding-inline:9px}
      #programming .editor{grid-template-columns:280px minmax(520px,1fr)!important}.editor-workspace-heading{display:none}
    }
    @media(max-width:820px){
      #programming .shell{padding:8px}.editor-toolbar-main{gap:6px;overflow-x:auto}.editor-project-name{width:180px;grid-template-columns:42px minmax(120px,1fr)}.editor-project-name label{font-size:10px}.editor-tabs-group{flex:0 0 220px}.editor-view-switch{margin-left:0}.editor-tool-group{margin-left:0}
      #programming .editor{grid-template-columns:250px minmax(500px,1fr)!important}
      #programming .axioma-simulator,#programming .editor-workspace-panel{min-height:0;max-height:none}
      #programming .editor-contextbar{overflow-x:auto}.editor-contextbar .tags{display:none}
      .editor-bottom-bar{position:sticky;bottom:0;z-index:20}.editor-bottom-status{display:none}.editor-bottom-actions{width:100%}.editor-bottom-actions #send{flex:1}
    }
    @media(max-width:560px){
      .editor-toolbar-main{padding:8px}.editor-view-switch button{min-width:68px;padding-inline:8px}.editor-primary-actions{margin-left:auto}.editor-project-name label{display:none}.editor-project-name{width:150px;grid-template-columns:1fr}.editor-tool-group{overflow:visible}
      #programming .editor{grid-template-columns:230px minmax(500px,1fr)!important}.block-level{margin-left:auto}
    }
  `;
  document.head.appendChild(style);
  const toolboxColors = { Programa: '#475569', Motores: '#d95d39', Movimento: '#2563eb', Sensores: '#0f9f8c', Ações: '#8b5cf6', Mídia: '#a55f15', Controle: '#e67e22', Variáveis: '#147fa8', Listas: '#0f766e', Funções: '#6d4bc4', Lógica: '#d14c72', Matemática: '#34875b', Texto: '#0284c7' };
  const paintToolbox = () => document.querySelectorAll('.blocklyTreeRow,.blocklyToolboxCategoryContainer').forEach(row => {
    const label = row.querySelector('.blocklyTreeLabel,.blocklyToolboxCategoryLabel')?.textContent.trim() || row.textContent.trim();
    const color = toolboxColors[label];
    if (!color) return;
    row.classList.add('evora-category');
    row.style.setProperty('--evora-category', color);
    const rowContent = row.querySelector('.blocklyToolboxCategory');
    const labelElement = row.querySelector('.blocklyToolboxCategoryLabel');
    if (rowContent && !rowContent.querySelector('.evora-category-icon-slot')) {
      const iconSlot = document.createElement('span');
      iconSlot.className = 'evora-category-icon-slot';
      iconSlot.setAttribute('aria-hidden', 'true');
      rowContent.insertBefore(iconSlot, labelElement || rowContent.firstChild);
    }
    const icon = row.querySelector('.blocklyTreeIcon');
    if (icon) { icon.style.backgroundColor = color; icon.style.borderColor = color; }
  });
  const scheduleToolboxPaint = () => requestAnimationFrame(paintToolbox);
  window.evoraPaintBlocklyToolbox = paintToolbox;
  new MutationObserver(scheduleToolboxPaint).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('evora:toolbox-ready', scheduleToolboxPaint);
  document.addEventListener('pointerdown', scheduleToolboxPaint, true);
  let toolboxPaintAttempts = 0;
  const retryToolboxPaint = () => {
    paintToolbox();
    if (++toolboxPaintAttempts < 80 && !document.querySelector('.blocklyToolboxCategoryContainer.evora-category')) setTimeout(retryToolboxPaint, 100);
  };
  retryToolboxPaint();
})();
