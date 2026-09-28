# Roadmap e pendências da IDE

O benchmark detalhado de MakeCode, SPIKE, Tinkercad, Open Roberta, VEXcode e
Scratch está em [FEATURE_BENCHMARK.md](FEATURE_BENCHMARK.md). Ele organiza as
possíveis funcionalidades em prioridades P0, P1 e P2 e deve orientar a
transformação deste roadmap em entregas menores.

As propostas não comprometidas para depois da base técnica estão em
[IDEIAS_FUTURAS.md](IDEIAS_FUTURAS.md).

## Etapas da evolução visual e educacional

| Etapa | Entrega | Estado |
| --- | --- | --- |
| 1 | Análise da IDE, firmware, contratos e plataformas de referência | Concluída |
| 2 | Identidade EVORA, paleta e estrutura responsiva inicial | Concluída |
| 3 | Navegação separada entre Início, Aprender e Exemplos | Concluída |
| 4 | Aulas individuais por componente e seis projetos de robôs editáveis | Concluída |
| 5 | Refinamento editorial, remoção de emojis e preparação para SVGs | Concluída |
| 6 | Reorganização visual e funcional do editor Blockly | Concluída — v4 |
| 7 | Biblioteca oficial de SVGs, ilustrações técnicas e estados vazios | Aguardando assets |
| 8 | Testes automatizados dos fluxos principais da interface | Concluída — contratos Node e seis cenários Chromium |
| 9 | Refinamento editorial e trilha de aprendizagem progressiva | Concluída |
| 10 | Biblioteca de manuais de montagem para Projetos prontos | Estrutura concluída — publicação adiada até receber assets |

### Etapa 10 — manuais de montagem

Esta etapa entra após a trilha educacional porque conecta o projeto de software
ao robô físico, sem apresentar uma montagem como disponível antes de validá-la.

- **Concluído:** estrutura de manual por projeto, modal de montagem em
  preparação, espaço para capa, lista de peças e passos ilustrados;
- **Concluído:** contrato de conteúdo em
  [ASSEMBLY_MANUALS.md](ASSEMBLY_MANUALS.md), incluindo o critério que impede
  publicar um manual incompleto;
- **Próximo recorte:** receber os assets validados de cada robô e transformar o
  estado `planned` em `ready`, começando pelo Rover explorador.

### Etapa 6 concluída — editor Blockly

Entregue em 23/09/2026:

- barra do projeto consolidada em uma única linha;
- simulador fixo à esquerda, inspirado na estrutura do MakeCode Mindstorms;
- alternância Blocos/Python na área direita;
- estado do hub e envio mantidos na ação principal;
- configurações de portas, mídia e multi-hub agrupadas;
- ações de salvar, baixar e enviar movidas para a barra inferior persistente;
- toolbox, flyout, workspace e seleção do Blockly modernizados;
- blocos de simulador e programação diferenciados por cor;
- hero promocional restaurado na página inicial;
- importação de áudio e imagem disponível no modal de mídia;
- composição responsiva validada em desktop e tablet;
- editor contido na altura da janela, sem rolagem vertical da página;
- menu Configurar corrigido para abrir acima do Blockly e sem ações duplicadas;
- dispositivos do simulador organizados em cartões, sem sobrepor hub, cabos ou rótulos;
- colisão entre a classe dos atuadores e o cabeçalho global removida; motores
  agora acompanham a rolagem interna e reservam a própria altura;
- modo de tela cheia do simulador corrigido para cobrir todo o viewport e
  retornar ao editor pelo botão de fechar;
- projetos novos iniciam com **Início** e **Sempre**, afastados das bordas do workspace;
- documentação de arquitetura e sistema visual atualizada.

Validações executadas: abertura de projeto, alternância Blocos/Python,
permanência do simulador à esquerda nas duas visualizações, menu compacto de
configuração, barra inferior visível, biblioteca de mídia, layout de
`768 × 1024`, altura do viewport sem rolagem da página, posição inicial dos
blocos, quatro cartões de motor, fluxo de rolagem do simulador, sintaxe
JavaScript e console do navegador sem erros.

Limitações: os painéis são recolhíveis, mas ainda não redimensionáveis por
arraste; envio e estados de erro do hub não foram validados em hardware real.

### Etapa 8 concluída — testes da interface

Entregue em 23/09/2026:

- suíte `tests/ide_static.test.mjs`, executável com `node --test`;
- verificação de sintaxe dos módulos críticos;
- teste do servidor estático e bloqueio de travessia de diretório;
- contratos para Início/Sempre, margem inicial, isolação do simulador e tela
  cheia.
- seis cenários Playwright no Chromium, com servidor local automático;
- criação de projeto, Blocos/Python, Configurar, simulador, tela cheia e ações
  de envio cobertos em navegador real.

Validações executadas: 5 testes Node e 6 testes Playwright passaram em
23/09/2026.

### Etapa 9 concluída — hierarquia e trilha de aprendizagem

Entregue em 23/09/2026:

- espaçamento entre o hero inicial e a área de projetos revisado;
- contraste da assinatura **EVORA STUDIO** reforçado dentro do hero;
- rótulos redundantes antes dos títulos removidos das páginas e das aulas;
- acesso duplicado a **Meu hub** removido da navegação lateral; o controle do
  hub no topo permanece como ponto único de entrada;
- página **Aprender** reorganizada como trilha de cinco etapas, do primeiro
  contato com o hub à exploração de sensores avançados;
- cada etapa agora filtra e ordena as aulas correspondentes, sem esconder o
  catálogo completo quando ele for necessário.
- vocabulário de criação padronizado em **projeto** e ação duplicada de criação
  removida da página inicial;
- subtítulos descritivos removidos dos cabeçalhos de Projetos, Aprender e
  Exemplos;
- simulador redesenhado com hub mais limpo, cartões técnicos e motor com
  carcaça, ventilação, caixa de redução e eixo visualmente identificáveis.
- página inicial simplificada para dois destinos pedagógicos: **Aprender** e
  **Exemplos**, em vez de duplicar aulas da trilha;
- rotação do motor reforçada com marcador assimétrico no eixo e animação mais
  lenta, perceptível e reversível.
- toolbox dividido entre **Motores** (motor ou servo individual) e
  **Movimento** (base móvel com dois motores); comandos de avanço e recuo
  aplicam automaticamente a inversão necessária no motor direito.
- interação dos sensores no simulador deixou de recriar cartões durante clique
  ou arraste; toque responde no primeiro pressionamento e controles analógicos
  acompanham o cursor de forma contínua;
- eixo dos motores recebe animação direta pela Web Animations API e a leitura
  de potência foi ampliada para manter o giro e a intensidade legíveis.
- eventos de sensores centralizados no palco do simulador, eliminando o
  conflito causado por listeners recriados; teste Chromium cobre toque e
  alteração contínua do sensor de linha.
- tema do Blockly refinado com cores saturadas por categoria, fonte Aptos/Segoe
  UI e flyout translúcido com borda e sombra, distinguindo-o do canvas de
  programação.
- blocos da categoria **Motores** voltaram ao formato padrão do Blockly, agora
  em coral exclusivo (sem compartilhar a cor de **Movimento**); a paleta das
  categorias foi revisada e os blocos adotam sombra suave, sem contorno preto.
- interação de toque, seleção e sliders dos sensores passou a adiar a
  reconstrução do palco enquanto o controle está ativo, evitando travamentos e
  perda do valor durante o arraste.
- sombra do Blockly agora é aplicada apenas ao bloco raiz de cada pilha, sem
  escurecer as junções; os comandos de **Movimento** usam o mesmo azul da sua
  categoria, separado do verde dos sensores.

Validações executadas: página inicial em navegador, contraste do hero,
navegação para Aprender, seleção das etapas 01 e 02 da trilha e filtragem das
aulas correspondentes. A suíte estática (10 testes) e a suíte Playwright (9
cenários Chromium) continuam verdes, incluindo quatro motores renderizados na
organização nova do simulador. O contrato estático também verifica a separação
entre Motores/Movimento e a inversão da base móvel.

### Próxima etapa executável — assets visuais oficiais

Com a base de qualidade disponível, a próxima entrega é integrar a biblioteca
de SVGs oficiais, substituindo os ícones provisórios sem alterar rótulos,
acessibilidade ou fluxos. O critério de conclusão é os principais controles
usarem SVGs consistentes e os testes atuais continuarem verdes.

## Já presente no código

- editor Blockly em português;
- geração de MicroPython para movimento, sensores, IMU, energia, áudio e tela;
- armazenamento local, abas, configuração de seis portas e upload de mídia;
- conversão de imagem para RGB565 e fluxo de áudio WAV;
- simulador de hubs, LCD, motores, servos, botões e sensores;
- monitor de sensores locais, diagnóstico e lista de projetos do bloco;
- editor de topologia e plano distribuído multi-hub;
- páginas distintas de Início, Aprender e Exemplos;
- trilha pedagógica de cinco etapas e treze aulas por componente, com duas
  dependências de hardware sinalizadas;
- seis projetos de robôs que geram cópias Blockly editáveis;
- sistema visual EVORA responsivo e slots `data-icon` para os SVGs oficiais;
- editor com simulador fixo à esquerda e alternância Blocos/Python à direita.

## Próximas etapas priorizadas

### P0 — fidelidade do simulador e fluxo essencial

1. **Concluído:** IMU virtual avançado no simulador com acelerômetro e
   giroscópio nos eixos X/Y/Z, visual de orientação e controles contínuos;
   os grupos são apresentados em colunas separadas e seguem o verde de
   Sensores.
2. **Concluído:** os cards de sensores agora recebem explicitamente o verde da
   categoria; um duplo clique em qualquer controle contínuo do simulador
   restaura seu valor padrão. O cubo do IMU combina aceleração e rotação dos
   eixos X/Y/Z em sua orientação visual.
3. **Concluído:** a barra superior ganhou a cor institucional azul com apoio
   violeta, preservando contraste para marca, contexto e estado do hub.
4. **Concluído:** os controles do IMU alimentam os blocos de aceleração,
   giroscópio, inclinação e guinada de forma contínua, sem reconstruir o card
   durante o arraste.
5. **Concluído:** cobertura Chromium valida IMU, toque, linha, motores e a
   reação de um programa contínuo à inclinação simulada.
6. **Bloqueado por decisão de hardware:** o perfil EVORA v3 da IDE e do
   firmware declara BMI270, que é o IMU definido para o produto. O driver
   nativo e o diagnóstico passaram a usar a API oficial da Bosch para BMI270,
   com aceleração e giroscópio configurados a 100 Hz. As unidades continuam
   brutas; o relatório e a validação de bancada estão em
   [IMU_COMPATIBILITY.md](IMU_COMPATIBILITY.md). Não apresentar mg, graus ou
   guinada como capacidade física até a calibração. Enquanto isso,
   o descritor do firmware não anuncia capacidades de IMU, bloqueando o envio
   de projetos que dependam delas ao hub físico.

### P1 — robustez antes de integração física

1. **Concluído:** seis portas de sensores configuráveis são o contrato oficial
   do Hub Base; simulador, configuração e perfil de hardware permanecem nesse
   limite.
2. **Concluído:** perfil Base padronizado em display ST7789 de `240 × 240`,
   mídia RGB565 `240 × 240` e motores sem encoder interno; blocos de encoder
   ficam reservados ao futuro perfil Pro.
3. **Concluído:** perfil/renderizador Blockly, estado de projetos, ciclo de
   programação e configuração das portas foram extraídos para
   `studio-profile.js`, `studio-projects.js`, `studio-program.js`,
   `studio-ports.js`, `studio-media.js` e `studio-transport.js`, com contratos
   estáticos. Próximo recorte: persistência versionada de projetos e mídias,
   com recuperação de falhas;
4. **Concluído:** projetos usam envelope versionado e cópia local de
   recuperação; áudio e imagens são restaurados do IndexedDB por projeto.

### P2 — integração com o ecossistema físico

1. **Concluído em contrato:** a IDE entrega envelopes de plano local ao
   coordenador CAN; o firmware valida o módulo do coordenador e enfileira
   módulos remotos. O verificador portátil
   `ax-firmware/tests/check_ide_multihub.mjs` cobre os pontos de integração
   entre a IDE, o perfil v3 e as rotas do firmware.
2. **Concluído em contrato:** `POST /api/hubs/deploy` inicia a implantação e
   `GET /api/hubs` expõe fila, progresso e confirmações por nó. Uma falha por
   timeout pode ser retomada por `POST /api/hubs/resume`, a partir do último
   chunk confirmado pelo nó remoto; divergência de hash descarta o trecho
   parcial de forma segura. O início sincronizado por `POST /api/hubs/start`
   só é aceito depois das confirmações dos módulos. Falta validação em bancada;
   o monitor da IDE bloqueia iniciar até confirmar a sessão, topologia online e
   módulos remotos prontos, deixando a retomada disponível somente após falha;
   um cenário Chromium cobre os dois estados seguros do monitor com a resposta
   simulada do coordenador;
   o coordenador também declara `actions.resume` e `actions.start` em
   `GET /api/hubs`, e a IDE usa essa decisão quando disponível;
   `actions.reason` entrega o motivo estável da decisão para o monitor, que o
   traduz em orientação sem acoplar a interface às mensagens do firmware;
   cada nova fila limpa as confirmações da implantação anterior, evitando que
   um ACK histórico libere o início de um novo projeto;
3. **Concluído em contrato:** manifesto da IDE declara as capacidades realmente
   usadas e compara perfil/capacidades com o descritor entregue por
   `/api/status`. Tamanho e SHA-256 de código, áudio e imagens são conferidos
   no hub antes do manifesto. A conclusão física do P2 ainda exige bancada CAN
   (descoberta, perda de pacote, retomada e confirmação) e calibração do IMU.
4. **Concluído:** Python 3.12.10 e ESP-IDF 5.4.2 foram instalados e a
   ativação oficial validou as dependências do SDK. A suíte explícita
   `python -m pytest tests/test_hardware_profile.py tests/test_hub_protocol.py`
   passou com 18 testes em 25/09/2026. Isso se soma aos contratos estáticos
   já aprovados.
5. **Concluído em compilação; pendente de bancada:** o módulo nativo usa a API
   oficial Bosch BMI270, com arquivo de configuração obrigatório e leituras
   X/Y/Z a 100 Hz. O teste estático `check_bmi270_driver.mjs` e a compilação
   integral para `AXIOMA_S3` passaram em 27/09/2026, incluindo os módulos C
   EVORA (`modmotion.c`, `bmi2.c` e `bmi270.c`). A build Windows precisou de
   compatibilidade local para argumentos QSTR longos, TinyUSB 0.21 (assinatura
   de transferência e buffer CDC) e regeneração de QSTR após incluir os
   módulos nativos. O artefato é
   `micropython/ports/esp32/build-AXIOMA_S3-qstr-s3/micropython.bin`.
   **Atenção:** ele ocupa `0x1e1f00` da menor partição de `0x1f0000`, deixando
   só `0xe100` (3%) livres. Antes de gravar a versão de bancada, reduzir a
   imagem ou aceitar formalmente essa margem. Depois, gravar o hub e executar
   a sequência física antes de anunciar `imu.6axis` e `imu.heading` no
   firmware.

### P3 — ampliação pedagógica e acabamento

1. integrar os SVGs oficiais da EVORA;
2. ampliar trilhas, planos de aula e avaliações por faixa etária;
3. refinar acessibilidade, responsividade e tutoriais contextuais.

Recorte concluído em 25/09/2026: modais devolvem o foco ao acionador, fecham
com Escape, mantêm o foco dentro da janela com Tab e recebem semântica de
diálogo modal. A cobertura Chromium verifica o fechamento e a restauração de
foco no fluxo do hub.

Recorte concluído em 25/09/2026: o simulador anuncia a região de dispositivos,
o log de estado e rótulos descritivos para execução, reinício, tela cheia,
botões físicos, sensores e os seis controles da IMU. Os cenários Chromium
verificam os rótulos de toque, linha e IMU.

Recorte concluído em 25/09/2026: o simulador respeita
`prefers-reduced-motion`, evitando animações contínuas de motores quando essa
preferência do sistema estiver ativa sem esconder o estado de execução. Um
cenário Chromium cobre essa preferência.

Recorte concluído em 25/09/2026: seleção acidental de texto foi desativada em
menus, cartões, controles, Blockly e simulador, preservando seleção em código,
logs, diagnósticos, aulas e formulários. A separação é coberta por teste de
navegador.

Recorte concluído em 25/09/2026: controles focáveis receberam um anel violeta
visível por teclado, com afastamento suficiente para não encobrir texto ou
bordas. A cobertura Chromium confirma o estado de foco no simulador.

Recorte concluído em 25/09/2026: o atalho “Pular para o conteúdo principal”
fica visível ao receber foco e leva diretamente ao conteúdo da IDE. O fluxo é
coberto em Chromium.

Recorte concluído em 25/09/2026: os botões físicos do hub no simulador também
respondem a Enter e Espaço, com soltura ao liberar a tecla. O comportamento é
coberto em Chromium.

Recorte concluído em 25/09/2026: botões físicos do simulador refletem o estado
temporário em `aria-pressed`, permitindo que leitores de tela acompanhem
pressionamento e soltura. O cenário Chromium valida os dois estados.

Recorte concluído em 25/09/2026: sliders de sensores e IMU publicam o valor
atual em `aria-valuetext`, com unidades, e atualizam esse texto durante o
arraste. Cenários Chromium verificam linha, acelerômetro e giroscópio.

Recorte concluído em 25/09/2026: a trilha educacional permite concluir ou
reabrir aulas disponíveis, persiste o avanço no navegador e mostra o progresso
por etapa. Aulas ainda planejadas não podem ser concluídas. Um cenário Chromium
cobre a conclusão de Motor DC e a atualização da etapa de movimento.

Recorte concluído em 25/09/2026: Aprender agora destaca a próxima aula
pedagógica disponível, respeitando a ordem da trilha e o avanço local. Ao
concluir todas as aulas disponíveis, informa que a trilha foi concluída. Um
cenário Chromium cobre a abertura da primeira recomendação.

Recorte concluído em 25/09/2026: cada etapa da trilha exibe uma barra visual
de progresso, com porcentagem em `progressbar` para tecnologias assistivas. A
barra usa a paleta EVORA e o cenário de conclusão valida 50% na etapa Movimento.

Recorte concluído em 25/09/2026: a próxima aula agora aparece em um card verde
destacado no topo de Aprender, com objetivo e ação direta. Cards concluídos
ganham fundo e selo verdes, distinguindo avanço de conteúdo pendente. Cenários
Chromium validam o destaque e a conclusão.

Recorte concluído em 25/09/2026: a trilha passou a exibir somente as aulas da
etapa selecionada. Os filtros por tipo e a busca ficam ocultos até a pessoa
escolher **Ver catálogo completo**; nesse modo, a mesma ação permite retornar à
trilha sem manter filtros ou busca anteriores.

Recorte concluído em 25/09/2026: textos explicativos redundantes foram
retirados do cabeçalho da trilha, das etapas e do título das aulas, deixando a
hierarquia centrada em ações e conteúdo. As páginas Início, Aprender e
Exemplos passaram a declarar a mesma largura útil e margem estrutural.

Recorte concluído em 25/09/2026: acrescentada a revisão prévia do projeto no
editor. Ela aponta ausência ou duplicidade de **Início**, portas incompatíveis
e estruturas vazias antes do envio, sem impedir simulação ou download quando
existem somente sugestões pedagógicas.

Recorte concluído em 25/09/2026: o respiro entre o título de cada etapa e seus
cards foi restaurado. A largura útil de Início, Aprender e Exemplos usa agora a
mesma variável de margem, inclusive na versão móvel; o conteúdo do hero
promocional não aceita seleção de texto.

Recorte concluído em 25/09/2026: iniciar uma aula abre um projeto identificado
com o componente estudado e, para sensores já suportados, prepara a porta P1
com a configuração correspondente. O editor mostra um chip discreto do
contexto da aula, removível sem perder o projeto.

Recorte concluído em 25/09/2026: os subtítulos explicativos voltaram aos cards
das etapas da trilha. A área antes chamada **Exemplos** foi renomeada para
**Projetos prontos** em navegação, página inicial, cabeçalho e trilha de
navegação. O contexto de uma aula também passou a acompanhar o projeto ao
reabrir sua aba.

Recorte concluído em 25/09/2026: em telas desktop, a navegação lateral foi
fixada no viewport da área de arquivos. A rolagem de Início, Aprender e
Projetos prontos ocorre somente no painel de conteúdo à direita, sem deslocar
o menu.

Recorte concluído em 25/09/2026: o estilo crítico do atalho de acessibilidade
passou a carregar no cabeçalho do documento. Assim, o atalho permanece oculto
desde o primeiro quadro após F5 e só aparece quando recebe foco por teclado.

Recorte concluído em 25/09/2026: o editor recebeu um monitor de leituras ao
vivo do hub. Ele exibe o estado atual das portas configuradas e um histórico
compacto por entrada, sem abrir novos painéis permanentemente no editor. A
telemetria usa apenas as leituras já fornecidas pelo hub conectado.

Recorte concluído em 25/09/2026: Projetos prontos agora carregam um desafio
com critérios verificáveis no editor. O painel só aparece para projetos com
desafio, atualiza a lista conforme os blocos mudam e separa o que foi atendido
do que ainda falta construir.

Recorte concluído em 25/09/2026: as categorias do Blockly foram redesenhadas
como cartões compactos, com fundo tonal, borda, marcador de cor e estado de
seleção por categoria. A mudança preserva o toolbox nativo, os atalhos e o
arrastar de blocos, mas aproxima sua linguagem visual do restante da EVORA.

Refinamento em 25/09/2026: os marcadores geométricos dos cartões de categoria
foram removidos. Cada cartão agora usa a cor inteira de sua categoria, com
texto de alto contraste e uma seleção mais escura. O fundo interno que o
Blockly aplicava atrás do rótulo selecionado também foi neutralizado, deixando
o cartão visualmente contínuo.

Refinamento em 25/09/2026: o conteúdo dos cartões do menu Blockly foi
centralizado verticalmente; os ícones nativos residuais foram ocultados e os
cartões agora usam cursor de ação no hover.

Refinamento em 25/09/2026: cada categoria Blockly agora possui uma área neutra
e reservada para seu futuro ícone SVG. Os indicadores de seleção do Blockly
foram removidos também do conteúdo interno, preservando o cartão preenchido
como uma única superfície.

Correção em 25/09/2026: a decoração dos cartões Blockly passou a aguardar a
montagem assíncrona das categorias pelo editor, evitando a exibição temporária
do marcador nativo e garantindo a reserva para os ícones desde a abertura.

Correção em 25/09/2026: a abertura de um projeto agora sinaliza explicitamente
o editor Blockly para aplicar a decoração das categorias depois do redimensionamento
do workspace, inclusive quando a árvore visual já estava criada.

Correção em 25/09/2026: os cartões das categorias Blockly foram extraídos para
um módulo visual independente do simulador. Assim, cor, cursor e espaço para os
ícones SVG são aplicados mesmo quando o editor é criado em outra ordem.

Refinamento em 25/09/2026: o menu Blockly adotou o padrão dos painéis do
editor — cartões brancos com linha lateral colorida. Os fundos internos de
seleção do Blockly foram anulados e cada categoria ganhou um símbolo temporário
na própria cor, pronto para ser substituído por SVG.

Correção em 25/09/2026: a área de ícone agora é inserida no início do contêiner
da categoria, sem assumir a estrutura interna do rótulo do Blockly. Isso evita
interrupções na renderização e preserva os textos das categorias.

Correção em 25/09/2026: a faixa vertical interna que o Blockly aplica à linha
da categoria foi removida. Cada cartão mantém somente a linha lateral externa
do sistema visual EVORA.

Etapa de qualidade em 25/09/2026: a suíte estática passou a cobrir o módulo
autônomo dos cartões Blockly. O cenário Chromium também valida a seleção de
uma categoria e confirma que o fundo e a faixa internos nativos não retornam.

Refinamento em 25/09/2026: os cartões de categoria Blockly ganharam foco
visível na cor da própria categoria e mantêm a navegação nativa por teclado.
O cenário Chromium cobre foco e seleção por Enter.

Etapa concluída em 25/09/2026: o menu lateral da página inicial passou a
oferecer **Configurações**, com modal próprio para o modo de alto contraste
persistente. O modo reforça bordas, texto, foco e flyout do Blockly, sem
alterar o projeto ou a programação.

Refinamento em 25/09/2026: Configurações também permite reduzir animações
continuas do simulador por preferência persistente, complementando o respeito
automático à configuração de movimento reduzido do sistema.

Etapa concluída em 25/09/2026: a divisão entre simulador e workspace tornou-se
ajustável por arraste ou teclado, com largura salva localmente. A melhoria
resolve a limitação de painéis fixos apontada na etapa de reorganização do
editor.

Refinamento em 25/09/2026: o divisor do simulador passa a restaurar o tamanho
padrão com duplo clique e anuncia a largura atual para leitores de tela.

Etapa de qualidade em 25/09/2026: o cenário Chromium do divisor cobre também
o arraste real com ponteiro, além de teclado, persistência e restauração.

## Pendências de produto

1. substituir o servidor estático por um fluxo de empacotamento/versionamento
   quando a IDE deixar de ser demo;
2. criar testes de navegador para editor, geração, mídia, simulador e falhas de
   rede;
3. separar o núcleo inline de `index.html` em módulos com contratos explícitos;
4. persistir mídia localmente de forma versionada, em vez de depender apenas
   de mapas de sessão;
5. finalizar a geração executável de módulos locais multi-hub;
6. integrar descoberta CAN real, transferência, retomada e confirmação por nó;
7. adicionar validação de tamanho, nome, hash e versão no pacote antes do envio;
8. documentar compatibilidade por versão da IDE, firmware e manifesto.

## Divergências que precisam ser resolvidas

Estas diferenças foram encontradas no código/documentação e não devem ser
silenciadas:

| Tema | IDE | Firmware/documentação | Ação |
| --- | --- | --- | --- |
| Display | perfil `320x240` | contrato de mídia e bancada usam `240x240` | escolher dimensão oficial e atualizar perfil, conversão e docs |
| IMU | perfil EVORA v3: `BMI270` | driver e diagnóstico: `BMI270`; unidades ainda brutas | validar bancada, depois alinhar escala, orientação e calibração |
| Encoders | blocos adicionais podem existir no módulo de blocos | Hub Base v1 não expõe encoder interno | garantir que blocos Pro permaneçam bloqueados no perfil Base |
| Portas de sensor | seis portas configuráveis | seis portas configuráveis | decisão confirmada em 24/09/2026; manter esse limite em IDE, firmware e documentação |
| Multi-hub | implantação, retomada e início sincronizado por contrato | runtime e protocolo implementados | validar CAN físico, perda e retomada em bancada |

## Critério para declarar uma capacidade pronta

Uma capacidade só deve ser apresentada como pronta na IDE quando houver:

- contrato documentado e versionado;
- validação estática/automatizada;
- implementação correspondente no firmware;
- comportamento seguro em caso de erro;
- validação física quando envolver energia, motor, CAN, rádio, áudio ou
  sensores reais.
