/* Identidade visual, páginas e conteúdo educacional da EVORA Studio. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, className = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  };

  const lessons = [
    { id: 'motor', category: 'actuator', mark: 'MO', title: 'Motor DC', summary: 'Velocidade, sentido, tempo, freio e roda livre.', level: 'Iniciante', time: '12 min', requires: '1 motor na porta A', goal: 'Fazer o motor girar com controle e terminar em uma condição segura.', steps: ['Conecte o motor com a alimentação desligada.', 'Escolha uma velocidade baixa para o primeiro teste.', 'Execute por tempo limitado e finalize com parar.', 'Compare freio e roda livre com a roda suspensa.'], blocks: ['motor velocidade', 'motor por tempo', 'parar motor', 'parar todos'], activity: 'Faça o motor girar por dois segundos a 40% e parar com freio.', challenge: 'Crie uma sequência de avanço e recuo sem ultrapassar 60%.' },
    { id: 'servo', category: 'actuator', mark: 'SV', title: 'Servo', summary: 'Posicione mecanismos usando ângulos de 0° a 180°.', level: 'Iniciante', time: '10 min', requires: '1 servo', goal: 'Mover um mecanismo para posições previsíveis sem forçar seus limites.', steps: ['Posicione o mecanismo no centro antes de ligar.', 'Comece em 90°.', 'Teste 45° e 135°.', 'Observe se a estrutura chega ao fim mecânico antes do servo.'], blocks: ['servo ângulo', 'esperar'], activity: 'Crie um ponteiro que alterna entre 45° e 135°.', challenge: 'Monte uma cancela que abre, espera dois segundos e fecha.' },
    { id: 'display', category: 'actuator', mark: 'DP', title: 'Display', summary: 'Mostre imagens, estados e informações do projeto.', level: 'Iniciante', time: '10 min', requires: 'Display interno', goal: 'Usar feedback visual para comunicar o estado do robô.', steps: ['Adicione uma imagem à biblioteca de mídia.', 'Insira o bloco mostrar imagem.', 'Aguarde antes de trocar o conteúdo.', 'Limpe o display ao finalizar.'], blocks: ['mostrar imagem', 'limpar tela', 'esperar'], activity: 'Mostre uma imagem de início e limpe a tela após três segundos.', challenge: 'Crie telas diferentes para pronto, executando e concluído.' },
    { id: 'speaker', category: 'actuator', mark: 'AU', title: 'Alto-falante', summary: 'Crie alertas, notas e reprodução de áudio.', level: 'Iniciante', time: '8 min', requires: 'Alto-falante interno', goal: 'Associar sons curtos a eventos importantes do programa.', steps: ['Comece com um tom de curta duração.', 'Compare frequências graves e agudas.', 'Evite ciclos de som sem espera.', 'Use áudio importado somente após conferir o formato.'], blocks: ['tocar tom', 'tocar áudio', 'esperar'], activity: 'Toque três frequências em ordem crescente.', challenge: 'Crie um som diferente para sucesso e erro.' },
    { id: 'hub-buttons', category: 'hub', mark: 'BT', title: 'Botões do hub', summary: 'Inicie ações e menus usando os botões físicos.', level: 'Iniciante', time: '9 min', requires: 'Hub EVORA', goal: 'Responder a uma entrada digital integrada ao hub.', steps: ['Escolha o botão central.', 'Use esperar botão para pausar o fluxo.', 'Adicione uma ação depois da espera.', 'Teste pressionar e soltar no simulador.'], blocks: ['esperar botão', 'botão está pressionado?'], activity: 'Espere o botão central e toque um som.', challenge: 'Use os botões esquerdo e direito para escolher comportamentos.' },
    { id: 'touch', category: 'sensor', mark: 'TO', title: 'Sensor de toque', summary: 'Detecte contato, colisão ou fim de curso.', level: 'Iniciante', time: '12 min', requires: 'Sensor de toque em uma porta', goal: 'Ler um estado verdadeiro/falso e reagir sem movimento perigoso.', steps: ['Configure a porta como Botão de toque.', 'Confira a leitura ao vivo.', 'Use esperar até que o sensor seja pressionado.', 'Pare os motores antes de emitir o alerta.'], blocks: ['sensor de toque', 'esperar até', 'parar todos'], activity: 'Faça um robô parar quando encostar em um obstáculo.', challenge: 'Depois do toque, recue por meio segundo e pare novamente.' },
    { id: 'line', category: 'sensor', mark: 'LI', title: 'Sensor de linha', summary: 'Interprete contraste como porcentagem analógica.', level: 'Intermediário', time: '16 min', requires: 'Sensor de linha', goal: 'Escolher um limiar a partir de medições reais.', steps: ['Configure a porta como Sensor de linha.', 'Observe valores sobre claro e escuro.', 'Calcule um limiar entre as duas leituras.', 'Use uma condição para mudar o movimento.'], blocks: ['sensor analógico', 'se/senão', 'comparação'], activity: 'Pare o robô quando a leitura ficar abaixo do limiar.', challenge: 'Controle motores esquerdo e direito para acompanhar a borda da linha.' },
    { id: 'light', category: 'sensor', mark: 'LU', title: 'Sensor de luz', summary: 'Meça mudanças de iluminação do ambiente.', level: 'Iniciante', time: '12 min', requires: 'Sensor de luz', goal: 'Converter uma leitura analógica em uma decisão simples.', steps: ['Configure a porta como Sensor de luz.', 'Registre valores em claro e escuro.', 'Escolha um limiar com margem.', 'Teste sem alterar a posição do sensor.'], blocks: ['sensor analógico', 'comparação', 'se/senão'], activity: 'Toque um alerta quando o ambiente escurecer.', challenge: 'Crie três faixas: escuro, normal e muito claro.' },
    { id: 'pot', category: 'sensor', mark: 'PO', title: 'Potenciômetro', summary: 'Use uma entrada ajustável para controlar valores.', level: 'Iniciante', time: '10 min', requires: 'Potenciômetro', goal: 'Mapear uma entrada analógica para uma saída controlada.', steps: ['Configure a porta como Potenciômetro.', 'Gire até os limites e observe a leitura.', 'Restrinja o valor para uma faixa segura.', 'Use a leitura para definir uma ação.'], blocks: ['sensor analógico', 'restringir valor', 'motor velocidade'], activity: 'Controle a velocidade de um motor com o potenciômetro.', challenge: 'Reserve uma zona central para manter o motor parado.' },
    { id: 'imu', category: 'sensor', mark: 'IM', title: 'IMU — movimento', summary: 'Leia aceleração, giroscópio e inclinação do hub.', level: 'Intermediário', time: '15 min', requires: 'IMU interna', goal: 'Reconhecer orientação e movimento sem um sensor externo.', steps: ['Mantenha o hub parado para observar o valor inicial.', 'Leia um eixo por vez.', 'Incline lentamente e compare os eixos.', 'Use tolerância para evitar oscilações.'], blocks: ['aceleração', 'giroscópio', 'está inclinado?', 'ângulo de guinada'], activity: 'Toque um alerta quando o hub for inclinado.', challenge: 'Crie um controle por gesto com duas direções.' },
    { id: 'battery', category: 'hub', mark: 'BA', title: 'Bateria', summary: 'Monitore energia e planeje uma parada segura.', level: 'Iniciante', time: '8 min', requires: 'Hub EVORA', goal: 'Evitar executar uma tarefa longa com carga insuficiente.', steps: ['Leia o nível de bateria.', 'Defina um limite conservador.', 'Avise antes de iniciar os motores.', 'Pare atuadores se o nível ficar crítico.'], blocks: ['bateria (%)', 'comparação', 'se/senão', 'parar todos'], activity: 'Mostre um alerta quando a bateria estiver abaixo de 25%.', challenge: 'Impeça o início do programa abaixo do limite.' },
    { id: 'color', category: 'sensor', mark: 'CO', title: 'Sensor de cor', summary: 'Reconheça cores e intensidade refletida.', level: 'Intermediário', time: 'Em breve', requires: 'CI e driver ainda não definidos', status: 'pending', goal: 'Distinguir cores depois da seleção e validação do sensor oficial.', steps: ['Selecionar o CI do sensor.', 'Validar endereço e driver I²C.', 'Calibrar com iluminação real.', 'Liberar blocos executáveis somente depois da bancada.'], blocks: ['sensor de cor', 'luz refletida'], activity: 'Conte objetos por cor.', challenge: 'Criar um classificador de peças.' },
    { id: 'distance', category: 'sensor', mark: 'DI', title: 'Sensor de distância', summary: 'Detecte obstáculos e estime proximidade.', level: 'Intermediário', time: 'Em breve', requires: 'CI e driver ainda não definidos', status: 'pending', goal: 'Medir distância depois da seleção e validação do sensor oficial.', steps: ['Selecionar o modelo do sensor.', 'Definir alcance e unidade.', 'Validar ruído e objetos difíceis.', 'Liberar o bloco após a bancada.'], blocks: ['distância em cm', 'comparação'], activity: 'Pare antes de um obstáculo.', challenge: 'Mantenha distância constante de uma parede.' }
  ];

  const learningPath = [
    { id: 'first-contact', number: '01', title: 'Primeiro contato', summary: 'Conheça o hub, dê comandos simples e veja uma resposta imediata.', lessons: ['hub-buttons', 'display', 'speaker'] },
    { id: 'movement', number: '02', title: 'Movimento controlado', summary: 'Faça mecanismos se moverem com velocidade, tempo e posições seguras.', lessons: ['motor', 'servo'] },
    { id: 'sensing', number: '03', title: 'Sensores e decisões', summary: 'Leia o ambiente e transforme valores em comportamentos.', lessons: ['touch', 'light', 'pot'] },
    { id: 'robot-control', number: '04', title: 'Controle do robô', summary: 'Combine movimento, orientação e energia para resolver percursos.', lessons: ['line', 'imu', 'battery'] },
    { id: 'extension', number: '05', title: 'Explorar e ampliar', summary: 'Planeje recursos avançados que entram após validação do hardware.', lessons: ['color', 'distance'] }
  ];
  const progressKey = 'evora-learning-progress-v1';
  const completedLessons = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem(progressKey) || '[]');
      return new Set(Array.isArray(stored) ? stored.filter(id => lessons.some(item => item.id === id && item.status !== 'pending')) : []);
    } catch { return new Set(); }
  })();
  const lessonCompleted = id => completedLessons.has(id);
  const saveLessonProgress = () => localStorage.setItem(progressKey, JSON.stringify([...completedLessons].sort()));
  const toggleLessonProgress = id => {
    if (lessonCompleted(id)) completedLessons.delete(id);
    else completedLessons.add(id);
    saveLessonProgress();
  };

  const filesRoot = $('#files .files');
  if (!filesRoot) return;
  const learningStyle = document.createElement('style');
  learningStyle.textContent = '.learning-next-card{align-items:center;background:linear-gradient(135deg,#ecfdf5,#f0fdf4);border:1px solid #86efac;border-radius:16px;display:flex;gap:16px;justify-content:space-between;margin:18px 0;padding:18px 20px}.learning-next-card-copy{display:grid;gap:3px}.learning-next-card-copy span{color:#047857;font-size:12px;font-weight:800;text-transform:uppercase}.learning-next-card-copy h2{margin:0}.learning-next-card-copy p{color:#475569;margin:0}.learning-next-card .btn{background:#059669;border-color:#059669;color:#fff}.learning-next-card.done{background:#f8fafc;border-color:#d0d5dd}.learning-next-card.done .btn{background:#fff;border-color:#d0d5dd;color:#475569}.lesson-card.completed{background:#f0fdf4;border-color:#86efac}.lesson-card.completed .lesson-kind{background:#d1fae5;color:#047857}@media(max-width:640px){.learning-next-card{align-items:flex-start;flex-direction:column}}.learning-path-progress{background:#dbeafe;border-radius:999px;display:block;height:6px;margin-top:7px;overflow:hidden}.learning-path-progress i{background:#2563eb;display:block;height:100%;transition:width .2s ease}.learning-path-step.active .learning-path-progress i{background:#8b5cf6}';
  document.head.appendChild(learningStyle);
  const homePage = make('div', 'evora-page evora-home-page');
  homePage.dataset.page = 'home';
  while (filesRoot.firstChild) homePage.appendChild(filesRoot.firstChild);
  filesRoot.appendChild(homePage);

  const learnPage = make('div', 'evora-page evora-catalog-page');
  learnPage.dataset.page = 'learn';
  learnPage.hidden = true;
  learnPage.innerHTML = `<header class="catalog-hero learn-hero"><div><h1>Trilha de aprendizagem</h1></div><div class="catalog-stat"><strong>${learningPath.length}</strong><span>etapas</span></div></header><section class="learning-next-card" data-next-learning aria-live="polite"></section><section class="learning-path-section" aria-labelledby="learning-path-title"><div class="learning-path-heading"><h2 id="learning-path-title">Avance no seu ritmo</h2><button class="text-button" type="button" data-path-all>Ver catálogo completo</button></div><ol class="learning-path" data-learning-path></ol></section><div class="lesson-catalog-heading"><h2 data-lessons-title></h2></div><div class="catalog-toolbar" data-catalog-toolbar hidden><div class="catalog-tabs" role="tablist" aria-label="Filtrar aulas do catálogo"><button class="active" data-lesson-filter="all">Todos</button><button data-lesson-filter="actuator">Atuadores</button><button data-lesson-filter="sensor">Sensores</button><button data-lesson-filter="hub">Hub</button></div><label class="catalog-search"><span class="visually-hidden">Buscar</span><input type="search" placeholder="Buscar componente" aria-label="Buscar componente"></label></div><div class="lesson-grid" data-lesson-grid></div>`;
  filesRoot.appendChild(learnPage);

  const examplesPage = make('div', 'evora-page evora-catalog-page');
  examplesPage.dataset.page = 'examples';
  examplesPage.hidden = true;
  examplesPage.innerHTML = `<header class="catalog-hero examples-hero"><div><h1>Projetos prontos</h1></div><div class="catalog-stat"><strong>${(window.EVORA_PROJECT_EXAMPLES || []).length}</strong><span>projetos</span></div></header><div class="robot-grid" data-robot-grid></div>`;
  filesRoot.appendChild(examplesPage);

  const lessonModal = make('div', 'backdrop evora-lesson-modal');
  lessonModal.id = 'evoraLessonModal';
  lessonModal.innerHTML = '<div class="modal lesson-modal-card"><div class="mhead"><div><h2 data-lesson-title></h2></div><div class="spacer"></div><button class="btn secondary" type="button" data-close-lesson>Fechar</button></div><div class="mbody" data-lesson-body></div></div>';
  document.body.appendChild(lessonModal);
  $('[data-close-lesson]', lessonModal).onclick = () => lessonModal.classList.remove('open');
  lessonModal.addEventListener('click', event => { if (event.target === lessonModal) lessonModal.classList.remove('open'); });

  const lessonCategory = { actuator: 'Atuador', sensor: 'Sensor', hub: 'Recurso do hub' };
  const openLesson = id => {
    const item = lessons.find(lesson => lesson.id === id);
    if (!item) return;
    $('[data-lesson-title]', lessonModal).textContent = item.title;
    const progressAction = item.status === 'pending' ? '' : `<button class="btn secondary" type="button" data-toggle-lesson aria-pressed="${lessonCompleted(item.id)}">${lessonCompleted(item.id) ? 'Marcar como não concluída' : 'Concluir aula'}</button>`;
    $('[data-lesson-body]', lessonModal).innerHTML = `<div class="lesson-overview"><span class="lesson-symbol ${item.category}" data-icon="${item.id}" aria-hidden="true">${item.mark}</span><div><span>${lessonCategory[item.category]} · ${item.level} · ${item.time}</span><p>${item.summary}</p></div></div>${item.status === 'pending' ? '<div class="lesson-warning"><b>Planejado, ainda não executável.</b> Esta trilha depende da escolha do sensor, do driver e da validação física.</div>' : ''}<div class="lesson-content-grid"><section><h3>Objetivo</h3><p>${item.goal}</p><h3>Você vai precisar</h3><p>${item.requires}</p><h3>Blocos usados</h3><div class="block-pills">${item.blocks.map(block => `<span>${block}</span>`).join('')}</div></section><section><h3>Passo a passo</h3><ol>${item.steps.map(step => `<li>${step}</li>`).join('')}</ol></section></div><section class="lesson-activity"><span>Atividade</span><h3>${item.activity}</h3><p><b>Desafio:</b> ${item.challenge}</p></section><div class="lesson-actions"><button class="btn secondary" type="button" data-back-lessons>Voltar às aulas</button>${progressAction}${item.status === 'pending' ? '' : '<button class="btn primary" type="button" data-start-blank>Começar projeto</button>'}</div>`;
    $('[data-back-lessons]', lessonModal).onclick = () => lessonModal.classList.remove('open');
    const toggle = $('[data-toggle-lesson]', lessonModal);
    if (toggle) toggle.onclick = () => { toggleLessonProgress(item.id); renderPath(); renderLessons(); renderContinueLearning(); openLesson(item.id); };
    const start = $('[data-start-blank]', lessonModal);
    if (start) start.onclick = () => {
      lessonModal.classList.remove('open');
      if (window.evoraStartLessonProject) window.evoraStartLessonProject(item);
      else $('#newFile')?.click();
    };
    lessonModal.classList.add('open');
  };
  let activePathId = learningPath[0].id;
  let catalogMode = false;
  let activeFilter = 'all';
  let activeQuery = '';
  const selectedPath = () => learningPath.find(path => path.id === activePathId);
  const resetCatalogControls = () => {
    activeFilter = 'all';
    activeQuery = '';
    $('.catalog-search input', learnPage).value = '';
    $$('[data-lesson-filter]', learnPage).forEach(item => item.classList.toggle('active', item.dataset.lessonFilter === 'all'));
  };
  const nextLesson = () => learningPath.flatMap(path => path.lessons).map(id => lessons.find(item => item.id === id)).find(item => item?.status !== 'pending' && !lessonCompleted(item.id));
  const renderContinueLearning = () => {
    const card = $('[data-next-learning]', learnPage);
    const next = nextLesson();
    card.classList.toggle('done', !next);
    card.innerHTML = next ? `<div class="learning-next-card-copy"><span>Próxima aula</span><h2>${next.title}</h2><p>${next.summary}</p></div><button class="btn primary" type="button" data-continue-learning>Continuar aula</button>` : '<div class="learning-next-card-copy"><span>Trilha concluída</span><h2>Você concluiu as aulas disponíveis.</h2><p>Explore o catálogo ou comece um projeto próprio para aplicar o que aprendeu.</p></div><button class="btn secondary" type="button" disabled>Concluída</button>';
    const button = $('[data-continue-learning]', card);
    if (!button) return;
    button.onclick = () => {
      activePathId = learningPath.find(path => path.lessons.includes(next.id))?.id || '';
      catalogMode = false;
      resetCatalogControls();
      renderPath(); renderLessons(); openLesson(next.id);
    };
  };
  const renderPath = () => {
    const pathList = $('[data-learning-path]', learnPage);
    pathList.innerHTML = learningPath.map(path => { const available = path.lessons.filter(id => lessons.find(item => item.id === id)?.status !== 'pending'); const completed = available.filter(lessonCompleted).length, percent = available.length ? Math.round(completed * 100 / available.length) : 0; return `<li><button class="learning-path-step ${path.id === activePathId ? 'active' : ''}" type="button" data-learning-path-id="${path.id}" aria-pressed="${path.id === activePathId}"><span class="learning-path-number">${path.number}</span><span class="learning-path-copy"><strong>${path.title}</strong><small>${path.summary}</small><em>${available.length ? `${completed}/${available.length} concluídas` : 'planejada'}</em><span class="learning-path-progress" role="progressbar" aria-label="Progresso da etapa ${path.number}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><i style="width:${percent}%"></i></span></span></button></li>`; }).join('');
    $$('[data-learning-path-id]', pathList).forEach(button => button.onclick = () => {
      activePathId = button.dataset.learningPathId;
      catalogMode = false;
      resetCatalogControls();
      renderPath();
      renderLessons();
    });
  };
  const renderLessons = () => {
    const normalized = activeQuery.trim().toLocaleLowerCase('pt-BR');
    const path = catalogMode ? null : selectedPath();
    const source = path ? path.lessons.map(id => lessons.find(item => item.id === id)).filter(Boolean) : lessons;
    const selected = source.filter(item => (!catalogMode || activeFilter === 'all' || item.category === activeFilter) && (!catalogMode || !normalized || `${item.title} ${item.summary}`.toLocaleLowerCase('pt-BR').includes(normalized)));
    const grid = $('[data-lesson-grid]', learnPage);
    $('[data-catalog-toolbar]', learnPage).hidden = !catalogMode;
    $('[data-lessons-title]', learnPage).textContent = path ? `Etapa ${path.number}: ${path.title}` : 'Todas as aulas';
    grid.innerHTML = selected.map(item => `<article class="lesson-card ${item.status === 'pending' ? 'pending' : ''} ${lessonCompleted(item.id) ? 'completed' : ''}" data-lesson="${item.id}"><div class="lesson-card-top"><span class="lesson-symbol ${item.category}" data-icon="${item.id}" aria-hidden="true">${item.mark}</span><span class="lesson-kind">${lessonCompleted(item.id) ? 'Concluída' : lessonCategory[item.category]}</span></div><h2>${item.title}</h2><p>${item.summary}</p><div class="lesson-meta"><span>${item.level}</span><span>${item.time}</span></div><button class="btn ${item.status === 'pending' ? 'secondary' : 'primary'}" type="button">${item.status === 'pending' ? 'Ver planejamento' : 'Abrir aula'}</button></article>`).join('') || '<p class="catalog-empty">Nenhum componente encontrado nesta etapa.</p>';
    $$('[data-lesson]', grid).forEach(card => card.onclick = () => openLesson(card.dataset.lesson));
  };

  const renderExamples = () => {
    const examples = window.EVORA_PROJECT_EXAMPLES || [];
    const grid = $('[data-robot-grid]', examplesPage);
    grid.innerHTML = examples.map((item, index) => `<article class="robot-card tone-${index % 3}"><div class="robot-visual"><span class="project-number">${String(index + 1).padStart(2, '0')}</span><span class="project-icon-slot" data-icon="${item.id}" aria-hidden="true"></span></div><div class="robot-copy"><div class="robot-tags"><span>${item.theme || 'Robótica'}</span><span>${item.difficulty || 'Iniciante'}</span></div><h2>${item.title}</h2><p>${item.text}</p><dl><div><dt>Hardware</dt><dd>${item.hardware || 'Hub EVORA'}</dd></div><div><dt>Desafio</dt><dd>${item.challenge}</dd></div></dl><div class="robot-actions"><button class="btn secondary" type="button" data-assembly-manual="${item.id}">Montagem</button><button class="btn primary" type="button" data-install-example="${item.id}">Criar projeto</button></div></div></article>`).join('');
    $$('[data-install-example]', grid).forEach(button => button.onclick = () => window.evoraInstallExample?.(button.dataset.installExample));
    $$('[data-assembly-manual]', grid).forEach(button => button.onclick = () => window.evoraOpenAssemblyManual?.(button.dataset.assemblyManual));
  };
  renderPath();
  renderLessons();
  renderContinueLearning();
  renderExamples();

  const setActiveNav = page => {
    $$('.home-nav-item').forEach(item => item.classList.remove('active'));
    const selector = page === 'learn' ? '[data-evora-learn]' : page === 'examples' ? '[data-evora-examples]' : '[data-evora-home]';
    $(selector, $('#files'))?.classList.add('active');
  };
  const showPage = (page, lessonId = '') => {
    $$('.evora-page', filesRoot).forEach(node => { node.hidden = node.dataset.page !== page; });
    setActiveNav(page);
    const labels = { home: 'Início', learn: 'Aprender', examples: 'Projetos prontos' };
    $('#crumb').textContent = labels[page] || 'Início';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'examples') renderExamples();
    if (page === 'learn' && lessonId) setTimeout(() => openLesson(lessonId), 0);
  };

  $$('[data-evora-home]').forEach(button => button.onclick = () => showPage('home'));
  $$('[data-evora-learn]').forEach(button => button.onclick = () => showPage('learn'));
  $$('[data-evora-examples]').forEach(button => button.onclick = () => showPage('examples'));
  $$('[data-lesson-filter]', learnPage).forEach(button => button.onclick = () => {
    $$('[data-lesson-filter]', learnPage).forEach(item => item.classList.toggle('active', item === button));
    activeFilter = button.dataset.lessonFilter;
    renderLessons();
  });
  $('.catalog-search input', learnPage).addEventListener('input', event => {
    activeQuery = event.target.value;
    renderLessons();
  });
  $('[data-path-all]', learnPage).onclick = () => {
    catalogMode = !catalogMode;
    if (catalogMode) activePathId = '';
    else activePathId = learningPath[0].id;
    $('[data-path-all]', learnPage).textContent = catalogMode ? 'Voltar à trilha' : 'Ver catálogo completo';
    resetCatalogControls();
    renderPath();
    renderLessons();
  };

  const openLibrary = $('#openLibrary');
  if (openLibrary) openLibrary.hidden = true;
  $('.files-head-actions')?.setAttribute('aria-label', 'Ações de arquivo');
  const deviceText = $('#deviceText');
  const renameDeviceStatus = () => { if (deviceText?.textContent.startsWith('Bloco ')) deviceText.textContent = deviceText.textContent.replace(/^Bloco /, 'Hub '); };
  if (deviceText) new MutationObserver(renameDeviceStatus).observe(deviceText, { childList: true, characterData: true, subtree: true });
  renameDeviceStatus();
  if ($('#send')) $('#send').textContent = 'Enviar ao hub';
  const projectPanelTitle = $('#deviceProjectsPanel b, .device-projects-head b');
  if (projectPanelTitle) projectPanelTitle.textContent = 'Programas no hub';
  $('#allFiles')?.addEventListener('click', () => setTimeout(() => showPage('home'), 0));
  const originalShow = window.show;
  if (typeof originalShow === 'function') window.show = function evoraShow(id) { originalShow(id); document.body.dataset.evoraScreen = id; };
  document.body.dataset.evoraScreen = $('#programming.active') ? 'programming' : 'files';
  window.evoraNavigate = showPage;
})();
