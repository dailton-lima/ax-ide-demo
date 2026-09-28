import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = file => readFile(path.join(root, file), 'utf8');

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise(resolve => server.close(resolve));
  return port;
}

function request(port, pathname) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port, path: pathname }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
    });
    req.once('error', reject);
  });
}

async function waitForServer(port) {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      return await request(port, '/');
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  throw lastError;
}

test('arquivos JavaScript críticos passam na verificação de sintaxe', () => {
  for (const file of ['dev-server.js', 'evora-editor.js', 'studio-editor-layout.js', 'studio-toolbox-cards.js', 'studio-simulator.js', 'studio-profile.js', 'studio-projects.js', 'studio-program.js', 'studio-ports.js', 'studio-media.js', 'studio-transport.js', 'studio-assembly-manuals.js', 'studio-live-monitor.js', 'studio-preflight.js', 'studio-lesson-context.js', 'studio-challenges.js', 'studio-accessibility.js', 'studio-interaction.js', 'evora-ui.js']) {
    assert.doesNotThrow(() => execFileSync(process.execPath, ['--check', file], { cwd: root, stdio: 'pipe' }));
  }
});

test('superfícies interativas não selecionam texto, mas conteúdo de estudo permanece copiável', async () => {
  const html = await source('index.html');
  const interaction = await source('studio-interaction.js');
  assert.match(html, /studio-interaction\.js/);
  assert.match(interaction, /\.axioma-simulator/);
  assert.match(interaction, /\.blocklySvg/);
  assert.match(interaction, /user-select:none/);
  assert.match(interaction, /pre,#code/);
  assert.match(interaction, /user-select:text/);
  assert.match(interaction, /button:focus-visible/);
  assert.match(interaction, /outline:3px solid #8b5cf6/);
  assert.match(html, /skip-link/);
  assert.match(html, /<title>EVORA Studio<\/title><style>\.skip-link/);
  assert.match(html, /\.skip-link\{[^}]*transform:translateY\(-110%\)/);
  assert.match(html, /id="mainContent" tabindex="-1"/);
  assert.match(interaction, /\.skip-link:focus/);
});

test('modo de alto contraste é persistente e acessível no editor', async () => {
  const accessibility = await source('studio-accessibility.js');
  assert.match(accessibility, /evora-high-contrast/);
  assert.match(accessibility, /data-high-contrast/);
  assert.match(accessibility, /data-reduced-motion/);
  assert.match(accessibility, /aria-pressed/);
  assert.match(accessibility, /localStorage\.setItem\(contrastKey/);
  assert.match(accessibility, /localStorage\.setItem\(reducedMotionKey/);
});

test('trilha educacional persiste conclusão apenas para aulas disponíveis', async () => {
  const ui = await source('evora-ui.js');
  assert.match(ui, /evora-learning-progress-v1/);
  assert.match(ui, /item\.status !== 'pending'/);
  assert.match(ui, /data-toggle-lesson/);
  assert.match(ui, /Concluir aula/);
  assert.match(ui, /concluídas/);
  assert.match(ui, /data-continue-learning/);
  assert.match(ui, /learning-next-card/);
  assert.match(ui, /Próxima aula/);
  assert.match(ui, /lesson-card\.completed/);
  assert.match(ui, /data-catalog-toolbar hidden/);
  assert.match(ui, /catalogMode = !catalogMode/);
  assert.match(ui, /hidden = !catalogMode/);
  assert.doesNotMatch(ui, /Cada etapa reúne aulas curtas/);
  assert.doesNotMatch(ui, /data-lessons-description/);
  assert.match(ui, /<small>\$\{path\.summary\}<\/small>/);
  const css = await source('evora-ui.css');
  assert.match(css, /\.catalog-toolbar\[hidden\] \{ display: none; \}/);
  assert.match(css, /\.evora-page \{ width: 100%; margin: 0; \}/);
  assert.match(css, /\.lesson-catalog-heading \{ margin: 0 0 18px; \}/);
  assert.match(css, /--page-gutter: 40px/);
  assert.match(css, /#files\.active \{ height: calc\(100dvh - 64px\); overflow: hidden; \}/);
  assert.match(css, /#files \.files \{ height: 100%; min-height: 0; overflow-y: auto;/);
  assert.match(ui, /role="progressbar"/);
  assert.match(ui, /aria-valuenow="\$\{percent\}"/);
});

test('revisão prévia orienta o estudante antes do envio ao hub', async () => {
  const html = await source('index.html');
  const preflight = await source('studio-preflight.js');
  const transport = await source('studio-transport.js');
  assert.match(html, /studio-preflight\.js/);
  assert.match(preflight, /Revisar projeto/);
  assert.match(preflight, /Mantenha apenas um bloco Início/);
  assert.match(preflight, /bloco Sempre sem ações internas/);
  assert.match(transport, /window\.axPreflight\?\.review\(\)/);
  assert.match(transport, /Revise o projeto antes do envio/);
});

test('aula inicia projeto contextualizado no editor', async () => {
  const html = await source('index.html');
  const ui = await source('evora-ui.js');
  const context = await source('studio-lesson-context.js');
  assert.match(html, /studio-lesson-context\.js/);
  assert.match(ui, /window\.evoraStartLessonProject\(item\)/);
  assert.match(context, /atividade-/);
  assert.match(context, /sensorForLesson/);
  assert.match(context, /lesson-context-chip/);
  assert.match(context, /item\.lessonContext/);
});

test('projetos prontos possuem estrutura segura para manuais de montagem', async () => {
  const html = await source('index.html');
  const manuals = await source('studio-assembly-manuals.js');
  const ui = await source('evora-ui.js');
  assert.match(html, /studio-assembly-manuals\.js/);
  assert.match(manuals, /status: 'planned'/);
  assert.match(manuals, /cover: null/);
  assert.match(manuals, /parts: \[\]/);
  assert.match(manuals, /steps: \[\]/);
  assert.match(manuals, /manual\.cover && manual\.parts\.length && manual\.steps\.length/);
  assert.match(ui, /data-assembly-manual/);
  assert.match(ui, /evoraOpenAssemblyManual/);
});

test('telemetria ao vivo mantém histórico compacto das portas do hub', async () => {
  const html = await source('index.html');
  const sensors = await source('studio-live-sensors.js');
  const monitor = await source('studio-live-monitor.js');
  assert.match(html, /studio-live-monitor\.js/);
  assert.match(sensors, /evora:live-sensors/);
  assert.match(monitor, /Leituras ao vivo/);
  assert.match(monitor, /values\.length > 28/);
  assert.match(monitor, /live-monitor-grid/);
  assert.match(monitor, /evoraLiveMonitor/);
});

test('projetos prontos oferecem desafios com critérios verificáveis', async () => {
  const html = await source('index.html');
  const enhancements = await source('studio-enhancements.js');
  const challenges = await source('studio-challenges.js');
  assert.match(html, /studio-challenges\.js/);
  assert.match(enhancements, /item\.challengeContext/);
  assert.match(challenges, /Desafio do projeto/);
  assert.match(challenges, /axioma_robot_move/);
  assert.match(challenges, /axioma_imu_tilted/);
  assert.match(challenges, /critérios atendidos/);
  assert.match(challenges, /evoraChallengeCheck/);
});

test('modais preservam foco, Escape e navegação por teclado', async () => {
  const html = await source('index.html');
  const accessibility = await source('studio-accessibility.js');
  assert.match(html, /studio-accessibility\.js/);
  assert.match(accessibility, /aria-modal/);
  assert.match(accessibility, /event\.key === 'Escape'/);
  assert.match(accessibility, /event\.key !== 'Tab'/);
  assert.match(accessibility, /returnFocus/);
});

test('novos projetos começam com Início e Sempre em uma margem segura', async () => {
  const program = await source('studio-program.js');
  assert.match(program, /createRootBlock\('axioma_start', inset\.x, inset\.y\)/);
  assert.match(program, /createRootBlock\('axioma_forever', inset\.x \+ 264, inset\.y\)/);
  assert.match(program, /workspace\.scroll\(120 - inset\.x \* scale, 40 - inset\.y \* scale\)/);
});

test('simulador usa regiões específicas para atuadores e sensores', async () => {
  const simulator = await source('studio-simulator.js');
  const editor = await source('evora-editor.js');
  assert.match(simulator, /axsim-devices actuators/);
  assert.match(simulator, /axsim-devices sensors/);
  assert.doesNotMatch(simulator, /axsim-devices top/);
  assert.doesNotMatch(simulator, /axsim-devices bottom/);
  assert.match(editor, /axsim-devices\.actuators.*position:static/);
});

test('simulador expõe controles nomeados para tecnologias assistivas', async () => {
  const simulator = await source('studio-simulator.js');
  assert.match(simulator, /aria-label="Executar simulação"/);
  assert.match(simulator, /role="region" aria-label="Dispositivos virtuais do hub"/);
  assert.match(simulator, /aria-label="\$\{name\}: valor"/);
  assert.match(simulator, /kind==='accel'\?'Acelerômetro':'Giroscópio'/);
  assert.match(simulator, /Botão esquerdo do hub/);
  assert.match(simulator, /aria-valuetext/);
});

test('simulador respeita preferência do sistema por movimento reduzido', async () => {
  const simulator = await source('studio-simulator.js');
  assert.match(simulator, /prefers-reduced-motion: reduce/);
  assert.match(simulator, /if\(!reducedMotion\)stage\.querySelectorAll/);
});

test('botões físicos do simulador aceitam Enter e Espaço', async () => {
  const simulator = await source('studio-simulator.js');
  assert.match(simulator, /event\.key==='Enter'\|\|event\.key===' '/);
  assert.match(simulator, /b\.onkeydown=/);
  assert.match(simulator, /b\.onkeyup=/);
  assert.match(simulator, /document\.addEventListener\('keyup'/);
  assert.match(simulator, /aria-pressed/);
});

test('toolbox separa motores individuais da base móvel invertida', async () => {
  const index = await source('index.html');
  const editor = await source('evora-editor.js');
  const simulator = await source('studio-simulator.js');
  assert.match(index, /category name="Motores"/);
  assert.match(index, /category name="Movimento"/);
  assert.match(index, /axioma_robot_move/);
  assert.match(index, /axStatement\(this,'robot_motion'\)/);
  assert.match(editor, /theme\.setBlockStyle\('robot_motion'/);
  assert.match(index, /axioma.Motor\('\+ports\.right\+'\)\.speed\('\+-speed\+'\)/);
  assert.match(simulator, /setMotor\(h,\+field\(b,'RIGHT'\),-speed\*direction\)/);
});

test('perfil Base usa display 240x240 e não oferece blocos de encoder', async () => {
  const profile = await source('studio-profile.js');
  const blocks = await source('studio-blocks.js');
  assert.match(profile, /display\.rgb\.240x240/);
  assert.match(profile, /display: 'ST7789-240x240'/);
  assert.match(blocks, /const supportsEncoders = window\.AXIOMA_HARDWARE_PROFILE/);
  assert.match(blocks, /if \(supportsEncoders\)/);
});

test('perfil e renderizador Blockly ficam em módulo externo carregado antes do núcleo', async () => {
  const index = await source('index.html');
  const profile = await source('studio-profile.js');
  assert.match(index, /<script src="studio-profile\.js"><\/script>/);
  assert.match(profile, /AXIOMA_HARDWARE_PROFILE = Object\.freeze/);
  assert.match(profile, /Blockly\.blockRendering\.register\('axioma'/);
});

test('estado de projetos e contrato das seis portas ficam fora do index', async () => {
  const index = await source('index.html');
  const projects = await source('studio-projects.js');
  assert.match(index, /<script src="studio-projects\.js"><\/script>/);
  assert.match(projects, /config: Array\(6\)\.fill\('none'\)/);
  assert.match(projects, /const TYPES =/);
  assert.match(projects, /function persist\(\)/);
  assert.match(projects, /function openProject\(id\)/);
});

test('projetos e mídias usam persistência versionada com recuperação local', async () => {
  const projects = await source('studio-projects.js');
  const media = await source('studio-media.js');
  assert.match(projects, /const PROJECT_STORE_VERSION = 4/);
  assert.match(projects, /const BACKUP_KEY = KEY \+ '-backup'/);
  assert.match(projects, /version: PROJECT_STORE_VERSION/);
  assert.match(projects, /Uma cópia local de recuperação foi restaurada/);
  assert.match(media, /const databaseName = 'axioma-studio-assets-v1'/);
  assert.match(media, /indexedDB\.open\(databaseName, 1\)/);
  assert.match(media, /restoreAssets\(id\)/);
});

test('workspace e geração Python ficam no módulo de programação', async () => {
  const index = await source('index.html');
  const program = await source('studio-program.js');
  assert.match(index, /<script src="studio-program\.js"><\/script>/);
  assert.match(program, /function loadWorkspace\(\)/);
  assert.match(program, /function validate\(\)/);
  assert.match(program, /function generate\(warn = false\)/);
  assert.match(program, /axioma\.configure_port/);
});

test('configuração visual das seis portas possui controlador externo', async () => {
  const index = await source('index.html');
  const ports = await source('studio-ports.js');
  assert.match(index, /<script src="studio-ports\.js"><\/script>/);
  assert.match(ports, /window\.axPorts = Object\.freeze/);
  assert.match(ports, /project\(\)\.config\[Number\(field\.dataset\.port\)\]/);
  assert.match(ports, /typeof axRefreshSensorToolbox === 'function'/);
  assert.match(ports, /generate\(\)/);
});

test('preparo de áudio e imagem do projeto possui módulo próprio', async () => {
  const index = await source('index.html');
  const media = await source('studio-media.js');
  assert.match(index, /<script src="studio-media\.js"><\/script>/);
  assert.match(media, /window\.axMedia = Object\.freeze/);
  assert.match(media, /buffer\.duration \* 16000/);
  assert.match(media, /canvas\.width = canvas\.height = 240/);
  assert.match(media, /audioFiles\.onchange = addAudio/);
  assert.match(media, /imageFiles\.onchange = addImage/);
});

test('transporte do hub possui módulo próprio para Wi-Fi e USB', async () => {
  const index = await source('index.html');
  const transport = await source('studio-transport.js');
  assert.match(index, /<script src="studio-transport\.js"><\/script>/);
  assert.match(transport, /window\.axTransport = Object\.freeze/);
  assert.match(transport, /await uploadUsb\(text, manifest\)/);
  assert.match(transport, /\/api\/projects\//);
  assert.match(transport, /send\.onclick = sendProject/);
});

test('envio declara capacidades requeridas e verifica o perfil físico', async () => {
  const transport = await source('studio-transport.js');
  assert.match(transport, /function requiredCapabilities\(\)/);
  assert.match(transport, /function verifyCompatibility\(\)/);
  assert.match(transport, /hubDescriptor\.id !== AXIOMA_HARDWARE_PROFILE\.id/);
  assert.match(transport, /manifest\.target =/);
  assert.match(transport, /hardware \|\| null/);
});

test('pacote de projeto inclui SHA-256 antes do envio', async () => {
  const transport = await source('studio-transport.js');
  assert.match(transport, /async function packageInfo\(text\)/);
  assert.match(transport, /crypto\.subtle\.digest\('SHA-256', bytes\)/);
  assert.match(transport, /format: 'axioma-project-v1'/);
  assert.match(transport, /assets: \{ audio: await assetsFor\(audio\), images: await assetsFor\(images\) \}/);
  assert.match(transport, /manifestForHub\(await packageInfo\(text\)\)/);
  assert.match(transport, /async function uploadUsb\(text, manifest\)/);
});

test('envio multi-hub usa implantação CAN com confirmação posterior', async () => {
  const transport = await source('studio-transport.js');
  const multiHub = await source('studio-multihub.js');
  assert.match(transport, /window\.axMultiHub\?\.enabled\(\)/);
  assert.match(transport, /\/api\/hubs\/deploy/);
  assert.match(multiHub, /window\.axMultiHub=Object\.freeze/);
  assert.match(multiHub, /function deploymentPayload\(manifest\)/);
  assert.match(transport, /async function startMultiHub\(\)/);
  assert.match(transport, /\/api\/hubs\/start/);
  assert.match(transport, /async function resumeMultiHub\(\)/);
  assert.match(transport, /\/api\/hubs\/resume/);
  assert.match(multiHub, /Iniciar sincronizado/);
  assert.match(multiHub, /Retomar envio/);
  assert.match(multiHub, /firmwareActions\.resume!==true/);
  assert.match(multiHub, /firmwareActions\.start!==true/);
});

test('blocos de motores usam uma cor exclusiva sem alterar o formato padrão', async () => {
  const editor = await source('evora-editor.js');
  assert.match(editor, /theme\.setBlockStyle\('motors'/);
  assert.match(editor, /theme\.setCategoryStyle\('motor_category'/);
  assert.match(editor, /colourPrimary: '#d95d39'/);
  assert.doesNotMatch(editor, /evora-motor-rail|evora-motor-terminal|evora-motor-base/);
  assert.match(editor, /\.blocklyDraggable \.blocklyPath\{stroke:none!important\}/);
});

test('categorias Blockly recebem cartões visuais integrados ao design EVORA', async () => {
  const index = await source('index.html');
  const editor = await source('evora-editor.js');
  const cards = await source('studio-toolbox-cards.js');
  assert.match(index, /studio-toolbox-cards\.js/);
  assert.match(editor, /\.blocklyToolboxDiv\{width:184px!important/);
  assert.match(cards, /blocklyToolboxCategoryContainer\.evora-category/);
  assert.match(cards, /border-left:4px solid var\(--evora-category\)!important/);
  assert.match(cards, /\.blocklyToolboxCategory\.blocklyToolboxSelected[^}]*border-left:0!important/);
  assert.match(cards, /evora-category-icon-slot/);
  assert.match(cards, /cursor:pointer!important/);
  assert.match(cards, /evora-category:focus-visible/);
});

test('sombra do Blockly é aplicada uma vez por pilha conectada', async () => {
  const editor = await source('evora-editor.js');
  assert.match(editor, /syncStackShadows/);
  assert.match(editor, /getTopBlocks\(false\)/);
  assert.match(editor, /\.blocklyDraggable\.evora-stack-root:not\(\.blocklyDragging\)/);
  assert.doesNotMatch(editor, /\.blocklyDraggable:not\(\.blocklyDragging\)\{filter/);
});

test('interação dos sensores não recria o palco durante o arraste', async () => {
  const simulator = await source('studio-simulator.js');
  assert.match(simulator, /sensorInteractionActive/);
  assert.match(simulator, /function renderSafely\(\)\{if\(sensorInteractionActive\)/);
  assert.match(simulator, /stage\.addEventListener\('pointerdown'/);
  assert.match(simulator, /releaseSensorInteraction/);
});

test('simulador disponibiliza IMU virtual e o conecta aos blocos de orientação', async () => {
  const simulator = await source('studio-simulator.js');
  const learning = await source('studio-learning-mode.js');
  assert.match(simulator, /axsim-device axsim-imu/);
  assert.match(simulator, /data-imu="\$\{h\}:\$\{kind\}:\$\{axis\}"/);
  assert.match(simulator, /imu:\{accel:\{x:0,y:0,z:1000\},gyro:\{x:0,y:0,z:0\}\}/);
  assert.match(simulator, /advancedMode\(\)\?/);
  assert.match(simulator, /Acelerômetro/);
  assert.match(simulator, /Giroscópio/);
  assert.match(simulator, /kind==='accel'\?-1000:-180/);
  assert.match(simulator, /background:#0f9f8c/);
  assert.match(simulator, /updateImuControl/);
  assert.match(simulator, /const imuPose=imu=>/);
  assert.match(simulator, /skewY\(\$\{roll\}deg\)/);
  assert.match(simulator, /b\.type==='axioma_imu_tilted'/);
  assert.match(simulator, /b\.type==='axioma_gyro'\)return imu\.gyro\[axis\]/);
  assert.match(learning, /evora:block-level/);
});

test('controles do simulador restauram o valor padrão por duplo clique', async () => {
  const simulator = await source('studio-simulator.js');
  const editor = await source('evora-editor.js');
  assert.match(simulator, /stage\.addEventListener\('dblclick'/);
  assert.match(simulator, /restaurada para o valor padrão/);
  assert.match(simulator, /imuDefaults=\{accel:\{x:0,y:0,z:1000\},gyro:\{x:0,y:0,z:0\}\}/);
  assert.match(editor, /axsim-devices\.sensors \.axsim-device\{--hub:#0f9f8c/);
});

test('tela cheia do simulador cobre o viewport acima da grade do editor', async () => {
  const editor = await source('evora-editor.js');
  assert.match(editor, /body\.axsim-fullscreen #programming \.axioma-simulator\.fullscreen/);
  assert.match(editor, /width:100vw!important;height:100dvh!important/);
  assert.match(editor, /z-index:1000000!important/);
  assert.match(editor, /body\.axsim-fullscreen #programming \.editor\{z-index:auto!important/);
});

test('servidor estático entrega a IDE e bloqueia travessia de diretório', async t => {
  const port = await availablePort();
  const server = spawn(process.execPath, ['dev-server.js'], {
    cwd: root,
    env: { ...process.env, AXIOMA_IDE_PORT: String(port) },
    stdio: 'ignore',
  });
  t.after(() => server.kill());

  const home = await waitForServer(port);
  assert.equal(home.status, 200);
  assert.match(home.body, /EVORA Studio/);

  const traversal = await request(port, '/..%2F..%2Fpackage.json');
  assert.equal(traversal.status, 403);
});
