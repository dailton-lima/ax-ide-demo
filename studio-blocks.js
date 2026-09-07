/* Blocos pedagógicos adicionais e validação de programa do Axioma Studio. */
(() => {
  'use strict';
  const generator = python.pythonGenerator;
  const statement = (block, style = 'actions') => { block.setPreviousStatement(true); block.setNextStatement(true); block.setStyle(style); };
  const valueCode = (block, name, order = generator.ORDER_NONE, fallback = 'None') => generator.valueToCode(block, name, order) || fallback;
  const timerDefinitions = () => {
    generator.definitions_.axioma_timer = [
      'axioma_timer_started = time.ticks_ms()',
      'def axioma_reset_timer():',
      '  global axioma_timer_started',
      '  axioma_timer_started = time.ticks_ms()',
      'def axioma_timer_ms():',
      '  return time.ticks_diff(time.ticks_ms(), axioma_timer_started)'
    ].join('\n');
  };
  const block = (type, init, generate) => {
    Blockly.Blocks[type] = { init };
    generator.forBlock[type] = generate;
  };
  /* Fluxos superiores do programa: executado uma vez e executado continuamente. */
  block('axioma_forever', function () {
    this.appendDummyInput().appendField('Sempre');
    this.appendStatementInput('DO');
    this.setStyle('program');
    this.setTooltip('Executa continuamente os blocos colocados aqui.');
  }, (item, gen) => {
    gen.definitions_.axioma_forever = [
      'def axioma_sempre():',
      gen.statementToCode(item, 'DO') || '  pass\n'
    ].join('\n');
    return '';
  });
  const startGenerator = generator.forBlock.axioma_start;
  generator.forBlock.axioma_start = (item, gen) => {
    const source = startGenerator(item, gen);
    return gen.definitions_.axioma_forever ? source + 'axioma_sempre()\n' : source;
  };
  const motorMenu = [['A', '1'], ['B', '2'], ['C', '3'], ['D', '4']];
  const encoderRef = item => {
    const port = item.getFieldValue('PORT');
    const name = `axioma_encoder_${port}`;
    generator.definitions_[name] = `${name} = axioma.Encoder(${port})`;
    return name;
  };
  const motionService = () => {
    generator.definitions_.axioma_motion_service = 'import axioma_motion_service';
  };

  /* Eventos e temporizador */
  block('axioma_button_pressed', function () {
    this.appendDummyInput().appendField('botão do bloco').appendField(new Blockly.FieldDropdown([['esquerdo', 'left'], ['direito', 'right'], ['central', 'center'], ['pareamento', 'pair']]), 'BUTTON').appendField('está pressionado?');
    this.setOutput(true, 'Boolean'); this.setOutputShape(1); this.setStyle('sensors');
  }, item => [`axioma.Button('${item.getFieldValue('BUTTON')}').is_pressed()`, generator.ORDER_ATOMIC]);
  block('axioma_wait_button', function () {
    this.appendDummyInput().appendField('esperar botão').appendField(new Blockly.FieldDropdown([['esquerdo', 'left'], ['direito', 'right'], ['central', 'center'], ['pareamento', 'pair']]), 'BUTTON').appendField('ser pressionado'); statement(this, 'control');
  }, item => `while not axioma.Button('${item.getFieldValue('BUTTON')}').is_pressed():\n  time.sleep_ms(10)\n`);
  block('axioma_reset_timer', function () {
    this.appendDummyInput().appendField('redefinir temporizador'); statement(this, 'actions');
  }, () => { timerDefinitions(); return 'axioma_reset_timer()\n'; });
  block('axioma_timer_ms', function () {
    this.appendDummyInput().appendField('temporizador (ms)'); this.setOutput(true, 'Number'); this.setOutputShape(3); this.setStyle('sensors');
  }, () => { timerDefinitions(); return ['axioma_timer_ms()', generator.ORDER_FUNCTION_CALL]; });

  /* Encoder magnético integrado a cada porta de motor. */
  block('axioma_encoder_position', function () {
    this.appendDummyInput().appendField('posição do motor').appendField(new Blockly.FieldDropdown(motorMenu), 'PORT').appendField('(contagens)');
    this.setOutput(true, 'Number'); this.setOutputShape(3); this.setStyle('sensors');
  }, item => [`${encoderRef(item)}.get_position()`, generator.ORDER_FUNCTION_CALL]);
  block('axioma_encoder_angle', function () {
    this.appendDummyInput().appendField('ângulo do motor').appendField(new Blockly.FieldDropdown(motorMenu), 'PORT').appendField('(°)');
    this.setOutput(true, 'Number'); this.setOutputShape(3); this.setStyle('sensors');
  }, item => [`${encoderRef(item)}.angle()`, generator.ORDER_FUNCTION_CALL]);
  block('axioma_encoder_reset', function () {
    this.appendDummyInput().appendField('zerar posição do motor').appendField(new Blockly.FieldDropdown(motorMenu), 'PORT');
    statement(this, 'movement');
  }, item => `${encoderRef(item)}.reset()\n`);
  block('axioma_move_rotations', function () {
    this.appendDummyInput().appendField('mover motor').appendField(new Blockly.FieldDropdown(motorMenu), 'PORT')
      .appendField('por').appendField(new Blockly.FieldNumber(1, -9999, 9999, 0.1), 'ROTATIONS').appendField('rotações');
    this.appendDummyInput().appendField('velocidade máx.').appendField(new Blockly.FieldNumber(60, 1, 100), 'SPEED').appendField('%')
      .appendField('timeout').appendField(new Blockly.FieldNumber(10, 0.1, 120, 0.1), 'TIMEOUT').appendField('s')
      .appendField(new Blockly.FieldDropdown([['frear', 'brake'], ['roda livre', 'coast']]), 'STOP');
    statement(this, 'movement');
  }, item => { motionService(); return `axioma_motion_service.move_rotations(${item.getFieldValue('PORT')}, ${item.getFieldValue('ROTATIONS')}, ${item.getFieldValue('SPEED')}, ${Math.round(Number(item.getFieldValue('TIMEOUT')) * 1000)}, ${item.getFieldValue('STOP') === 'brake'})\n`; });
  block('axioma_move_distance', function () {
    this.appendDummyInput().appendField('mover motor').appendField(new Blockly.FieldDropdown(motorMenu), 'PORT')
      .appendField('por').appendField(new Blockly.FieldNumber(100, -99999, 99999, 1), 'DISTANCE').appendField('mm');
    this.appendDummyInput().appendField('velocidade máx.').appendField(new Blockly.FieldNumber(60, 1, 100), 'SPEED').appendField('%')
      .appendField('timeout').appendField(new Blockly.FieldNumber(10, 0.1, 120, 0.1), 'TIMEOUT').appendField('s')
      .appendField(new Blockly.FieldDropdown([['frear', 'brake'], ['roda livre', 'coast']]), 'STOP');
    statement(this, 'movement');
  }, item => { motionService(); return `axioma_motion_service.move_distance_mm(${item.getFieldValue('PORT')}, ${item.getFieldValue('DISTANCE')}, ${item.getFieldValue('SPEED')}, ${Math.round(Number(item.getFieldValue('TIMEOUT')) * 1000)}, ${item.getFieldValue('STOP') === 'brake'})\n`; });

  /* Texto, console e listas em linguagem do aluno. */
  block('axioma_log', function () {
    this.appendValueInput('TEXT').appendField('mostrar no console'); statement(this, 'actions');
  }, (item, gen) => `print(${valueCode(item, 'TEXT', gen.ORDER_NONE, "''")})\n`);
  block('axioma_list_add', function () {
    this.appendValueInput('LIST').setCheck('Array').appendField('adicionar'); this.appendValueInput('ITEM').appendField('à lista'); statement(this, 'variable_blocks');
  }, (item, gen) => `${valueCode(item, 'LIST', gen.ORDER_MEMBER, '[]')}.append(${valueCode(item, 'ITEM', gen.ORDER_NONE)})\n`);
  block('axioma_list_remove', function () {
    this.appendValueInput('LIST').setCheck('Array').appendField('remover item'); this.appendValueInput('INDEX').setCheck('Number').appendField('da posição'); statement(this, 'variable_blocks');
  }, (item, gen) => `del ${valueCode(item, 'LIST', gen.ORDER_MEMBER, '[]')}[${valueCode(item, 'INDEX', gen.ORDER_NONE, '1')} - 1]\n`);
  block('axioma_list_contains', function () {
    this.appendValueInput('LIST').setCheck('Array').appendField('lista'); this.appendValueInput('ITEM').appendField('contém'); this.setOutput(true, 'Boolean'); this.setOutputShape(1); this.setStyle('variable_blocks');
  }, (item, gen) => [`${valueCode(item, 'ITEM', gen.ORDER_RELATIONAL)} in ${valueCode(item, 'LIST', gen.ORDER_RELATIONAL, '[]')}`, gen.ORDER_RELATIONAL]);
  block('axioma_comment', function () {
    this.appendDummyInput().appendField('comentário').appendField(new Blockly.FieldTextInput('anotação'), 'TEXT'); statement(this, 'actions');
  }, item => `# ${item.getFieldValue('TEXT').replace(/[\r\n]/g, ' ')}\n`);

  const toolbox = document.getElementById('toolbox');
  const category = name => [...toolbox.querySelectorAll('category')].find(node => node.getAttribute('name') === name);
  const add = (name, types) => {
    const parent = category(name); if (!parent) return;
    types.forEach(type => {
      if (!parent.querySelector(`block[type="${type}"]`)) parent.insertAdjacentHTML('beforeend', `<block type="${type}"></block>`);
    });
  };
  const installToolboxExtensions = () => {
    const programCategory=category('Programa');
    const oldForever=category('Controle')?.querySelector('block[type="axioma_forever"]');
    oldForever?.remove();
    if(programCategory&&!programCategory.querySelector('block[type="axioma_forever"]'))programCategory.insertAdjacentHTML('beforeend','<block type="axioma_forever"></block>');
    add('Sensores', ['axioma_button_pressed', 'axioma_timer_ms', 'axioma_encoder_position', 'axioma_encoder_angle']);
    add('Movimento', ['axioma_encoder_reset', 'axioma_move_rotations', 'axioma_move_distance']);
    add('Ações', ['axioma_reset_timer', 'axioma_log', 'axioma_comment']);
    add('Controle', ['axioma_wait_button']);
    const listCategory = category('Listas');
    if (listCategory) {
      ['lists_create_empty', 'lists_repeat', 'lists_isEmpty', 'lists_indexOf', 'lists_getSublist', 'lists_sort', 'axioma_list_add', 'axioma_list_remove', 'axioma_list_contains'].forEach(type => {
        if (!listCategory.querySelector(`block[type="${type}"]`)) listCategory.insertAdjacentHTML('beforeend', `<block type="${type}"></block>`);
      });
    }
    const mathCategory = category('Matemática');
    if (mathCategory && !category('Texto')) {
      mathCategory.insertAdjacentHTML('afterend', '<category name="Texto" categorystyle="variables_category"><block type="text"></block><block type="text_join"></block><block type="text_length"></block><block type="text_isEmpty"></block><block type="text_changeCase"></block><block type="text_trim"></block><block type="text_print"></block></category>');
    }
    workspace.updateToolbox(toolbox);
  };
  installToolboxExtensions();

  /* O Blockly já implementa "Funções"/My Blocks; adicionamos orientação na categoria. */
  const procedures = category('Funções');
  if (procedures) procedures.setAttribute('expanded', 'false');

  const previousValidate = validate;
  validate = function () {
    const issue = previousValidate();
    if (issue) return issue;
    const starts = workspace.getTopBlocks(true).filter(item => item.type === 'axioma_start');
    if (starts.length !== 1) return 'Use exatamente um bloco Início para definir por onde o programa começa.';
    const forever = workspace.getTopBlocks(true).filter(item => item.type === 'axioma_forever');
    if (forever.length > 1) return 'Use no máximo um bloco Sempre no programa.';
    const allowedTopLevel = new Set(['axioma_start', 'axioma_forever', 'procedures_defnoreturn', 'procedures_defreturn']);
    const loose = workspace.getTopBlocks(true).find(item => !allowedTopLevel.has(item.type));
    if (loose) return 'Há um bloco solto fora de Início ou de uma Função. Conecte-o para que seja executado.';
    for (const item of workspace.getAllBlocks()) {
      if (item.type === 'axioma_list_add' || item.type === 'axioma_list_remove') {
        if (!item.getInputTargetBlock('LIST')) return 'Escolha a lista que será alterada.';
      }
      if (item.type === 'axioma_log' && !item.getInputTargetBlock('TEXT')) return 'Conecte um texto ou valor ao bloco mostrar no console.';
    }
    return null;
  };

  /* Garante que novos blocos respeitem o estilo visual adotado pela IDE. */
  const refresh = () => workspace.getAllBlocks().forEach(item => {
    if (['axioma_button_pressed', 'axioma_list_contains'].includes(item.type)) item.setOutputShape(1);
    if (['axioma_timer_ms', 'axioma_encoder_position', 'axioma_encoder_angle'].includes(item.type)) item.setOutputShape(3);
  });
  workspace.addChangeListener(event => { if (event.type === Blockly.Events.BLOCK_CREATE) setTimeout(refresh, 0); });
  refresh();
  const openProjectWithBlocks = openProject;
  openProject = function (id) { openProjectWithBlocks(id); installToolboxExtensions(); };
})();
