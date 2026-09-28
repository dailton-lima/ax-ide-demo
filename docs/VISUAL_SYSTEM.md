# Sistema visual da EVORA Studio

Atualizado em 23/09/2026.

## Público e princípios

A interface inicial atende estudantes do Ensino Fundamental II e Ensino Médio,
em computadores e tablets. O sistema visual deve transmitir criatividade sem
parecer infantil, manter baixa densidade e deixar ações importantes evidentes.

Princípios:

- uma ação principal por seção;
- conteúdo educacional próximo da criação, sem bloquear o editor;
- superfícies claras, raios contidos e sombras usadas somente quando indicam
  sobreposição;
- cor usada para hierarquia e estado, não como decoração excessiva;
- nomes e unidades completos antes de abreviações;
- interação por toque com alvos confortáveis;
- recursos avançados disponíveis sem poluir o modo básico.

## Direção de acabamento

- evitar gradientes decorativos, slogans genéricos e ilustrações abstratas sem
  função;
- não usar emoji como ícone de produto;
- preferir títulos descritivos, instruções diretas e metadados verificáveis;
- limitar variações de card, raio e sombra para que a interface não pareça uma
  coleção de componentes independentes;
- usar números ou códigos curtos como fallback enquanto o ícone oficial não
  estiver disponível;
- manter o espaço do ícone identificado com `data-icon`, permitindo inserir os
  SVGs oficiais sem alterar a estrutura ou o texto acessível.

Os SVGs devem usar `currentColor` quando possível, ter `viewBox` consistente e
não conter texto convertido em curvas. Ícones apenas decorativos recebem
`aria-hidden="true"`; ações sem rótulo visual precisam de `aria-label`.

## Identidade

| Papel | Cor | Uso |
| --- | --- | --- |
| Primária | `#2563EB` | navegação ativa, ação principal e foco |
| Fundo | `#F8FAFC` | fundo geral da aplicação |
| Ação | `#10B981` | sucesso, execução e progresso |
| Apoio | `#8B5CF6` | aprendizagem, mídia e recursos auxiliares |
| Texto neutro | `#475569` | texto secundário e controles neutros |
| Texto forte | `#0F172A` | títulos e conteúdo principal |

A marca visível é **EVORA Studio**. Identificadores internos `axioma_*` e
contratos existentes permanecem estáveis até uma migração técnica versionada,
para não quebrar firmware, projetos e testes.

## Estrutura inicial

### Início

- navegação lateral leve em desktop;
- navegação compacta em tablet;
- hero promocional apresenta a proposta da plataforma sem substituir as ações
  de projeto;
- projetos e ações de importação em uma seção própria;
- atalhos de aprendizagem levam à trilha específica do componente;
- cada item do menu lateral abre uma página distinta, sem ações duplicadas.

### Aprender

- catálogo individual por atuador, sensor ou recurso do hub;
- filtros por tipo e busca por nome;
- cada aula contém objetivo, materiais, blocos, sequência prática, atividade e
  desafio;
- componentes ainda sem driver ou validação física ficam marcados como
  `Em breve`, sem prometer execução que o firmware ainda não oferece.

### Exemplos

- catálogo exclusivo de robôs e mecanismos completos;
- cada card informa nível, tema, hardware e desafio de personalização;
- `Criar projeto` gera uma cópia editável com blocos já montados;
- exemplos não são misturados com aulas nem abrem o mesmo modal de Aprender.

### Editor

- barra superior única para projeto, abas, Blocos/Python e configuração;
- simulador permanece na coluna esquerda durante toda a programação;
- a coluna direita alterna entre **Blocos** e **Python**;
- modo básico/avançado permanece junto ao contexto do workspace;
- Blocos e Python ocupam a mesma superfície e não disputam largura;
- mídia abre em modal com ações explícitas para áudio e imagem;
- em tablet, a ordem simulador → programação é preservada horizontalmente;
- conexão com o hub combina texto e indicador visual, sem depender só da cor.

O editor ocupa a altura útil da janela e não cria rolagem vertical na página.
Cada região controla a própria rolagem. Menus sobrepostos devem abrir acima do
Blockly, nunca atrás do workspace.

Salvar, baixar e **Enviar ao hub** ficam na barra inferior persistente. Enviar
usa a cor de ação verde, enquanto download usa a cor de apoio roxa. Ações de
configuração não devem competir visualmente com elas.

O simulador usa uma superfície azul suave; a área de programação recebe uma
borda superior roxa. Essa divisão cromática identifica os dois contextos sem
encher a interface de cards independentes.

Dentro do simulador, cada atuador ou sensor usa um cartão compacto com porta,
ilustração e estado próximos. Dispositivos usam até duas colunas e um item
isolado ocupa a largura inteira. Cabos e hub ficam fora dos cartões, com espaço
vertical próprio, para que nomes e estados nunca cubram o equipamento central.
Os cartões de motor usam identificação, desenho e estado em linhas próprias;
todos fazem parte do fluxo rolável do palco e nenhum elemento de dispositivo
deve usar posicionamento `sticky`.

Em tela cheia, o simulador ocupa integralmente o viewport, preserva o cabeçalho
próprio com executar, reiniciar e fechar, e oculta visualmente as demais
camadas da IDE por sobreposição — sem alterar o estado do projeto.

O Blockly segue estas regras:

- toolbox branca com categorias compactas e seleção azul;
- flyout e workspace em cinza muito claro;
- blocos mantêm cores por categoria e recebem profundidade discreta;
- seleção usa contorno escuro visível;
- scrollbars e controles de zoom usam tons neutros;
- o modo Básico continua sendo a visualização inicial.
- projetos novos exibem **Início** e **Sempre** lado a lado, com margem segura
  em relação à toolbox e ao topo do workspace.

A referência estrutural é o MakeCode Mindstorms: hardware/simulação à esquerda
e criação à direita. Cores, raios, tipografia e densidade seguem o sistema
visual próprio da EVORA, sem copiar a identidade da plataforma de referência.

## Responsividade

- acima de `1120px`: navegação completa e editor em múltiplas colunas;
- de `761px` a `1120px`: navegação compacta, editor em fluxo vertical e barra
  de projeto adaptável;
- até `760px`: navegação superior compacta, cards em coluna e formulários de
  uma coluna.

## Acessibilidade mínima

- foco visível em todos os controles;
- contraste de texto compatível com fundo claro;
- redução de animação respeitando `prefers-reduced-motion`;
- rótulos textuais preservados na árvore de acessibilidade;
- ações críticas não dependem apenas de cor;
- componentes devem continuar utilizáveis com teclado e toque.
