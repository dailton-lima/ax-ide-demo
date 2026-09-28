# Compatibilidade de envio — IDE e Hub EVORA

Antes de enviar um projeto, a IDE monta uma lista de capacidades exigidas pelos
blocos usados: motores, servo, seis portas de sensores, IMU, áudio e display.
Essa lista entra em `target.requires` no manifesto do projeto.

O endpoint `GET /api/status` do firmware expõe o descritor do hardware em
`hardware`, com `id`, `version` e `capabilities`. Quando essa informação está
disponível, a IDE bloqueia o envio para outro perfil, para firmware anterior ao
perfil solicitado ou para uma capacidade ausente. Hubs com firmware legado sem
esse campo continuam recebendo o manifesto, que é validado pelo firmware.

O código gerado também recebe um descritor `package` no manifesto: formato,
tamanho em bytes e SHA-256. A IDE calcula o hash antes do envio e o firmware
reabre o arquivo já gravado para conferir tamanho e hash antes de aceitar o
manifesto. Áudio e imagens recebem os mesmos metadados e são conferidos pelo
firmware em leitura por blocos, sem carregar o arquivo inteiro na memória.
Manifests legados sem esse campo ainda podem ser lidos.

## Implantação CAN

Em projetos multi-hub, a IDE envia os envelopes locais ao coordenador em
`POST /api/hubs/deploy`. O firmware valida o envelope do próprio coordenador,
enfileira os destinos CAN já descobertos e expõe a fila e as confirmações em
`GET /api/hubs`. A implantação não inicia o robô automaticamente: a execução
permanece bloqueada até `POST /api/hubs/start`. Essa rota só agenda o início
quando cada módulo remoto recebeu confirmação; a IDE mostra o botão **Iniciar
sincronizado** no monitor multi-hub.

O monitor mantém esse botão desativado até a sessão de implantação existir, os
hubs remotos configurados estarem online e todos os módulos remotos informarem
`ready`. Em caso de timeout, apenas **Retomar envio** fica habilitado; ele chama
`POST /api/hubs/resume` e o protocolo continua a partir do último chunk
confirmado. Esses estados são controles de segurança da interface e não
substituem a validação física da rede CAN.

Em firmware compatível, `GET /api/hubs` também expõe `actions.resume` e
`actions.start`. Esses valores são calculados pelo coordenador a partir da
sessão, da fila, dos ACKs e de conflitos de ID; a IDE os prioriza. Para
firmware anterior, ela preserva a mesma regra usando os campos de implantação
já publicados.

O campo `actions.reason` acompanha essa decisão com um estado estável, como
`deployment_active`, `awaiting_confirmation`, `resume_available`,
`ready_to_start` ou `can_id_conflict`. A IDE converte esse estado em orientação
em português, sem usar o texto do firmware como mensagem de interface.

O mecanismo não normaliza unidades da IMU. O perfil EVORA v3 declara o BMI270,
mas a migração do driver, as unidades físicas e a calibração continuam
pendentes, conforme
[IMU_COMPATIBILITY.md](IMU_COMPATIBILITY.md).
