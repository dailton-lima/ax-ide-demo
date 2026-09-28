/* Estado local de projetos e navegação entre arquivos e editor. */
const TYPES = {
  none: { label: 'Não usar', mode: '' },
  touch: { label: 'Botão de toque', mode: 'digital' },
  line: { label: 'Sensor de linha', mode: 'analog' },
  light: { label: 'Sensor de luz', mode: 'analog' },
  pot: { label: 'Potenciômetro', mode: 'analog' },
  color: { label: 'Sensor de cor I²C', mode: 'i2c' },
  i2c: { label: 'Sensor I²C genérico', mode: 'i2c' }
};
const KEY = 'axioma-studio-projects-v3';
const BACKUP_KEY = KEY + '-backup';
const PROJECT_STORE_VERSION = 4;
const STYLE = Object.freeze({ program: 'program', movement: 'movement', sensors: 'sensors', actions: 'actions', media: 'media' });
let recoveryNotice = '';
let projects = read(), activeId = null, workspace, loading = false, audio = new Map(), images = new Map();

function decodeProjects(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { version: 3, projects: parsed };
    if (parsed && parsed.version === PROJECT_STORE_VERSION && Array.isArray(parsed.projects)) return parsed;
  } catch { /* tenta a cópia de recuperação */ }
  return null;
}
function read() {
  const primary = decodeProjects(localStorage.getItem(KEY));
  if (primary) return primary.projects;
  const backup = decodeProjects(localStorage.getItem(BACKUP_KEY));
  if (backup) { recoveryNotice = 'Uma cópia local de recuperação foi restaurada.'; return backup.projects; }
  return [];
}
function persist() {
  if (typeof axAllowProjectSave === 'boolean' && !axAllowProjectSave) return;
  const previous = localStorage.getItem(KEY);
  if (decodeProjects(previous)) localStorage.setItem(BACKUP_KEY, previous);
  localStorage.setItem(KEY, JSON.stringify({ version: PROJECT_STORE_VERSION, savedAt: Date.now(), projects }));
}
function uid() { return 'p' + Date.now() + Math.random().toString(16).slice(2); }
function clean(value) { return (value || 'novo-projeto').trim().replace(/[^\w\- ]/g, '').slice(0, 32) || 'novo-projeto'; }
function asset(value) { return (value.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'arquivo'); }
function project() { return projects.find(item => item.id === activeId); }
function fresh(name) { return { id: uid(), name, config: Array(6).fill('none'), workspace: null, updatedAt: Date.now() }; }
function esc(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

function show(id) {
  document.querySelectorAll('.screen').forEach(element => element.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.getElementById('crumb').textContent = id === 'files' ? 'Projetos' : project().name;
}
function renderFiles() {
  if (recoveryNotice) { status.textContent = recoveryNotice; recoveryNotice = ''; }
  fileGrid.innerHTML = projects.map(item => '<button class="file" data-file="' + item.id + '"><i class="project-file-mark" aria-hidden="true"></i><strong>' + esc(item.name) + '</strong><small>' + new Date(item.updatedAt).toLocaleDateString('pt-BR') + ' · ' + item.config.filter(type => type !== 'none').length + ' portas</small></button>').join('');
  fileGrid.querySelectorAll('[data-file]').forEach(button => button.onclick = () => openProject(button.dataset.file));
}
function newProject() {
  const item = fresh('projeto-' + (projects.length + 1));
  projects.push(item); persist(); openProject(item.id);
}
function openProject(id) {
  activeId = id; show('programming'); fileTitle.value = project().name;
  tabsRender(); loadWorkspace(); setTimeout(() => {
    Blockly.svgResize(workspace);
    document.dispatchEvent(new Event('evora:toolbox-ready'));
    window.evoraPaintBlocklyToolbox?.();
  }, 0);
}
function tabsRender() {
  tabs.innerHTML = projects.map(item => '<button class="tab ' + (item.id === activeId ? 'active' : '') + '" data-tab="' + item.id + '">' + esc(item.name) + ' <em data-close="' + item.id + '">×</em></button>').join('');
  tabs.querySelectorAll('[data-tab]').forEach(button => button.onclick = event => { if (event.target.dataset.close) return; save(); openProject(button.dataset.tab); });
  tabs.querySelectorAll('[data-close]').forEach(button => button.onclick = event => {
    event.stopPropagation();
    if (projects.length === 1) return filesOpen();
    if (confirm('Fechar esta aba? O projeto continua salvo.')) { save(); activeId = projects.find(item => item.id !== button.dataset.close).id; openProject(activeId); }
  });
}
function filesOpen() { save(); show('files'); renderFiles(); }
function save() {
  if (!activeId || loading) return;
  const item = project(); item.name = clean(fileTitle.value);
  item.workspace = Blockly.serialization.workspaces.save(workspace); item.updatedAt = Date.now(); persist();
  tabsRender(); crumb.textContent = item.name; status.textContent = 'Salvo localmente';
}
