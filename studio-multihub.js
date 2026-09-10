/* Modo multi-hub do Axioma Studio. Opt-in: projetos comuns continuam schema 1. */
(() => {
  const defaultNetwork = () => ({
    enabled: false,
    coordinatorId: 1,
    hubs: [{id: 1, name: 'Hub principal', role: 'coordinator', ports: Array(6).fill('none')}]
  });
  const network = p => {
    if (!p.multiHub || !Array.isArray(p.multiHub.hubs)) p.multiHub = defaultNetwork();
    if (!p.multiHub.hubs.some(h => h.id === 1)) p.multiHub.hubs.unshift(defaultNetwork().hubs[0]);
    p.multiHub.coordinatorId = 1;
    p.multiHub.hubs[0] = {...p.multiHub.hubs[0], id: 1, role: 'coordinator'};
    p.multiHub.hubs.forEach(hub=>{if(!Array.isArray(hub.ports)||hub.ports.length!==6)hub.ports=Array(6).fill('none');});
    return p.multiHub;
  };
  const portsForHub=(p,hubId)=>Number(hubId)===1?p.config:(network(p).hubs.find(hub=>hub.id===Number(hubId))?.ports||Array(6).fill('none'));
  window.axPortConfigForBlock=block=>portsForHub(project(),block?.getFieldValue?.('HUB')||1);
  window.axAllPortConfigs=()=>network(project()).enabled
    ?network(project()).hubs.flatMap(hub=>portsForHub(project(),hub.id))
    :project().config;
  const oldFresh = fresh;
  fresh = name => ({...oldFresh(name), multiHub: defaultNetwork()});
  projects.forEach(network);

  const style = document.createElement('style');
  style.textContent = `
    .multihub-switch{align-items:center;border:1px solid var(--line);border-radius:8px;display:flex;gap:12px;padding:12px}
    .multihub-switch input{height:18px;width:18px}.multihub-switch span{display:grid;gap:2px}.multihub-switch small,.hub-help{color:var(--muted)}
    .hub-list{display:grid;gap:8px}.hub-row{align-items:end;border:1px solid var(--line);border-radius:8px;display:grid;gap:8px;grid-template-columns:74px minmax(0,1fr) auto;padding:10px}
    .hub-row label{color:var(--muted);font-size:12px}.hub-row input{border:1px solid #d0d5dd;border-radius:6px;padding:8px;width:100%}.hub-role{font-size:12px;font-weight:700;padding:8px 0}.hub-port-config{grid-column:1/-1}.hub-ports-toggle{background:#175cd3;border:1px solid #175cd3;border-radius:7px;color:#fff;font-weight:750;padding:8px 10px}.hub-ports-toggle:hover{background:#004eeb}.hub-ports{display:grid;gap:6px;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:8px}.hub-ports label{display:grid;gap:3px}.hub-ports select{border:1px solid #d0d5dd;border-radius:6px;padding:6px;width:100%}
    .hub-monitor{border-top:1px solid var(--line);display:grid;gap:10px;margin-top:18px;padding-top:16px}.hub-monitor-list{display:grid;gap:6px}
    .hub-monitor-row{align-items:center;background:#f8fafc;border:1px solid var(--line);border-radius:7px;display:flex;justify-content:space-between;padding:8px 10px}.hub-monitor-row span:first-child{display:grid}.hub-monitor-row small{color:var(--muted)}
    .hub-state{border-radius:999px;font-size:11px;font-weight:750;padding:4px 8px}.hub-state.unknown{background:#f2f4f7;color:#475467}.hub-state.online{background:#ecfdf3;color:#067647}.hub-state.offline,.hub-state.conflict{background:#fef3f2;color:#b42318}.hub-state.incompatible{background:#fffaeb;color:#b54708}.hub-state.unexpected{background:#eef4ff;color:#3538cd}
    .hub-badge{background:#eef4ff;color:#3538cd}.hub-port-tag{border:1px solid transparent}.hub-tone-0{background:#e8f1ff;border-color:#b9d5ff;color:#1849a9}.hub-tone-1{background:#ecfdf3;border-color:#abefc6;color:#067647}.hub-tone-2{background:#fff6ed;border-color:#fed7aa;color:#9a3412}.hub-tone-3{background:#f5f3ff;border-color:#ddd6fe;color:#5b21b6}.hub-tone-4{background:#fdf2fa;border-color:#fbcfe8;color:#9d174d}.hub-tone-5{background:#ecfeff;border-color:#a5f3fc;color:#155e75}.multihub-only{display:none}.multihub-enabled .multihub-only{display:inline-flex}.multihub-enabled #portsBtn{display:none}
    @media(max-width:640px){.hub-row{grid-template-columns:62px 1fr}.hub-row button{grid-column:1/-1}}
  `;
  document.head.appendChild(style);

  const button = document.createElement('button');
  button.className = 'btn secondary';
  button.id = 'multiHubBtn';
  button.textContent = 'Multi-hub';
  portsBtn.parentElement.insertBefore(button, portsBtn);

  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.id = 'multiHubModal';
  backdrop.innerHTML = `<div class="modal"><div class="mhead"><h2>Hubs do projeto</h2><div class="spacer"></div><button class="btn secondary" type="button" data-hub-close>Fechar</button></div><div class="mbody">
    <label class="multihub-switch"><input id="multiHubEnabled" type="checkbox"><span><b>Usar mais de um hub</b><small>Ative somente para robôs com hubs conectados pelo cabo CAN.</small></span></label>
    <p class="notice" id="multiHubNotice">O projeto usa apenas um Axioma Block. Nenhuma configuração de rede será incluída.</p>
    <section id="multiHubSettings" class="hidden"><div class="row"><div><b>Topologia do robô</b><div class="hub-help">Cada hub tem um ID CAN único. O hub 1 coordena a implantação, mas cada hub executa seu próprio programa.</div></div><div class="spacer"></div><button class="btn secondary" id="addHub" type="button">+ Adicionar hub</button></div><div class="hub-list" id="hubList"></div><div class="hub-monitor"><div class="row"><div><b>Monitor da conexão</b><div class="hub-help" id="hubMonitorSummary">Conecte o hub principal para verificar a rede.</div></div><div class="spacer"></div><button class="btn secondary" id="refreshHubs" type="button">Verificar agora</button></div><div id="hubMonitorList" class="hub-monitor-list"></div></div></section>
  </div><div class="mfoot"><button class="btn primary" id="saveMultiHub" type="button">Aplicar</button></div></div>`;
  document.body.appendChild(backdrop);
  const enabledInput = backdrop.querySelector('#multiHubEnabled');
  const settings = backdrop.querySelector('#multiHubSettings');
  const notice = backdrop.querySelector('#multiHubNotice');
  const list = backdrop.querySelector('#hubList');
  const monitorList=backdrop.querySelector('#hubMonitorList');
  const monitorSummary=backdrop.querySelector('#hubMonitorSummary');
  let draft = defaultNetwork();
  const notifySimulator=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));

  const normalizeName = (value, fallback) => String(value || fallback).trim().slice(0, 24) || fallback;
  function renderDraft() {
    enabledInput.checked = draft.enabled;
    settings.classList.toggle('hidden', !draft.enabled);
    notice.classList.toggle('hidden', draft.enabled);
    list.replaceChildren();
    draft.hubs.sort((a,b) => a.id-b.id).forEach(hub => {
      const row = document.createElement('div'); row.className = 'hub-row';
      const ports=hub.ports;
      const portEditor=`<div class="hub-port-config"><button class="hub-ports-toggle" type="button" data-toggle-ports aria-expanded="false">Configurar portas</button><div class="hub-ports hidden" data-hub-ports>${ports.map((value,index)=>`<label>P${index+1}<select data-hub-port="${index}">${Object.entries(TYPES).map(([key,type])=>`<option value="${key}" ${key===value?'selected':''}>${esc(type.label)}</option>`).join('')}</select></label>`).join('')}</div></div>`;
      row.innerHTML = `<div><label>ID CAN</label><input type="number" min="1" max="63" value="${hub.id}" ${hub.id===1?'disabled':''}></div><div><label>Nome</label><input maxlength="24" value="${esc(hub.name)}"></div><span class="hub-role">${hub.id===1?'Principal':'Expansão'}</span>${portEditor}`;
      if (hub.id !== 1) {
        const remove = document.createElement('button'); remove.className='btn danger'; remove.type='button'; remove.textContent='Remover';
        remove.onclick=()=>{draft.hubs=draft.hubs.filter(item=>item!==hub);renderDraft();}; row.appendChild(remove);
      }
      const fields=row.querySelectorAll('input');
      if(hub.id!==1) fields[0].oninput=()=>{hub.id=Math.max(2,Math.min(63,Number(fields[0].value)||2));notifySimulator('axioma:topology-preview',structuredClone(draft));};
      fields[fields.length-1].oninput=()=>{hub.name=fields[fields.length-1].value;notifySimulator('axioma:topology-preview',structuredClone(draft));};
      const portsPanel=row.querySelector('[data-hub-ports]');
      const portsToggle=row.querySelector('[data-toggle-ports]');
      portsToggle.onclick=()=>{
        const open=portsPanel.classList.contains('hidden');
        portsPanel.classList.toggle('hidden',!open);
        portsToggle.textContent=open?'Ocultar portas':'Configurar portas';
        portsToggle.setAttribute('aria-expanded',String(open));
      };
      row.querySelectorAll('[data-hub-port]').forEach(field=>field.onchange=()=>{hub.ports[Number(field.dataset.hubPort)]=field.value;notifySimulator('axioma:topology-preview',structuredClone(draft));});
      list.appendChild(row);
    });
    notifySimulator('axioma:topology-preview',structuredClone(draft));
  }
  function openSettings(){draft=structuredClone(network(project()));draft.hubs.find(hub=>hub.id===1).ports=[...project().config];renderDraft();renderMonitor();modal('multiHubModal',true);}
  button.onclick=openSettings;
  backdrop.querySelector('[data-hub-close]').onclick=()=>{notifySimulator('axioma:topology-preview',null);modal('multiHubModal',false);};
  enabledInput.onchange=()=>{draft.enabled=enabledInput.checked;renderDraft();};
  backdrop.querySelector('#addHub').onclick=()=>{
    const used=new Set(draft.hubs.map(h=>h.id));let id=2;while(used.has(id)&&id<64)id++;
    if(id>63)return alert('A rede atingiu o limite de 63 hubs.');
    draft.hubs.push({id,name:'Hub '+id,role:'expansion',ports:Array(6).fill('none')});renderDraft();
  };

  const stateLabel={unknown:'Não verificado',online:'Online',offline:'Offline',conflict:'Conflito de ID',incompatible:'Firmware incompatível',unexpected:'Não configurado'};
  function renderMonitor(report=null,error=''){
    monitorList.replaceChildren();
    const detected=new Map((report?.nodes||[]).map(node=>[Number(node.id),node]));
    draft.hubs.forEach(hub=>{
      const node=detected.get(hub.id);let state='unknown';
      if(report){state=!node?'offline':node.duplicate?'conflict':node.compatible===false?'incompatible':'online';detected.delete(hub.id);}
      const row=document.createElement('div');row.className='hub-monitor-row';
      row.innerHTML=`<span><b>${esc(hub.name)}</b><small>ID ${hub.id}${hub.id===1?' · principal':''}</small></span><span class="hub-state ${state}">${stateLabel[state]}</span>`;
      monitorList.appendChild(row);
    });
    detected.forEach(node=>{const row=document.createElement('div');row.className='hub-monitor-row';row.innerHTML=`<span><b>Hub detectado</b><small>ID ${node.id} · fora deste projeto</small></span><span class="hub-state unexpected">${stateLabel.unexpected}</span>`;monitorList.appendChild(row);});
    if(error)monitorSummary.textContent='Não foi possível consultar o hub principal. A topologia não foi verificada.';
    else if(!report)monitorSummary.textContent='Conecte o hub principal para verificar a rede.';
    else if(!report.enabled)monitorSummary.textContent='O firmware respondeu, mas a rede CAN ainda não está configurada neste hub.';
    else monitorSummary.textContent=report.link_state==='conflict'?'A rede respondeu com conflito. Não execute o robô.':'Topologia consultada agora · protocolo v'+(report.protocol_version||'—');
  }
  async function refreshMonitor(){
    const refresh=backdrop.querySelector('#refreshHubs');refresh.disabled=true;monitorSummary.textContent='Consultando o hub principal…';
    try{const report=await(await req('/api/hubs')).json();renderMonitor(report);}
    catch(error){renderMonitor(null,error.message);}
    finally{refresh.disabled=false;}
  }
  backdrop.querySelector('#refreshHubs').onclick=refreshMonitor;

  const hardwareBlocks = new Set([
    'axioma_motor_speed','axioma_motor_stop','axioma_stop_all','axioma_servo_angle',
    'axioma_robot_move','axioma_motor_timed','axioma_motor_stop_mode',
    'axioma_encoder_position','axioma_encoder_angle','axioma_encoder_reset','axioma_move_rotations','axioma_move_distance',
    'axioma_touch','axioma_analog','axioma_line_value','axioma_light_value',
    'axioma_pot_value','axioma_color_is','axioma_reflected_light','axioma_distance_cm',
    'axioma_accel','axioma_gyro','axioma_imu_tilted','axioma_imu_yaw',
    'axioma_battery_level','axioma_button_pressed','axioma_wait_button',
    'axioma_tone','axioma_play_wav','axioma_show_image','axioma_clear_display'
  ]);
  const hubOptions = () => network(project()).hubs.map(h => [h.name, String(h.id)]);
  const savedHub = block => {try{return Number(JSON.parse(block.data||'{}').axiomaHubId)||1}catch{return 1}};
  const saveHub = block => {let data={};try{data=JSON.parse(block.data||'{}')}catch{}data.axiomaHubId=Number(block.getFieldValue('HUB')||1);block.data=JSON.stringify(data);};
  function refreshHubAssignments() {
    if(!workspace || !activeId)return;
    const enabled=network(project()).enabled;
    document.body.classList.toggle('multihub-enabled',enabled);
    workspace.getAllBlocks(false).forEach(block=>{
      if(block.type==='axioma_start'&&block.getInput('AXIOMA_HUB')) block.removeInput('AXIOMA_HUB',true);
      if(!hardwareBlocks.has(block.type))return;
      if(enabled && !block.getInput('AXIOMA_HUB')) {
        block.appendDummyInput('AXIOMA_HUB').appendField('no hub').appendField(new Blockly.FieldDropdown(hubOptions),'HUB');
        const assigned=savedHub(block);
        if(network(project()).hubs.some(h=>h.id===assigned))block.setFieldValue(String(assigned),'HUB');
      } else if(!enabled && block.getInput('AXIOMA_HUB')) {
        saveHub(block);block.removeInput('AXIOMA_HUB',true);
      }
    });
    tagsRender();
  }
  backdrop.querySelector('#saveMultiHub').onclick=()=>{
    draft.hubs.forEach((h,i)=>{h.name=normalizeName(h.name,i?'Hub '+h.id:'Hub principal');h.role=h.id===1?'coordinator':'expansion';});
    const ids=draft.hubs.map(h=>h.id);
    if(draft.enabled&&draft.hubs.length<2)return alert('Adicione pelo menos um hub de expansão para ativar o modo multi-hub.');
    if(new Set(ids).size!==ids.length)return alert('Cada hub precisa ter um ID CAN diferente.');
    project().config=[...draft.hubs.find(hub=>hub.id===1).ports];project().multiHub=structuredClone(draft);refreshHubAssignments();axRefreshSensorToolbox();axSetDirty(axActiveId());generate();notifySimulator('axioma:topology-change',structuredClone(project().multiHub));notifySimulator('axioma:topology-preview',null);modal('multiHubModal',false);
  };

  const oldTagsRender=tagsRender;
  tagsRender=function(){
    oldTagsRender();
    if(!network(project()).enabled)return;
    const labels=network(project()).hubs.flatMap((hub,hubIndex)=>portsForHub(project(),hub.id).map((type,index)=>
      type==='none'?null:`<span class="tag hub-port-tag hub-tone-${hubIndex%6}" title="${esc(hub.name)} · porta ${index+1}">${esc(hub.name)} · P${index+1}: ${esc(TYPES[type].label)}</span>`).filter(Boolean));
    tags.innerHTML=labels.join('')||'<span class="tag">Sem sensores configurados</span>';
    const badge=document.createElement('span');badge.className='tag hub-badge';badge.textContent=network(project()).hubs.length+' hubs';tags.appendChild(badge);
  };
  const oldOpenProject=openProject;
  openProject=function(id){oldOpenProject(id);setTimeout(refreshHubAssignments,0);};
  workspace.addChangeListener(event=>{
    if(event.type===Blockly.Events.BLOCK_CREATE)setTimeout(refreshHubAssignments,0);
    if(event.type===Blockly.Events.BLOCK_CHANGE&&event.name==='HUB')setTimeout(()=>{
      const block=workspace.getBlockById(event.blockId),required=window.axSensorRequirements?.[block?.type];
      const port=block?.getField('PORT');
      if(!required||!port)return;
      const allowed=port.getOptions(false).map(option=>option[1]);
      if(!allowed.includes(port.getValue()))port.setValue(allowed[0]||'');
      axRefreshSensorToolbox();
    },0);
  });

  const fieldMap=block=>Object.fromEntries(block.inputList.flatMap(input=>input.fieldRow||[]).filter(field=>field.name).map(field=>[field.name,block.getFieldValue(field.name)]));
  const linked=block=>block.inputList.map(input=>({name:input.name,kind:input.type,target:input.connection?.targetBlock()?.id||null})).filter(input=>input.target);
  const hardwareBelow=(block,kind,found=new Set())=>{
    if(!block)return found;
    if(hardwareBlocks.has(block.type))found.add(Number(block.getFieldValue('HUB')||network(project()).coordinatorId));
    block.inputList.filter(input=>kind==null||input.type===kind).forEach(input=>hardwareBelow(input.connection?.targetBlock(),null,found));
    if(kind==null)hardwareBelow(block.getNextBlock(),null,found);
    return found;
  };
  const actuatorBlocks=new Set([
    'axioma_motor_speed','axioma_motor_stop','axioma_stop_all','axioma_servo_angle',
    'axioma_robot_move','axioma_motor_timed','axioma_motor_stop_mode','axioma_encoder_reset','axioma_move_rotations','axioma_move_distance',
    'axioma_tone','axioma_play_wav','axioma_show_image','axioma_clear_display'
  ]);
  const hardwareResourcesBelow=(block,found=new Map())=>{
    if(!block)return found;
    if(hardwareBlocks.has(block.type))found.set(block.id,{block_id:block.id,type:block.type,
      hub_id:Number(block.getFieldValue('HUB')||network(project()).coordinatorId),fields:fieldMap(block)});
    block.inputList.forEach(input=>hardwareResourcesBelow(input.connection?.targetBlock(),found));
    hardwareResourcesBelow(block.getNextBlock(),found);
    return found;
  };
  const reverseCompare={LT:'GT',LTE:'GTE',GT:'LT',GTE:'LTE',EQ:'EQ',NEQ:'NEQ'};
  const conditionPredicate=(block,resource)=>{
    if(!block)return null;
    if(hardwareBlocks.has(block.type) && block.id===resource.block_id)return {kind:'truthy'};
    if(block.type==='logic_negate'){
      const nested=conditionPredicate(block.getInputTargetBlock('BOOL'),resource);
      return nested?.kind==='truthy'?{kind:'falsy'}:null;
    }
    if(block.type==='logic_compare'){
      const left=block.getInputTargetBlock('A'),right=block.getInputTargetBlock('B');
      const numeric=item=>item?.type==='math_number'?Number(item.getFieldValue('NUM')):null;
      const operator=block.getFieldValue('OP');
      if(left?.id===resource.block_id && numeric(right)!==null)return {kind:'compare',operator,value:numeric(right)};
      if(right?.id===resource.block_id && numeric(left)!==null)return {kind:'compare',operator:reverseCompare[operator],value:numeric(left)};
    }
    return null;
  };
  const isFastLoop=block=>['controls_whileUntil','controls_repeat_ext','controls_for','controls_forEach'].includes(block.type);
  const inFastLoop=block=>{for(let parent=block;parent;parent=parent.getParent?.())if(isFastLoop(parent))return true;return false;};
  const topicSeed=value=>[...String(value)].reduce((hash,char)=>(hash*33+char.charCodeAt(0))&0xffff,5381);
  const pythonLiteral=value=>{
    if(value===null)return 'None';
    if(value===true)return 'True';
    if(value===false)return 'False';
    if(typeof value==='number')return String(value);
    if(typeof value==='string')return JSON.stringify(value);
    if(Array.isArray(value))return '['+value.map(pythonLiteral).join(', ')+']';
    return '{'+Object.entries(value).map(([key,item])=>JSON.stringify(key)+': '+pythonLiteral(item)).join(', ')+'}';
  };
  const localModuleSource=module=>[
    '# Arquivo gerado pelo Axioma Studio — plano local não executável.',
    '# Não edite: o compilador de fluxo distribuirá a execução em uma próxima versão.',
    'from axioma_distributed_runtime import LocalPlanRuntime, AxiomaOperationAdapter',
    '',
    'MODULE = '+pythonLiteral(module),
    'adapter = AxiomaOperationAdapter()',
    'runtime = LocalPlanRuntime(MODULE, node_id='+module.hub_id+', read_operation=adapter.read, execute_operation=adapter.execute)',
    'STATUS = runtime.start()',
    ''
  ].join('\n');
  function allocateTopics(links){
    if(links.length>255)throw new Error('O projeto exige mais de 255 canais entre hubs. Simplifique as dependências remotas.');
    const used=new Set();
    return links.map(link=>{
      let topic=(topicSeed([link.source_hub,link.target_hub,link.source_block_id,link.target_block_id].join(':'))%255)+1;
      while(used.has(topic))topic=(topic%255)+1;
      used.add(topic);
      return {...link,topic,ttl_ms:100,message:'value'};
    });
  }
  function distributedPlan(){
    const starts=workspace.getTopBlocks(true).filter(block=>block.type==='axioma_start');
    if(starts.length!==1)return null;
    const nodes=workspace.getAllBlocks(false).map(block=>({
      id:block.id,type:block.type,fields:fieldMap(block),
      hub_id:hardwareBlocks.has(block.type)?Number(block.getFieldValue('HUB')||network(project()).coordinatorId):null,
      inputs:linked(block),next:block.getNextBlock()?.id||null,
    }));
    const validHubIds=new Set(network(project()).hubs.map(hub=>hub.id));
    const invalid=nodes.find(node=>node.hub_id && !validHubIds.has(node.hub_id));
    if(invalid)return {version:2,error:'O bloco '+invalid.type+' aponta para um hub que não existe mais. Escolha outro hub.',nodes};
    const links=[];
    const warnings=[];
    const unsupported=[];
    workspace.getAllBlocks(false).forEach(block=>{
      const conditions=block.inputList.filter(input=>input.type===Blockly.INPUT_VALUE)
        .flatMap(input=>[...hardwareResourcesBelow(input.connection?.targetBlock()).values()])
        .filter(resource=>!actuatorBlocks.has(resource.type));
      const actions=block.inputList.filter(input=>input.type===Blockly.INPUT_STATEMENT)
        .flatMap(input=>[...hardwareResourcesBelow(input.connection?.targetBlock()).values()])
        .filter(resource=>actuatorBlocks.has(resource.type));
      if(conditions.length>1 && actions.some(action=>conditions.some(source=>source.hub_id!==action.hub_id))){
        unsupported.push('A condição multi-hub usa mais de um sensor. Separe-a em etapas até o compilador de expressões completo estar disponível.');
        return;
      }
      conditions.forEach(source=>actions.forEach(target=>{if(source.hub_id!==target.hub_id){
        if(['axioma_move_rotations','axioma_move_distance'].includes(target.type)){
          unsupported.push('Movimento por rotações ou distância deve permanecer no mesmo hub do seu encoder. Use uma etapa local ou aguarde o compilador distribuído de trajetórias.');
          return;
        }
        const conditionInput=block.inputList.find(input=>input.type===Blockly.INPUT_VALUE);
        const predicate=conditionPredicate(conditionInput?.connection?.targetBlock(),source);
        if(!predicate){unsupported.push('A condição entre hubs usa uma expressão ainda não suportada. Use sensor direto, negação ou comparação com número.');return;}
        links.push({source_hub:source.hub_id,target_hub:target.hub_id,block_id:block.id,
          source_block_id:source.block_id,source_type:source.type,target_block_id:target.block_id,
          target_type:target.type,reason:'condicao',semantic:'condition_to_action',predicate,delivery:'cache'});
        if(inFastLoop(block))warnings.push('Uma malha de repetição cruza os hubs '+source.hub_id+' e '+target.hub_id+'. Use o cache remoto e evite controle de motor nesse laço.');
      }}));
    });
    const uniqueLinks=[...new Map(links.map(link=>[[link.source_hub,link.target_hub,link.block_id,link.source_block_id,link.target_block_id].join(':'),link])).values()];
    let channels;
    try{channels=allocateTopics(uniqueLinks);}catch(error){return {version:2,error:error.message,nodes};}
    const resources=nodes.filter(node=>node.hub_id).map(node=>({hub_id:node.hub_id,block_id:node.id,type:node.type,fields:node.fields}));
    const hubs=network(project()).hubs.map(hub=>({
      hub_id:hub.id,
      role:hub.role,
      resources:resources.filter(resource=>resource.hub_id===hub.id),
      publishes:channels.filter(channel=>channel.source_hub===hub.id),
      subscribes:channels.filter(channel=>channel.target_hub===hub.id)
    }));
    const modules=hubs.map(hub=>({
      format:'axioma-local-plan-v1',executable:false,hub_id:hub.hub_id,role:hub.role,
      entry:hub.hub_id===network(project()).coordinatorId?starts[0].id:null,
      operations:hub.resources,channels:{publishes:hub.publishes,subscribes:hub.subscribes},
      semantics:{publishers:hub.publishes.map(channel=>({topic:channel.topic,operation:channel.source_block_id})),
        handlers:hub.subscribes.map(channel=>({topic:channel.topic,operation:channel.target_block_id,when:'condition_true',predicate:channel.predicate}))}
    })).map(module=>{
      const source=localModuleSource(module);
      return {...module,source,envelope:JSON.stringify({format:'axioma-module-envelope-v1',plan:module,source})};
    });
    if(unsupported.length)return {version:2,error:unsupported[0],nodes,warnings:[...new Set(warnings)]};
    return {version:2,entry:starts[0].id,nodes,links:channels,channels,resources,hubs,modules,
      warnings:[...new Set(warnings)]};
  }
  const oldGenerate=generate;
  generate=function(warn=false){
    if(!activeId || !network(project()).enabled)return oldGenerate(warn);
    const validation=validate();if(validation){codeStatus.textContent=validation;if(warn)alert(validation);return null;}
    const source=oldGenerate(warn),plan=distributedPlan();if(!source||!plan)return null;
    if(plan.error){codeStatus.textContent=plan.error;if(warn)alert(plan.error);return null;}
    code.textContent='# Plano distribuído v2\n# '+plan.resources.length+' recursos · '+plan.links.length+' canais CAN · '+plan.modules.length+' artefatos MicroPython locais\n# Os artefatos validam o plano; a execução distribuída ainda será compilada.\n';
    codeStatus.textContent='Artefatos locais gerados · '+plan.links.length+' canal(is) CAN'+(plan.warnings.length?' · reveja os avisos':'');return source;
  };
  const oldManifest=axiomaManifest;
  axiomaManifest=function(){
    const n=network(project());if(!n.enabled)return oldManifest();
    const plan=distributedPlan();
    return {schema:2,mode:'distributed',coordinator_id:n.coordinatorId,
      target:{profile:AXIOMA_HARDWARE_PROFILE.id,profile_version:AXIOMA_HARDWARE_PROFILE.version,requires:['can.multi_hub']},
      topology:n.hubs.map(h=>({id:h.id,name:h.name,role:h.role,profile:AXIOMA_HARDWARE_PROFILE.id,capabilities:[...AXIOMA_HARDWARE_PROFILE.capabilities],ports:[...portsForHub(project(),h.id)]})),
      ports:[...project().config],ports_by_hub:n.hubs.map(h=>({hub_id:h.id,ports:[...portsForHub(project(),h.id)]})),assets:{audio:[...audio.keys()],images:[...images.keys()]},
      compiler:{version:2,status:plan?.error?'invalid':'partitioned',executable:false},plan,ready:false};
  };

  const bundleButton=document.createElement('button');bundleButton.className='btn secondary multihub-only';bundleButton.textContent='Baixar pacote multi-hub';
  download.parentElement.insertBefore(bundleButton,download.nextSibling);
  bundleButton.onclick=()=>{
    const plan=distributedPlan();if(!plan)return alert('Use exatamente um bloco Início.');
    if(plan.error)return alert(plan.error);
    const payload={manifest:axiomaManifest(),plan};
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download=asset(project().name)+'.axioma.json';a.click();URL.revokeObjectURL(a.href);
  };

  const oldSend=send.onclick;
  send.onclick=event=>{
    if(activeId && network(project()).enabled){
      const plan=distributedPlan();if(!plan)return alert('Use exatamente um bloco Início.');
      if(plan.error)return alert(plan.error);
      alert('O plano multi-hub está pronto. A geração dos módulos locais e a implantação CAN serão habilitadas após concluir o compilador distribuído e validar a bancada. Por enquanto, use “Baixar pacote multi-hub”.');return;
    }
    return oldSend.call(send,event);
  };
})();
