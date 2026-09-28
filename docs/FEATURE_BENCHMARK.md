# Benchmark de plataformas e backlog de funcionalidades

Atualizado em 23/09/2026.

## Objetivo

Este documento compara a EVORA Studio com ambientes educacionais de
programação e robótica. O objetivo não é copiar interfaces, mas identificar
padrões que diminuem a barreira de entrada, melhoram a aprendizagem e ajudam a
diagnosticar projetos reais.

Foram consideradas as imagens fornecidas de Microsoft MakeCode para
MINDSTORMS e LEGO Education SPIKE, a implementação atual da Axioma Studio e
fontes oficiais de MakeCode, LEGO Education, Tinkercad, Open Roberta, VEXcode
VR e Scratch.

## O que aparece nas referências visuais

### MakeCode MINDSTORMS

- página inicial com projetos recentes, criação e importação em primeiro plano;
- catálogo visual de primeiros passos e tutoriais por componente;
- trilhas separadas para display/hub, motores e sensores;
- representação permanente do hub e das portas ao lado do editor;
- busca de blocos e categorias simples, incluindo área avançada recolhida;
- fluxos superiores claros: `on start` e `forever`;
- alternância entre blocos e JavaScript;
- compartilhar, baixar, desfazer/refazer e zoom sempre acessíveis.

O catálogo oficial confirma tutoriais passo a passo para hub, motores, toque,
cor, giroscópio, ultrassom e infravermelho, além de blocos orientados a eventos
e objetos comuns de programação.

### LEGO Education SPIKE

- central de aprendizagem dentro da própria aplicação;
- início guiado em poucos passos;
- seleção explícita da família de hardware;
- novo projeto e abrir projeto próximos do conteúdo de aprendizagem;
- unidades curriculares, atividades introdutórias e ajuda contextual;
- tutoriais por componente com progressão numerada;
- biblioteca de instruções de montagem com miniatura e quantidade de passos;
- progressão de blocos por ícones para blocos por palavras e Python;
- lições abertas e atividades que combinam montagem, programação e reflexão.

A documentação oficial descreve a SPIKE App como uma aplicação voltada ao
aluno, reunindo primeiros passos, lições, instruções de montagem e progressão
até Python.

## Recursos valorizados em outras plataformas

### Tinkercad Circuits

- simulação antes de possuir ou conectar hardware;
- biblioteca de componentes e circuitos iniciais modificáveis;
- instruções passo a passo ao lado do espaço de trabalho;
- visualização **Blocos + Texto**, com código atualizado junto aos blocos;
- exportação do código nativo para continuar no hardware real;
- turmas por código e entrada de aluno sem conta individual obrigatória;
- modo seguro e projetos privados por padrão para estudantes.

O ponto forte para o Axioma é a ponte contínua entre aprender, simular e levar
o mesmo projeto ao dispositivo físico.

### Open Roberta Lab

- uma linguagem visual consistente para diferentes robôs e placas;
- configuração do robô separada da lógica do programa;
- simulador disponível sem hardware e compatível com vários sistemas;
- cenários personalizáveis, inclusive imagens de pistas de competição;
- ajuda detalhada para cada bloco;
- grupos educacionais nos quais docentes acompanham programas de alunos.

O ponto forte para o Axioma é separar claramente **configuração física**,
**programa** e **execução/simulação**, mantendo o mesmo modelo mental.

### VEXcode VR

- playgrounds que transformam a simulação em desafios com objetivo;
- exemplos executáveis e tutoriais dentro do ambiente;
- console de saída;
- monitor em tempo real de variáveis e sensores;
- documentação de blocos e Python com parâmetros, retorno e exemplos;
- progressão entre blocos e Python preservando a estrutura lógica.

O ponto forte para o Axioma é tornar o estado interno observável. Isso reduz a
tentativa e erro quando sensores ou condições não se comportam como esperado.

### Scratch

- criação orientada a projetos, histórias e experimentação;
- tutoriais curtos e ajuda para começar;
- compartilhamento e remix como forma de aprender com exemplos;
- ampla localização e vocabulário adequado à idade;
- separação visual simples entre paleta, programa e resultado.

Para o Axioma, a ideia reaproveitável é uma galeria moderada de projetos-base
que podem ser duplicados sem alterar o original.

## Matriz de implementação para a EVORA Studio

### P0 — fundação da plataforma

| Funcionalidade | Benefício | Situação atual | Implementação recomendada |
| --- | --- | --- | --- |
| Central inicial | orienta aluno antes do editor | lista apenas programas | cartões: Novo, Abrir/Importar, Primeiros passos, Projetos-base e Conectar bloco |
| Importar/exportar projeto completo | backup e troca de computador | download só de `.py`; estado local | formato versionado `.axioma.json` com workspace, portas, mídia, perfil e manifesto |
| Busca de blocos | reduz tempo para encontrar comando | categorias sem busca própria | campo de pesquisa sobre toolbox com sinônimos em PT-BR |
| Ajuda contextual de bloco | ensina no ponto de dúvida | limitada ao texto do bloco | botão/tooltip com descrição, entradas, unidade, exemplo e restrições de hardware |
| Monitor de execução | facilita diagnóstico | sensores ao vivo e JSON separados | painel único para sensores, variáveis, console, bateria, erros e hub de origem |
| Estado de conexão claro | evita envio para alvo errado | indicador simples | estados desconectado/conectando/conectado/incompatível, nome, versão e último contato |
| Compatibilidade IDE–firmware | previne pacotes inválidos | divergências conhecidas | negociação de versão, perfil e capacidades antes de habilitar envio |
| Recuperação de projetos | evita perda no navegador | `localStorage` | exportação automática, IndexedDB para mídia e recuperação após falha/recarregamento |
| Acessibilidade básica | amplia uso em sala | não documentada/testada | teclado, foco visível, contraste, leitores de tela, redução de movimento e escala de UI |

### P1 — aprendizagem integrada

| Funcionalidade | Referência | Implementação recomendada |
| --- | --- | --- |
| Primeiros passos guiado | SPIKE e MakeCode | sequência conectar → configurar porta → primeiro bloco → simular → enviar |
| Tutoriais por componente | MakeCode e SPIKE | hub/display, motor, servo, toque, analógico, IMU, áudio e multi-hub |
| Modo aula passo a passo | SPIKE e Tinkercad | instrução lateral, objetivo, dica, checagem automática e próximo passo |
| Projetos iniciais executáveis | Tinkercad e VEXcode | seguidor de linha, desvio de obstáculo, controle por botão, semáforo e música |
| Progressão de dificuldade | SPIKE | níveis Iniciante, Intermediário e Avançado alterando toolbox, ajuda e exemplos |
| Blocos + Python lado a lado | Tinkercad | seleção sincronizada bloco↔trecho gerado, sem prometer edição reversível inicialmente |
| Python editável em modo avançado | SPIKE/VEXcode | editor separado, autocompletar da API Axioma, exemplos e diagnóstico de sintaxe |
| Verificador de objetivo | VEXcode | desafios do simulador com critérios observáveis, pontuação e feedback explicável |
| Glossário e unidades | todas | termos de robótica, ícones, portas, `%`, graus, cm, lux, ms e Hz |

### P1 — simulador e depuração

| Funcionalidade | Benefício | Dependência |
| --- | --- | --- |
| Execução passo a passo | mostra fluxo do programa | interpretador do simulador com pausa por bloco |
| Bloco ativo destacado | conecta código e comportamento | mapa estável entre bloco e operação simulada |
| Breakpoints educacionais | inspeciona condição difícil | pausa, continuar e reiniciar determinísticos |
| Variáveis observáveis | revela estado interno | instrumentação do gerador e runtime |
| Console do aluno | permite mensagens e medidas | bloco `mostrar no console` e buffer limitado |
| Gráficos de sensores | mostra variação no tempo | séries temporais com unidade e taxa conhecidas |
| Timeline de eventos | explica botões, sensores e hubs | timestamps locais e remotos sincronizados |
| Cenários/pistas | transforma simulação em desafio | modelo de cenário 2D e importação segura de imagem |
| Falhas simuladas | ensina robustez | desconexão, bateria baixa, sensor ausente e timeout claramente marcados como simulação |
| Comparar simulado × real | identifica divergências | captura de telemetria do firmware e reprodução local |

### P2 — sala de aula e conteúdo

| Funcionalidade | Benefício | Cuidados |
| --- | --- | --- |
| Turmas por código | entrada simples do aluno | privacidade infantil, consentimento e retenção mínima |
| Painel do professor | acompanha progresso | separar metadados de conteúdo privado do projeto |
| Distribuir atividade | turma começa do mesmo ponto | cópia independente por aluno/grupo |
| Entregar e comentar | ciclo pedagógico completo | histórico, autoria e permissões |
| Rubricas/checklists | avaliação consistente | critérios transparentes, nunca nota automática opaca |
| Trabalho em dupla | colaboração | começar por compartilhamento de arquivo; tempo real é fase posterior |
| Biblioteca de aulas | reduz preparo docente | versionamento por firmware/perfil de hardware |
| Instruções de montagem | liga software ao robô | conteúdo próprio, passos, lista de peças e alertas de segurança |

### P2 — comunidade e extensibilidade

| Funcionalidade | Benefício | Recomendação |
| --- | --- | --- |
| Galeria moderada | inspiração e exemplos | projetos verificados, busca por idade/sensor/dificuldade |
| Duplicar/remixar | aprendizagem por modificação | preservar origem, licença e autoria |
| Compartilhar por arquivo/link | colaboração | privado por padrão; expiração e remoção do link |
| Extensões de hardware | novos sensores sem inflar núcleo | manifesto assinado com blocos, geradores, driver e simulador opcional |
| Perfis Base/Pro | capacidades coerentes | toolbox gerada pelo perfil detectado, sem mostrar blocos impossíveis |
| Internacionalização | adoção em escolas | strings externas ao código; começar por PT-BR e inglês |

## Conteúdo inicial recomendado

### Trilha “Conheça seu Axioma”

1. criar, salvar e recuperar um projeto;
2. conhecer hub, botões, tela e portas;
3. executar no simulador;
4. conectar com segurança;
5. enviar, parar e ler um diagnóstico.

### Tutoriais por componente

1. mostrar texto/imagem e tocar som;
2. motor com velocidade, sentido, tempo, freio e roda livre;
3. servo por ângulo;
4. botão de toque;
5. sensor analógico e limiar;
6. IMU e inclinação;
7. bateria e comportamento seguro;
8. dois hubs, eventos remotos e perda do enlace.

Sensores de cor/distância só devem entrar como tutoriais executáveis depois da
definição do CI, do driver e da validação física.

### Projetos-base

- robô que para ao tocar;
- controle diferencial e curvas;
- seguidor de linha no simulador;
- alarme de inclinação;
- painel de bateria;
- instrumento musical;
- animação no display;
- comunicação entre dois hubs, inicialmente como demonstração simulada.

## Ordem recomendada de entrega

### Marco 1 — não perder e não confundir

Importar/exportar projeto completo, persistência de mídia, compatibilidade
IDE–firmware, estados de conexão e acessibilidade básica.

### Marco 2 — aprender dentro da IDE

Central inicial, busca, ajuda contextual, primeiros passos, tutoriais por
componente e projetos-base.

### Marco 3 — entender o que o programa faz

Blocos + Python, monitor unificado, console, destaque do bloco ativo, execução
passo a passo e gráficos de sensores.

### Marco 4 — desafios e sala de aula

Cenários, verificadores de objetivo, biblioteca de aulas, turmas, entrega e
feedback do professor.

### Marco 5 — ecossistema

Galeria moderada, remix, extensões assinadas, perfis Base/Pro e colaboração.

## O que não deve ser priorizado agora

- colaboração simultânea em tempo real antes de existir formato de projeto
  robusto e recuperação de conflitos;
- marketplace aberto de extensões antes de assinatura, permissões e isolamento;
- simulação elétrica de alta fidelidade no estilo Tinkercad antes de estabilizar
  o simulador funcional de robótica;
- gamificação baseada apenas em pontos; primeiro devem existir objetivos,
  feedback útil e progressão pedagógica;
- recursos sociais públicos antes de políticas de moderação e privacidade para
  crianças e escolas.

## Fontes

- [MakeCode MINDSTORMS — tutoriais](https://makecode.mindstorms.com/tutorials)
- [MakeCode MINDSTORMS — linguagem de blocos](https://makecode.mindstorms.com/blocks)
- [LEGO Education — SPIKE App](https://education.lego.com/en-gb/downloads/spike-app/software/)
- [LEGO Education — atividades adicionais](https://education.lego.com/en-us/teacher-resources/lego-education-spike-prime/lesson-planning/lego-education-spike-prime-lesson-planning-additional-lessons-activities/)
- [Tinkercad — guia de Circuits](https://images.tinkercad.com/jl5ii4oqrdmc/4sMFqe3rDlbUymJt0I4yh/85a4487f7fe274e74c19870ae4679fc1/tinkercad-guides_circuits-Printable.pdf)
- [Autodesk — privacidade infantil e Tinkercad Classrooms](https://www.autodesk.com/company/legal-notices-trademarks/privacy-statement/childrens-privacy-statement)
- [Open Roberta — recursos e simulação](https://www.open-roberta.org/features/)
- [VEXcode VR — console e monitor](https://api.vex.com/vr/home/python/console.html)
- [VEXcode VR — playgrounds](https://api.vex.com/vr/home/playgrounds/index.html)
- [Scratch — visão geral](https://scratch.mit.edu/help/about/)
