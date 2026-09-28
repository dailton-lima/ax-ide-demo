# EVORA Studio — IDE web

IDE web local do hub EVORA. O projeto permite criar programas visuais com
Blockly, gerar MicroPython, configurar portas, anexar mídia, simular o
programa e transferir o pacote para um hub por Wi-Fi ou armazenamento USB.

Esta pasta contém o cliente da IDE e um servidor estático de desenvolvimento.
O firmware que executa o código e implementa os endpoints do bloco fica em
`../ax-firmware`.

## Estado atual

| Área | Situação |
| --- | --- |
| Editor Blockly e geração Python | Implementado no protótipo |
| Projetos locais | Implementado com `localStorage` do navegador |
| Portas, mídia e download `.py` | Implementado |
| Simulador visual local | Implementado; não substitui bancada |
| Conexão Wi-Fi/USB com o bloco | Implementada conforme os contratos do firmware |
| Leitura ao vivo e diagnóstico | Implementados quando o endpoint do firmware está disponível |
| Topologia multi-hub e plano distribuído | Editor/manifesto implementados; envio executável permanece bloqueado |
| Build e empacotamento | Ainda não há pipeline próprio nesta pasta |
| Testes automatizados locais | Contratos Node e cenários end-to-end Chromium |

## Executar localmente

O servidor usa somente Node.js e módulos nativos:

```powershell
cd ax-ide-demo
node dev-server.js
```

Abra `http://127.0.0.1:8123/`. A porta pode ser alterada com
`AXIOMA_IDE_PORT`.

O servidor entrega arquivos estáticos. Ele não é um proxy para o firmware e
não implementa `/api/*`; esses endpoints são atendidos pelo próprio hub
Axioma quando a IDE aponta para o endereço do dispositivo.

## Testes locais

Sem dependências externas, execute a suíte de contratos da IDE com:

```powershell
node --test tests/ide_static.test.mjs
```

Ela verifica a sintaxe dos módulos críticos, o estado inicial Início/Sempre, o
isolamento visual de atuadores/sensores, o modo de tela cheia e o servidor
estático.

Com Playwright instalado, execute também os cenários reais no Chromium:

```powershell
npm ci
npx playwright install chromium
npx playwright test
```

Ou rode as duas camadas em sequência:

```powershell
npm test
```

## Documentação

- [Arquitetura](docs/ARCHITECTURE.md) — telas, módulos, estado e fluxo de dados.
- [Contratos](docs/CONTRACTS.md) — perfil de hardware, projeto, mídia e API do hub.
- [Desenvolvimento e testes](docs/DEVELOPMENT.md) — ordem de carregamento, edição e verificações.
- [Roadmap e pendências](docs/ROADMAP.md) — limites atuais, divergências e próximos passos.
- [Benchmark de funcionalidades](docs/FEATURE_BENCHMARK.md) — referências de outras plataformas e backlog priorizado.
- [Sistema visual](docs/VISUAL_SYSTEM.md) — identidade EVORA, responsividade e princípios de interface.
- [Conteúdo educacional](docs/LEARNING_CONTENT.md) — aulas por componente, projetos prontos e regras editoriais.

## Limites importantes

- O simulador é um interpretador educacional local: não modela latência CAN,
  corrente, inércia, ruído, temperatura ou falhas elétricas.
- O modo multi-hub representa a topologia e gera planos declarativos, mas o
  envio só deve ser liberado depois da geração/validação dos módulos locais e
  da validação física descrita no firmware.
- A seleção de sensores I²C não torna um driver disponível. Sensores sem CI e
  driver definidos devem continuar bloqueados ou marcados como pendentes.
