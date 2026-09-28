# Conteúdo educacional da EVORA Studio

Atualizado em 23/09/2026.

Este documento define a separação entre as páginas **Aprender** e
**Projetos prontos**. Elas têm objetivos diferentes e não devem compartilhar o mesmo
atalho ou modal.

## Aprender

Aprender é um catálogo por componente. Cada aula apresenta objetivo, hardware
necessário, blocos usados, passos de montagem/programação, atividade guiada e
um desafio curto.

| Grupo | Aula | Nível | Duração | Estado |
| --- | --- | --- | --- | --- |
| Atuador | Motor DC | Iniciante | 12 min | Disponível |
| Atuador | Servo | Iniciante | 10 min | Disponível |
| Atuador | Display | Iniciante | 10 min | Disponível |
| Atuador | Alto-falante | Iniciante | 8 min | Disponível |
| Hub | Botões do hub | Iniciante | 9 min | Disponível |
| Sensor | Sensor de toque | Iniciante | 12 min | Disponível |
| Sensor | Sensor de linha | Intermediário | 16 min | Disponível |
| Sensor | Sensor de luz | Iniciante | 12 min | Disponível |
| Sensor | Potenciômetro | Iniciante | 10 min | Disponível |
| Sensor | IMU — movimento | Intermediário | 15 min | Disponível |
| Hub | Bateria | Iniciante | 8 min | Disponível |
| Sensor | Sensor de cor | Intermediário | — | Em breve |
| Sensor | Sensor de distância | Intermediário | — | Em breve |

Sensor de cor e sensor de distância permanecem como planejamento até que CI,
driver, blocos e validação física estejam definidos em conjunto com o firmware.

## Projetos prontos

Projetos prontos são robôs completos. Ao selecionar `Criar projeto`, a IDE
gera uma cópia editável e abre o editor Blockly.

| Projeto | Tema | Hardware principal | Conceito |
| --- | --- | --- | --- |
| Rover explorador | Movimento | 2 motores | avanço, tempo, parada e som |
| Robô que gira | Movimento | 2 motores | sentidos opostos e giro no eixo |
| Robô dançarino | Criatividade | 2 motores e áudio | sequência de movimentos |
| Guardião de toque | Sensores | sensor de toque | espera por evento e reação |
| Alarme de inclinação | Sensores | IMU e áudio | orientação e alerta |
| Sinalizador com servo | Mecanismos | 1 servo | posições angulares |

## Regra editorial

- aula ensina uma peça; exemplo combina peças em um robô;
- atalhos da página inicial devem abrir uma aula específica;
- o menu lateral sempre troca de página;
- um projeto pronto deve ser seguro, curto e totalmente editável;
- cada projeto pode receber um manual visual de montagem conforme o contrato em
  [ASSEMBLY_MANUALS.md](ASSEMBLY_MANUALS.md); enquanto os assets não existirem,
  o estado deve ser **montagem em preparação**;
- funcionalidades não suportadas pelo firmware devem aparecer como pendentes,
  nunca como disponíveis.
