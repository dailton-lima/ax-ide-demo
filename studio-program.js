/* Workspace Blockly, configuração das seis portas e geração de MicroPython. */
function init() {
  workspace = Blockly.inject('blocklyDiv', {
    toolbox, theme,
    grid: { spacing: 20, length: 2, colour: '#dbe1eb', snap: true },
    zoom: { controls: true, wheel: true, startScale: .9, maxScale: 1.35, minScale: .65 },
    trashcan: true
  });
  workspace.addChangeListener(event => { if (!loading && event.type !== Blockly.Events.UI) { generate(); save(); } });
}
function createRootBlock(type, x, y) { const block = workspace.newBlock(type); block.initSvg(); block.render(); block.moveBy(x, y); return block; }
function workspaceInset() { return { x: (workspace.getToolbox?.()?.getWidth?.() || 120) + 48, y: 120 }; }
function keepWorkspaceInset() {
  const roots = workspace.getTopBlocks(false); if (!roots.length) return;
  const points = roots.map(block => block.getRelativeToSurfaceXY()), inset = workspaceInset();
  const minX = Math.min(...points.map(point => point.x)), minY = Math.min(...points.map(point => point.y));
  const dx = Math.max(0, inset.x - minX), dy = Math.max(0, inset.y - minY);
  if (dx || dy) roots.forEach(block => block.moveBy(dx, dy));
}
function frameWorkspace() { requestAnimationFrame(() => { const inset = workspaceInset(), scale = workspace.scale || .9; workspace.scroll(120 - inset.x * scale, 40 - inset.y * scale); }); }
function loadWorkspace() {
  loading = true; workspace.clear();
  if (project().workspace) Blockly.serialization.workspaces.load(project().workspace, workspace);
  else { const inset = workspaceInset(); createRootBlock('axioma_start', inset.x, inset.y); createRootBlock('axioma_forever', inset.x + 264, inset.y); }
  keepWorkspaceInset(); loading = false; tagsRender(); generate(); frameWorkspace();
}
function tagsRender() { tags.innerHTML = project().config.map((type, index) => type === 'none' ? '' : '<span class="tag">P' + (index + 1) + ': ' + TYPES[type].label + '</span>').join('') || '<span class="tag">Sem sensores</span>'; }
function validate() {
  for (const block of workspace.getAllBlocks()) {
    const portConfig = window.axPortConfigForBlock ? window.axPortConfigForBlock(block) : project().config;
    if (block.type === 'axioma_touch' && portConfig[+block.getFieldValue('PORT') - 1] !== 'touch') return 'A porta precisa ser Botão de toque.';
    if (block.type === 'axioma_analog' && !['line', 'light', 'pot'].includes(portConfig[+block.getFieldValue('PORT') - 1])) return 'A porta precisa ser um sensor analógico.';
    if (['axioma_play_wav', 'axioma_show_image'].includes(block.type) && !block.getFieldValue('ASSET')) return 'Adicione o arquivo de mídia usado pelo bloco.';
  }
  return null;
}
function generate(warn = false) {
  let error = validate();
  if (error) { codeStatus.textContent = error; if (warn) alert(error); return null; }
  const roots = workspace.getTopBlocks(true), starts = roots.filter(block => block.type === 'axioma_start');
  if (starts.length !== 1) { error = 'Use exatamente um bloco Início.'; codeStatus.textContent = error; if (warn) alert(error); return null; }
  gen.init(workspace);
  const generated = new Map(roots.map(block => [block, gen.blockToCode(block)]));
  const definitions = Object.values(gen.definitions_ || {}).join('\n');
  const body = generated.get(starts[0]) || '';
  const forever = roots.filter(block => block.type === 'axioma_forever').map(block => generated.get(block) || '').join('\n');
  gen.finish('');
  const setup = project().config.map((type, index) => TYPES[type].mode ? "axioma.configure_port(" + (index + 1) + ", '" + TYPES[type].mode + "')" : '').filter(Boolean).join('\n');
  const text = 'import axioma\nimport axioma_media\nimport time\n\n' + setup + (setup ? '\n\n' : '') + definitions + (definitions ? '\n\n' : '') + body + (forever ? '\n' + forever : '');
  code.textContent = text; codeStatus.textContent = 'Código atualizado'; return text;
}
