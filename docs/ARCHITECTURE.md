# Arquitetura da EVORA Studio

## Visão geral

`index.html` é o ponto de composição da IDE. Ele contém a casca visual, o
estado básico do editor, o gerador Python e a integração com o hub. Os módulos
`studio-*.js` são carregados no final da página e estendem o editor por meio de
eventos, funções globais e elementos inseridos na interface.

```text
index.html
├── studio-profile.js           perfil de hardware e renderizador Blockly
├── studio-projects.js          estado local, projetos e tipos das seis portas
├── studio-program.js           workspace, validação e geração MicroPython
├── studio-ports.js             interface e aplicação da configuração de portas
├── studio-media.js             conversão de áudio e imagem para o Hub Base
├── studio-transport.js         conexão, configuração e envio ao Hub Base
├── arquivos e abas
├── workspace Blockly
├── configuração de portas e mídia
├── geração MicroPython
├── conexão Wi-Fi / USB e envio
└── extensões carregadas em sequência
    ├── studio-enhancements.js  UX, arquivos, níveis e manifesto USB
    ├── studio-blocks.js        blocos adicionais e geradores
    ├── studio-learning-mode.js modo de aprendizagem
    ├── studio-multihub.js      topologia, validação e plano distribuído
    ├── studio-simulator.js     simulador visual
    ├── studio-live-sensors.js  leituras ao vivo
    ├── studio-diagnostics.js   exportação de diagnóstico
    ├── evora-ui.js             páginas Início, Aprender e Exemplos
    └── evora-editor.js         composição e modos do espaço de trabalho
```

## Estado do cliente

O armazenamento principal é `localStorage`, na chave
`axioma-studio-projects-v3`. O conteúdo é um envelope de versão `4`, com data
de salvamento e a lista de projetos. Antes de cada salvamento explícito, a IDE
guarda a cópia anterior em `axioma-studio-projects-v3-backup`; se o conteúdo
principal estiver inválido, ela recupera essa cópia e informa o usuário. Listas
legadas sem envelope continuam legíveis e são migradas no próximo salvamento.
Cada projeto contém, no mínimo:

- `id`, `name` e `updatedAt`;
- `config`, com seis posições de sensor no modo de hub único;
- `workspace`, serialização Blockly;
- dados de topologia quando o modo multi-hub está ativo;
- referências de mídia; os bytes ficam no IndexedDB
  `axioma-studio-assets-v1`, separados por projeto e tipo de mídia.

Ao abrir um projeto, a IDE limpa o workspace, restaura a serialização e gera o
código novamente. Projetos novos recebem as raízes **Início** e **Sempre** com
recuo visual; projetos existentes muito próximos das bordas são deslocados
para uma margem segura sem alterar as conexões. Alterações de blocos salvam automaticamente. O botão
**Salvar** atualiza nome, workspace e data local.

## Fluxo de geração

1. Blockly serializa o workspace.
2. `validate()` verifica exatamente um bloco **Início**, portas compatíveis e
   referências de mídia.
3. Os geradores Blockly produzem chamadas para `axioma`, `axioma_media` e
   `time`; raízes **Sempre** são incluídas depois da inicialização principal.
4. A configuração de cada porta gera chamadas `axioma.configure_port(...)`.
5. O texto Python é exibido no painel e pode ser baixado como `.py`.
6. No envio, o código é transferido antes da mídia; o manifesto é enviado por
   último quando o fluxo usa a API HTTP do firmware.
7. O manifesto declara as capacidades exigidas pelos blocos usados. A IDE
   compara esse contrato ao descritor físico recebido em `/api/status` quando o
   firmware o disponibiliza.

## Espaço de trabalho do editor

`evora-editor.js` reorganiza os controles já criados pelos módulos sem trocar
seus IDs ou seus handlers. Isso preserva os contratos atuais e mantém duas
áreas permanentes:

- **Simulador**, fixo à esquerda, com entradas e saídas virtuais;
- **Programação**, à direita, alternando entre Blockly e Python.

A barra superior única reúne retorno aos projetos, nome, abas, novo projeto,
seletor Blocos/Python e o menu **Configurar**, que agrupa portas, mídia e
multi-hub. A conexão permanece no cabeçalho global da aplicação, evitando um
segundo botão com o mesmo estado dentro do editor.

Salvar, baixar Python e enviar ao hub ficam na barra inferior persistente. Os
elementos originais são movidos, e não duplicados; portanto, os handlers de
salvamento, download e envio continuam sendo os definidos pelo núcleo e pelas
extensões do firmware.

Blockly e Python ocupam a mesma coluna e são mutuamente exclusivos. A troca
não descarrega o workspace nem remove o simulador. Em tablet, a composição
horizontal é preservada e a área passa a permitir rolagem horizontal quando a
largura mínima do editor não couber. A biblioteca de mídia mantém os inputs
originais e oferece os mesmos seletores também dentro do modal.

No desktop, a página do editor fica contida na altura disponível da janela.
Rolagens necessárias acontecem dentro do palco do simulador, Blockly ou painel
Python. O menu Configurar usa uma camada acima do workspace.

Preferências puramente visuais, como a última visualização aberta, usam a chave
`evora-editor-view-v2`. O estado do projeto continua em
`axioma-studio-projects-v3`, com uma cópia de recuperação local; mídias usam o
IndexedDB independente.

## Extensões e pontos de integração

As extensões dependem de símbolos existentes no escopo global do `index.html`,
como `project()`, `workspace`, `req()`, `save()`, `generate()`, `audio`,
`images`, `TYPES` e `activeId`. Ao alterar a ordem dos scripts, preserve essas
dependências ou transforme-as em um módulo explícito antes de refatorar.

Os primeiros recortes do núcleo já foram extraídos: `studio-profile.js` carrega
o perfil oficial do Hub Base e o renderizador Blockly; `studio-projects.js`
mantém o estado local, arquivos, abas, persistência e o contrato de seis
portas; e `studio-program.js` concentra a criação/carregamento do workspace,
a validação e a geração de MicroPython. `studio-ports.js` assume o modal das
seis entradas e atualiza a caixa de blocos e o código imediatamente após uma
alteração. Os módulos preservam o escopo global legado para as extensões atuais.
`studio-media.js` prepara áudio mono a 16 kHz e imagens RGB565 de `240 × 240`
no navegador. `studio-transport.js` concentra o status do hub, a configuração
de rede, o envio pela API Wi-Fi e o encaminhamento para o transporte serial USB.

Eventos usados entre módulos:

- `axioma:topology-preview` — atualiza a prévia do simulador enquanto a
  topologia está sendo editada;
- `axioma:topology-change` — descarta a prévia temporária e renderiza de novo;
- eventos de alteração Blockly — regeneram código e simulador.

## Simulador

O simulador mantém estado por projeto e por hub: motores, servos, botões,
bateria, LCD, sensores e animações. Ele executa um subconjunto dos blocos,
permite editar valores de sensores e mantém botões pressionados entre
`pointerdown` e `pointerup`. O bloco **Sempre** é executado em ciclo local.
Atuadores e sensores são renderizados em cartões compactos: porta, ilustração,
estado e controle formam uma unidade, enquanto cabos e o hub ficam em linhas
separadas para impedir sobreposição quando vários dispositivos estão ativos.
As regiões usam classes específicas `actuators` e `sensors`; nomes genéricos
como `top` não devem ser usados, pois o cabeçalho global utiliza essa classe com
posicionamento fixo durante a rolagem.

O simulador deve ser tratado como ferramenta de feedback visual e regressão de
fluxo. Uma execução bem-sucedida nele não significa que o programa foi
validado no ESP32-S3.

No modo de tela cheia, o simulador continua no mesmo nó do editor, mas o
contexto de empilhamento da grade é neutralizado temporariamente. O painel usa
posicionamento fixo, cobre `100vw × 100dvh` e fica acima do cabeçalho, Blockly e
barra inferior. Ao sair, as classes temporárias são removidas e a geometria
normal da coluna esquerda é restaurada.

## Servidor de desenvolvimento

`dev-server.js` é deliberadamente mínimo: escuta em `127.0.0.1`, resolve apenas
arquivos dentro da pasta da IDE, aplica `no-store` e define MIME types básicos.
Ele não possui autenticação, HTTPS, proxy, websocket ou tratamento de API.
