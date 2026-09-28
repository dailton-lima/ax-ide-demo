# Contratos da EVORA Studio com o firmware

## Perfil declarado pela IDE

`window.AXIOMA_HARDWARE_PROFILE` declara o perfil `axioma-hub-base-v1` e,
atualmente, informa:

- quatro motores DC em malha aberta;
- dois servos;
- seis portas de sensor;
- IMU e bateria;
- áudio PCM, display RGB `240 × 240` e CAN multi-hub;
- USB do dispositivo.

O Hub Base não possui encoder interno. Os blocos de encoder e movimento por
rotações/distância são reservados a um perfil Pro futuro e não devem aparecer
na caixa de blocos do perfil Base.

Esse objeto é a fonte de capacidades usada pela IDE. Ele precisa permanecer
coerente com `axioma_hardware_profile.py` e com o manifesto da placa. Uma
alteração de capacidade exige atualizar código, documentação e testes de
contrato juntos.

## Portas

Os tipos de porta usados pela IDE são:

| Tipo | Modo | Situação |
| --- | --- | --- |
| `none` | — | livre |
| `touch` | digital | suportado |
| `line` | analógico | suportado no fluxo de IDE |
| `light` | analógico | suportado no fluxo de IDE |
| `pot` | analógico | suportado no fluxo de IDE |
| `color` | I²C | depende do CI/driver escolhido |
| `i2c` | I²C | genérico; não implica driver funcional |

No modo de hub único, a configuração é um vetor de seis posições. No modo
multi-hub, `studio-multihub.js` mantém as portas por hub e restringe o seletor
dos blocos ao hub indicado. O manifesto distribuído usa `schema: 2`,
`mode: 'distributed'` e `ports_by_hub`.

## API HTTP consumida

| Rota | Método | Uso |
| --- | --- | --- |
| `/api/status` | GET | nome, bateria, Wi-Fi, versão e espaço |
| `/api/config` | POST | salva nome e configuração Wi-Fi |
| `/api/format` | POST | formata armazenamento; ação destrutiva |
| `/upload` | POST | envia o Python com `X-Axioma-Project` |
| `/assets/audio/<nome>.wav` | POST | envia WAV PCM |
| `/assets/images/<nome>.rgb565` | POST | envia imagem RGB565 |
| `/api/projects` | GET | lista projetos no bloco |
| `/api/projects/<nome>/run` | POST | inicia projeto |
| `/api/projects/<nome>` | DELETE | remove projeto |
| `/api/projects/<nome>/manifest` | POST | confirma o manifesto do pacote |
| `/api/sensors?ports=...` | GET | leituras ao vivo das portas locais |
| `/api/diagnostics` | GET | relatório JSON de diagnóstico |
| `/api/hubs` | GET | catálogo/topologia multi-hub |

A IDE usa timeout de seis segundos nas chamadas HTTP. Falhas devem deixar a
interface em estado seguro e visível; não devem ser tratadas como confirmação
de envio.

## Projeto e mídia

O pacote usa um arquivo Python, ativos e um manifesto. A IDE envia o manifesto
por último para que o firmware só anuncie um pacote depois de receber os
componentes. Áudio importado deve chegar como WAV; imagem deve chegar como
RGB565. A conversão e o limite de imagem precisam continuar compatíveis com o
contrato de mídia do firmware.

## Multi-hub

O projeto tem um único **Início** global. Blocos físicos escolhem hub e porta;
o fluxo não deve criar um bloco Início por hub. O compilador organiza um plano
distribuído com recursos locais, tópicos/eventos e caches remotos.

O estado atual é deliberadamente honesto: o manifesto pode conter `ready:false`
e módulos declarativos não executáveis. O botão de envio não deve ser usado
como prova de que a execução distribuída está pronta.

## Diagnóstico

O painel de diagnóstico baixa o JSON retornado por `/api/diagnostics`. O JSON
é evidência do estado do bloco, não do navegador; não incluir conteúdo de
programas no relatório sem uma decisão explícita de privacidade.
