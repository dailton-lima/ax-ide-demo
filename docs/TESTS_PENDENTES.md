# Testes pendentes de ambiente

## Firmware Python

O terminal integrado ainda não reconhece `python` nem `py`. Assim que o
interpretador estiver disponível nesta sessão, executar na raiz de
`ax-firmware`:

```powershell
python -m pytest tests\test_hardware_profile.py -q
python -m pytest tests\test_hub_protocol.py -q
```

Depois, com `pytest` disponível, executar a suíte completa:

```powershell
python -m pytest -q
```

Também revisar `tests/check_project_package.mjs` após inicializar o submódulo
`micropython/`; no checkout atual ele não está presente, então o teste não abre
o manifesto da placa.

O teste de protocolo inclui a retomada CAN: após um timeout, a transferência
deve continuar do último chunk confirmado pelo hub remoto e ainda rejeitar um
trecho parcial cujo hash não corresponda ao pacote.

Ele também verifica que uma nova implantação limpa as confirmações do projeto
anterior antes de liberar qualquer início sincronizado.
