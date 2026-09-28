import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function openNewProject(page) {
  await page.locator('#newFile').click();
  await expect(page.locator('#programming')).toHaveClass(/active/);
  await expect(page.locator('.blocklyDraggable')).toHaveCount(2);
}

test('cria um projeto com Início e Sempre afastados das bordas', async ({ page }) => {
  await openNewProject(page);
  const blocks = page.locator('.blocklyDraggable');
  await expect(blocks.nth(0)).toContainText('Início');
  await expect(blocks.nth(1)).toContainText('Sempre');

  const frame = await page.evaluate(() => {
    const start = document.querySelector('.blocklyDraggable');
    const toolbox = document.querySelector('.blocklyToolbox');
    const work = document.querySelector('#blocklyDiv');
    const startRect = start.getBoundingClientRect();
    const toolboxRect = toolbox.getBoundingClientRect();
    const workRect = work.getBoundingClientRect();
    return { leftMargin: Math.round(startRect.left - toolboxRect.right), topMargin: Math.round(startRect.top - workRect.top) };
  });
  expect(frame.leftMargin).toBeGreaterThanOrEqual(32);
  expect(frame.topMargin).toBeGreaterThanOrEqual(32);
});

test('alterna entre Blocos e Python sem remover o simulador', async ({ page }) => {
  await openNewProject(page);
  const simulator = page.locator('.axioma-simulator');
  await page.getByRole('button', { name: 'Python' }).click();
  await expect(page.locator('#programming')).toHaveAttribute('data-editor-view', 'python');
  await expect(page.locator('#codePanel')).toBeVisible();
  await expect(simulator).toBeVisible();
  await page.getByRole('button', { name: 'Blocos' }).click();
  await expect(page.locator('#programming')).toHaveAttribute('data-editor-view', 'blocks');
  await expect(page.locator('#blocklyDiv')).toBeVisible();
});

test('permite ajustar a largura do simulador por teclado', async ({ page }) => {
  await openNewProject(page);
  const splitter = page.locator('.editor-splitter');
  const simulator = page.locator('.axioma-simulator');
  await expect(splitter).toHaveAttribute('role', 'separator');
  await splitter.focus();
  await page.keyboard.press('End');
  const wide = await simulator.evaluate(element => Math.round(element.getBoundingClientRect().width));
  await page.keyboard.press('Home');
  const narrow = await simulator.evaluate(element => Math.round(element.getBoundingClientRect().width));
  expect(wide).toBeGreaterThan(narrow);
  await expect(splitter).toHaveAttribute('aria-valuenow', '300');
  expect(await page.evaluate(() => localStorage.getItem('evora-editor-simulator-width'))).toBe('300');
  await splitter.dblclick();
  const restored = Number(await splitter.getAttribute('aria-valuenow'));
  expect(restored).toBeGreaterThan(300);
  expect(await page.evaluate(() => localStorage.getItem('evora-editor-simulator-width'))).toBe(String(restored));

  const splitterBox = await splitter.boundingBox();
  if (!splitterBox) throw new Error('Divisor do editor não foi renderizado.');
  const beforeDrag = Number(await splitter.getAttribute('aria-valuenow'));
  await page.mouse.move(splitterBox.x + splitterBox.width / 2, splitterBox.y + splitterBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(splitterBox.x + splitterBox.width / 2 + 36, splitterBox.y + splitterBox.height / 2, { steps: 4 });
  await page.mouse.up();
  expect(Number(await splitter.getAttribute('aria-valuenow'))).toBeGreaterThan(beforeDrag);
});

test('monta o hash SHA-256 do pacote antes do envio', async ({ page }) => {
  await openNewProject(page);
  const info = await page.evaluate(() => window.axTransport.packageInfo('abc'));
  expect(info).toEqual({
    format: 'axioma-project-v1',
    entry: { size: 3, sha256: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
    assets: { audio: [], images: [] }
  });
});

test('abre Configurar acima do editor Blockly', async ({ page }) => {
  await openNewProject(page);
  const menu = page.locator('.editor-config-menu');
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');
  await expect(menu.locator('.editor-config-panel')).toBeVisible();
  await expect.poll(() => menu.locator('.editor-config-panel').evaluate(panel => Number(getComputedStyle(panel).zIndex))).toBeGreaterThanOrEqual(50);
});

test('ativa modo de alto contraste pelas Configurações da página inicial', async ({ page }) => {
  await page.locator('[data-open-settings]').click();
  await expect(page.locator('#settingsModal')).toHaveClass(/open/);
  const toggle = page.locator('[data-high-contrast]');
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/evora-high-contrast/);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('evora-high-contrast'))).toBe('true');
  const reducedMotion = page.locator('[data-reduced-motion]');
  await reducedMotion.click();
  await expect(page.locator('html')).toHaveClass(/evora-reduced-motion/);
  await expect(reducedMotion).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('evora-reduced-motion'))).toBe('true');
});

test('modal devolve o foco e fecha com Escape', async ({ page }) => {
  await openNewProject(page);
  const trigger = page.locator('#deviceBtn');
  await trigger.click();
  const modal = page.locator('#deviceModal');
  await expect(modal).toHaveClass(/open/);
  await expect(modal).toHaveAttribute('role', 'dialog');
  await page.keyboard.press('Escape');
  await expect(modal).not.toHaveClass(/open/);
  await expect(trigger).toBeFocused();
});

test('interações não selecionam texto e código permanece selecionável', async ({ page }) => {
  await openNewProject(page);
  const styles = await page.evaluate(() => ({
    simulator: getComputedStyle(document.querySelector('.axioma-simulator')).userSelect,
    run: getComputedStyle(document.querySelector('[data-sim-run]')).userSelect,
    code: getComputedStyle(document.querySelector('#code')).userSelect,
    title: getComputedStyle(document.querySelector('#fileTitle')).userSelect
  }));
  expect(styles).toEqual({ simulator: 'none', run: 'none', code: 'text', title: 'text' });
});

test('controles exibem foco visível durante navegação por teclado', async ({ page }) => {
  await openNewProject(page);
  await page.locator('#saveFile').focus();
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveCount(1);
  await expect.poll(() => focused.evaluate(element => ({
    style: getComputedStyle(element).outlineStyle,
    width: getComputedStyle(element).outlineWidth
  }))).toEqual({ style: 'solid', width: '3px' });
});

test('atalho de teclado pula diretamente ao conteúdo principal', async ({ page }) => {
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo principal' });
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#mainContent')).toBeFocused();
});

test('atalho de conteúdo inicia oculto já no carregamento', async ({ page }) => {
  await page.reload();
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo principal' });
  await expect.poll(() => skip.evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
  await expect(skip).not.toBeInViewport();
});

test('trilha registra a conclusão de uma aula disponível', async ({ page }) => {
  await page.locator('[data-evora-learn]').first().click();
  await page.locator('[data-learning-path-id="movement"]').click();
  const motor = page.locator('[data-lesson="motor"]');
  await motor.click();
  await page.getByRole('button', { name: 'Concluir aula' }).click();
  await expect(page.getByRole('button', { name: 'Marcar como não concluída' })).toBeVisible();
  await expect(page.locator('[data-lesson="motor"]')).toHaveClass(/completed/);
  await expect(page.locator('[data-lesson="motor"] .lesson-kind')).toHaveText('Concluída');
  await expect(page.locator('[data-learning-path-id="movement"] em')).toHaveText('1/2 concluídas');
  await expect(page.locator('[data-learning-path-id="movement"] [role="progressbar"]')).toHaveAttribute('aria-valuenow', '50');
});

test('trilha direciona para a próxima aula pedagógica disponível', async ({ page }) => {
  await page.locator('[data-evora-learn]').first().click();
  const nextCard = page.locator('[data-next-learning]');
  await expect(nextCard).toContainText('Próxima aula');
  await expect(nextCard).toContainText('Botões do hub');
  const continueLearning = page.locator('[data-continue-learning]');
  await expect(continueLearning).toHaveText('Continuar aula');
  await continueLearning.click();
  await expect(page.locator('#evoraLessonModal')).toHaveClass(/open/);
  await expect(page.locator('[data-lesson-title]')).toHaveText('Botões do hub');
});

test('filtros e busca aparecem somente no catálogo completo', async ({ page }) => {
  await page.locator('[data-evora-learn]').first().click();
  const toolbar = page.locator('[data-catalog-toolbar]');
  await expect(toolbar).toBeHidden();
  await page.getByRole('button', { name: 'Ver catálogo completo' }).click();
  await expect(toolbar).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voltar à trilha' })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar à trilha' }).click();
  await expect(toolbar).toBeHidden();
});

test('trilha preserva subtítulos das etapas e a margem da página inicial', async ({ page }) => {
  const homeLeft = await page.locator('.home-hero').evaluate(element => Math.round(element.getBoundingClientRect().left));
  await page.locator('[data-evora-learn]').first().click();
  await expect(page.getByText('Cada etapa reúne aulas curtas em uma ordem que prepara a próxima prática.')).toHaveCount(0);
  await page.locator('[data-learning-path-id="sensing"]').click();
  await expect(page.getByText('Leia o ambiente e transforme valores em comportamentos.')).toBeVisible();
  const learnLeft = await page.locator('[data-page="learn"] .catalog-hero').evaluate(element => Math.round(element.getBoundingClientRect().left));
  expect(learnLeft).toBe(homeLeft);
  await page.locator('[data-evora-examples]').first().click();
  await expect(page.getByRole('heading', { name: 'Projetos prontos' })).toBeVisible();
  const examplesLeft = await page.locator('[data-page="examples"] .catalog-hero').evaluate(element => Math.round(element.getBoundingClientRect().left));
  expect(examplesLeft).toBe(homeLeft);
});

test('conteúdo rola sem deslocar a navegação lateral', async ({ page }) => {
  await page.locator('[data-evora-learn]').first().click();
  const before = await page.locator('.home-nav').evaluate(element => Math.round(element.getBoundingClientRect().top));
  const scroll = await page.locator('#files .files').evaluate(element => {
    element.scrollTop = 240;
    return { scrollTop: element.scrollTop, documentTop: document.documentElement.scrollTop };
  });
  expect(scroll.scrollTop).toBeGreaterThan(0);
  expect(scroll.documentTop).toBe(0);
  const after = await page.locator('.home-nav').evaluate(element => Math.round(element.getBoundingClientRect().top));
  expect(after).toBe(before);
});

test('projeto pronto expõe a estrutura do manual sem publicar uma montagem inexistente', async ({ page }) => {
  await page.locator('[data-evora-examples]').first().click();
  await page.locator('[data-assembly-manual="rover"]').click();
  const manual = page.locator('#assemblyManualModal');
  await expect(manual).toHaveClass(/open/);
  await expect(manual).toContainText('O espaço do manual está preparado');
  await expect(manual).toContainText('Capa do robô');
  await expect(manual).toContainText('Passos ilustrados');
});

test('monitor de leituras mostra valores e histórico das portas do hub', async ({ page }) => {
  await openNewProject(page);
  await page.getByRole('button', { name: 'Leituras' }).click();
  const monitor = page.locator('#liveMonitorModal');
  await expect(monitor).toContainText('Conecte um hub');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('evora:live-sensors', {
    detail: { at: Date.now(), ports: [{ port: 1, type: 'line', value: 42 }, { port: 2, type: 'touch', value: true }] }
  })));
  await expect(monitor).toContainText('P1 · Sensor de linha');
  await expect(monitor).toContainText('42');
  await expect(monitor).toContainText('Pressionado');
  await expect(monitor.locator('.live-monitor-card')).toHaveCount(2);
});

test('projeto pronto apresenta desafio com critérios atualizados pelos blocos', async ({ page }) => {
  await page.locator('[data-evora-examples]').first().click();
  await page.locator('[data-install-example="rover"]').click();
  await expect(page.locator('#programming')).toHaveClass(/active/);
  await page.getByRole('button', { name: 'Desafio' }).click();
  const challenge = page.locator('#challengeModal');
  await expect(challenge).toHaveClass(/open/);
  await expect(challenge).toContainText('3/3 critérios atendidos');
  await expect(challenge.locator('.challenge-check.done')).toHaveCount(3);
});

test('revisão do projeto diferencia pendências de sugestões antes do envio', async ({ page }) => {
  await openNewProject(page);
  await page.getByRole('button', { name: 'Revisar projeto' }).click();
  const review = page.locator('#preflightModal');
  await expect(review).toHaveClass(/open/);
  await expect(review).toContainText('O bloco Início ainda não contém nenhuma ação.');
  await expect(review).toContainText('Há um bloco Sempre sem ações internas.');
  await expect(review).toContainText('O projeto pode ser executado');
});

test('aula abre um projeto contextualizado e o hero não seleciona texto', async ({ page }) => {
  await expect.poll(() => page.locator('.home-hero').evaluate(element => getComputedStyle(element).userSelect)).toBe('none');
  await page.locator('[data-evora-learn]').first().click();
  const spacing = await page.evaluate(() => {
    const title = document.querySelector('.lesson-catalog-heading');
    const grid = document.querySelector('[data-lesson-grid]');
    return Math.round(grid.getBoundingClientRect().top - title.getBoundingClientRect().bottom);
  });
  expect(spacing).toBeGreaterThanOrEqual(18);
  await page.locator('[data-learning-path-id="sensing"]').click();
  await page.locator('[data-lesson="touch"]').click();
  await page.getByRole('button', { name: 'Começar projeto' }).click();
  await expect(page.locator('#programming')).toHaveClass(/active/);
  await expect(page.locator('#fileTitle')).toHaveValue('atividade-touch');
  await expect(page.locator('.lesson-context-chip')).toContainText('Aula: Sensor de toque');
});

test('botão físico do hub responde a Enter e é solto ao liberar a tecla', async ({ page }) => {
  await openNewProject(page);
  const left = page.locator('[data-hub-button="left"]');
  await left.focus();
  await page.keyboard.down('Enter');
  await expect(left).toHaveClass(/pressed/);
  await expect(left).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.up('Enter');
  await expect(left).not.toHaveClass(/pressed/);
  await expect(left).toHaveAttribute('aria-pressed', 'false');
});

test('controles de sensor permanecem estáveis durante clique e arraste', async ({ page }) => {
  await openNewProject(page);
  await page.locator('.editor-config-menu summary').click();
  await page.locator('#portsBtn').click();
  await page.locator('[data-port="0"]').selectOption('touch');
  await page.locator('[data-port="1"]').selectOption('line');
  await page.locator('#savePorts').click();
  const touch = page.locator('[data-sensor="1:1"]');
  const line = page.locator('[data-sensor="1:2"]');
  await expect(touch).toBeVisible();
  await expect(line).toBeVisible();
  await expect(touch).toHaveAttribute('aria-label', 'Sensor de toque na porta 1: pressionado');
  await expect(line).toHaveAttribute('aria-label', 'Sensor de linha na porta 2: valor');
  await touch.check();
  await expect(touch).toBeChecked();
  await line.fill('72');
  await expect(line).toHaveValue('72');
  await expect(line).toHaveAttribute('aria-valuetext', '72%');
  await expect(line.locator('xpath=following-sibling::output')).toHaveText('72%');
  await line.dblclick();
  await expect(line).toHaveValue('35');
  await expect(line.locator('xpath=following-sibling::output')).toHaveText('35%');
});

test('Motores possui cor própria e blocos sem contorno preto', async ({ page }) => {
  await openNewProject(page);
  await page.getByRole('treeitem', { name: 'Motores' }).click();
  const motorPath = page.locator('.blocklyFlyout .blocklyDraggable .blocklyPath').first();
  const motor = await motorPath.evaluate(path => ({ fill: getComputedStyle(path).fill, stroke: getComputedStyle(path).stroke }));
  await page.getByRole('treeitem', { name: 'Movimento' }).click();
  const movement = await page.locator('.blocklyFlyout .blocklyDraggable .blocklyPath').first().evaluate(path => getComputedStyle(path).fill);
  expect(motor.fill).not.toBe(movement);
  expect(motor.stroke).toBe('none');
});

test('toolbox Blockly apresenta categorias como cartões coloridos', async ({ page }) => {
  await openNewProject(page);
  const motor = page.getByRole('treeitem', { name: 'Motores' });
  await expect(motor).toHaveClass(/evora-category/);
  const card = await motor.evaluate(element => ({
    height: Math.round(element.getBoundingClientRect().height),
    radius: getComputedStyle(element).borderRadius,
    background: getComputedStyle(element).backgroundColor,
    marker: getComputedStyle(element, '::before').display,
    cursor: getComputedStyle(element).cursor,
    slot: Boolean(element.querySelector('.evora-category-icon-slot')),
    innerBackground: getComputedStyle(element.querySelector('.blocklyToolboxCategory')).backgroundColor,
    innerBorderLeft: getComputedStyle(element.querySelector('.blocklyToolboxCategory')).borderLeftWidth,
    classes: element.className
  }));
  expect(card.height).toBeGreaterThanOrEqual(46);
  expect(card.radius).toBe('8px');
  expect(card.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(card.marker).toBe('none');
  expect(card.cursor).toBe('pointer');
  expect(card.slot).toBeTruthy();
  expect(card.innerBackground).toBe('rgba(0, 0, 0, 0)');
  expect(card.innerBorderLeft).toBe('0px');

  await motor.click();
  await expect(motor).toHaveAttribute('aria-selected', 'true');
  const selected = await motor.evaluate(element => ({
    background: getComputedStyle(element).backgroundColor,
    innerBackground: getComputedStyle(element.querySelector('.blocklyToolboxCategory')).backgroundColor,
    innerBorderLeft: getComputedStyle(element.querySelector('.blocklyToolboxCategory')).borderLeftWidth
  }));
  expect(selected.background).toBe('rgb(255, 255, 255)');
  expect(selected.innerBackground).toBe('rgba(0, 0, 0, 0)');
  expect(selected.innerBorderLeft).toBe('0px');

  const sensors = page.getByRole('treeitem', { name: 'Sensores' });
  await sensors.focus();
  await expect(sensors).toBeFocused();
  const focusOutline = await sensors.evaluate(element => getComputedStyle(element).outlineStyle);
  expect(focusOutline).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(sensors).toHaveAttribute('aria-selected', 'true');
});

test('perfil Base mantém encoder fora da caixa de blocos', async ({ page }) => {
  await openNewProject(page);
  const encoderBlocks = await page.evaluate(() =>
    [...document.querySelectorAll('#toolbox block')]
      .filter(block => block.getAttribute('type').startsWith('axioma_encoder_'))
      .length
  );
  expect(encoderBlocks).toBe(0);
});

test('IMU virtual avançado responde aos seis eixos', async ({ page }) => {
  await openNewProject(page);
  await expect(page.locator('[data-imu-hub="1"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Avançado' }).click();
  const imu = page.locator('[data-imu-hub="1"]');
  await expect(imu).toBeVisible();
  const accelX = imu.locator('[data-imu="1:accel:x"]');
  const gyroZ = imu.locator('[data-imu="1:gyro:z"]');
  await accelX.fill('420');
  await expect(accelX.locator('xpath=following-sibling::output')).toHaveText('420mg');
  await expect(accelX).toHaveAttribute('aria-valuetext', '420mg');
  await gyroZ.fill('45');
  await expect(gyroZ.locator('xpath=following-sibling::output')).toHaveText('45°');
  await expect(gyroZ).toHaveAttribute('aria-valuetext', '45°');
  await gyroZ.dblclick();
  await expect(gyroZ).toHaveValue('0');
  await expect(gyroZ).toHaveAttribute('min', '-180');
  await expect(gyroZ).toHaveAttribute('max', '180');
  await expect(imu.getByText('Acelerômetro')).toBeVisible();
  await expect(imu.getByText('Giroscópio')).toBeVisible();
  await expect(imu.locator('[data-imu^="1:accel:"]')).toHaveCount(3);
  await expect(imu.locator('[data-imu^="1:gyro:"]')).toHaveCount(3);
  await expect(accelX).toHaveAttribute('aria-label', 'Acelerômetro eixo X');
  await expect(gyroZ).toHaveAttribute('aria-label', 'Giroscópio eixo Z');
});

test('inclinação do IMU atualiza um programa contínuo sem reconstruir seu controle', async ({ page }) => {
  await openNewProject(page);
  await page.getByRole('button', { name: 'Avançado' }).click();
  await page.evaluate(() => {
    const forever = workspace.getAllBlocks(false).find(block => block.type === 'axioma_forever');
    const conditional = workspace.newBlock('controls_if');
    const tilted = workspace.newBlock('axioma_imu_tilted');
    const motor = workspace.newBlock('axioma_motor_speed');
    motor.setFieldValue('1', 'PORT');
    motor.setFieldValue('60', 'SPEED');
    forever.getInput('DO').connection.connect(conditional.previousConnection);
    conditional.getInput('IF0').connection.connect(tilted.outputConnection);
    conditional.getInput('DO0').connection.connect(motor.previousConnection);
  });
  await page.locator('[data-sim-run]').click();
  const accelX = page.locator('[data-imu="1:accel:x"]');
  await accelX.fill('600');
  await expect(page.locator('.axsim-motor.axsim-running')).toBeVisible();
  await expect(accelX).toHaveValue('600');
});

test('simulador respeita movimento reduzido sem ocultar o estado do motor', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await openNewProject(page);
  await page.evaluate(() => {
    const start = workspace.getAllBlocks(false).find(block => block.type === 'axioma_start');
    const motor = workspace.newBlock('axioma_motor_speed');
    motor.setFieldValue('1', 'PORT');
    motor.setFieldValue('60', 'SPEED');
    start.getInput('STACK').connection.connect(motor.previousConnection);
  });
  await page.locator('[data-sim-run]').click();
  await expect(page.locator('.axsim-motor.axsim-running')).toBeVisible();
  await expect.poll(() => page.locator('.axsim-motor .shaft').evaluate(shaft => shaft.getAnimations().length)).toBe(0);
});

test('simulador organiza quatro motores em fluxo rolável', async ({ page }) => {
  await openNewProject(page);
  await page.getByRole('treeitem', { name: 'Motores' }).click();
  await page.getByRole('option', { name: 'parar todos os motores' }).click({ force: true });
  const motors = page.locator('.axsim-devices.actuators');
  await expect(motors.locator('.axsim-device')).toHaveCount(4);
  await expect(motors.locator('.axsim-device-name')).toHaveText(['Parado', 'Parado', 'Parado', 'Parado']);
  const layout = await motors.evaluate(element => {
    const hub = document.querySelector('.axsim-hub-wrap');
    const motorRect = element.getBoundingClientRect();
    return { position: getComputedStyle(element).position, gap: Math.round(hub.getBoundingClientRect().top - motorRect.bottom) };
  });
  expect(layout.position).toBe('static');
  expect(layout.gap).toBeGreaterThanOrEqual(20);
});

test('abre e fecha o simulador em tela cheia', async ({ page }) => {
  await openNewProject(page);
  const simulator = page.locator('.axioma-simulator');
  await simulator.locator('[data-sim-full]').click();
  await expect(simulator).toHaveClass(/fullscreen/);
  await expect(page.locator('body')).toHaveClass(/axsim-fullscreen/);
  const size = await simulator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height), zIndex: getComputedStyle(element).zIndex };
  });
  expect(size.width).toBeGreaterThanOrEqual(1100);
  expect(size.height).toBeGreaterThanOrEqual(700);
  expect(Number(size.zIndex)).toBeGreaterThanOrEqual(1000000);
  await page.keyboard.press('Escape');
  await expect(simulator).not.toHaveClass(/fullscreen/);
  await expect(page.locator('body')).not.toHaveClass(/axsim-fullscreen/);
});

test('mantém as ações de projeto e envio acessíveis no editor', async ({ page }) => {
  await openNewProject(page);
  await expect(page.getByRole('button', { name: 'Salvar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Baixar .py' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar ao hub' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Hub não conectado|Hub desconectado/ })).toHaveCount(1);
});

test('monitor multi-hub libera retomar e iniciar apenas no estado seguro', async ({ page }) => {
  let report = {
    enabled: true, link_state: 'online', protocol_version: 1,
    nodes: [{ id: 2, compatible: true, duplicate: false }],
    deployment: { state: 'failed' }, deployment_session: { state: 'failed' }, deployment_results: [],
    actions: { resume: true, start: false, reason: 'resume_available' }
  };
  await page.route('**/api/hubs', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(report) }));
  await openNewProject(page);
  await page.locator('.editor-config-menu summary').click();
  await page.getByRole('button', { name: 'Multi-hub' }).click();
  await page.locator('#multiHubEnabled').check();
  await page.getByRole('button', { name: '+ Adicionar hub' }).click();
  await page.getByRole('button', { name: 'Verificar agora' }).click();
  await expect(page.getByRole('button', { name: 'Retomar envio' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Iniciar sincronizado' })).toBeDisabled();

  report = {
    ...report, deployment: { state: 'ready' }, deployment_session: { state: 'queued' },
    deployment_results: [{ package_kind: 2, state: 'ready', target: 2 }],
    actions: { resume: false, start: true, reason: 'ready_to_start' }
  };
  await page.getByRole('button', { name: 'Verificar agora' }).click();
  await expect(page.getByRole('button', { name: 'Retomar envio' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Iniciar sincronizado' })).toBeEnabled();
  await expect(page.locator('#hubMonitorSummary')).toContainText('Todos os hubs confirmaram');
});
