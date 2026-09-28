# Compatibilidade do IMU — IDE e firmware

**Auditoria em 25/09/2026.** Este documento separa o que funciona na
simulação do que está comprovado para o Hub Base físico.

## Estado atual

| Tema | IDE / simulador | Firmware atual | Situação |
| --- | --- | --- | --- |
| API Python | `axioma.Motion().get_accel()` e `get_gyro()` | Expõe os mesmos dois métodos e retorna tuplas X/Y/Z | Alinhado estruturalmente |
| Acelerômetro | Controles de -1000 a 1000 mg; repouso Z = 1000 mg | Devolve `int16` bruto, sem escala configurada/documentada | Não compatível por unidade |
| Giroscópio | Controles de -180° a 180° | Devolve `int16` bruto, sem escala, filtro ou integração documentados | Não compatível por unidade |
| Inclinação | Derivada de aceleração X/Y no simulador | Não há método de inclinação | Apenas simulação |
| Guinada | Usa diretamente o eixo Z do giroscópio | Não há integração de ângulo/heading; `get_gyro()[2]` é velocidade bruta | Apenas simulação |
| Modelo anunciado | Perfil EVORA v3 informa BMI270 | Driver nativo usa a API oficial Bosch BMI270; diagnóstico também identifica BMI270 | Implementado; falta bancada |
| Capacidades físicas | Blocos seguem disponíveis no simulador | Perfil do firmware não anuncia `imu.6axis` nem `imu.heading` enquanto `imu_driver_ready` for falso | Envio de projeto com IMU é bloqueado com segurança |

## Evidências no repositório do firmware

- `firmware/usermod/native/modules/modmotion.c` inicializa e lê registros do
  **BMI160** e retorna os valores crus de 16 bits.
- `firmware/usermod/native/include/axioma_board.h` define
  `AXIOMA_BMI160_ADDR` em `0x68`.
- `firmware/usermod/python/axioma_hardware_profile.py` e
  `studio-profile.js` anunciam `HARDWARE["imu"] = "BMI270"` no perfil v3,
  preservando a capacidade `imu.heading` como contrato ainda não calibrado.
- O módulo nativo usa `bmi270_init()`, carrega o arquivo de configuração
  oficial da Bosch e habilita aceleração e giroscópio a 100 Hz. O diagnóstico
  do AxiomaOS identifica o BMI270.

## Decisão de compatibilidade para a IDE

Até a validação em hardware e a normalização da API:

1. O card deve ser apresentado como **IMU virtual** e seus controles servem
   exclusivamente à simulação.
2. A geração existente de `get_accel()` e `get_gyro()` é mantida, pois a forma
   da API coincide, mas a IDE não deve prometer mg, graus ou guinada física.
3. Os blocos de inclinação e guinada permanecem recursos de simulação e devem
   ganhar aviso de compatibilidade no fluxo de envio quando o hub físico for
   integrado.
4. Até o driver BMI270 ser validado, o descritor do firmware não anuncia as
   capacidades de IMU; assim, a verificação de pré-envio da IDE recusa projetos
   que dependem delas em vez de enviá-los a um hub incompatível.

## Contrato necessário antes de liberar como hardware real

O firmware deve definir e testar:

1. faixa e escala de `get_accel()` e `get_gyro()`; preferencialmente mg e °/s;
2. orientação do eixo e posição de repouso do hub;
3. método explícito para orientação/heading, com política de calibração e
   comportamento quando não houver magnetômetro;
4. teste de bancada com repouso, inclinação nos três eixos e giro controlado.

Após esses itens, os limites e nomes do simulador devem ser ajustados ao
contrato resultante e a cobertura Chromium convertida em teste de regressão do
contrato.
