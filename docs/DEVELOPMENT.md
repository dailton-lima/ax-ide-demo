# Desenvolvimento e testes

## Antes de editar

Leia, nesta ordem:

1. `../ax-firmware/README.md`;
2. `../ax-firmware/docs/firmware/AXIOMA_PROTOTYPE_STATUS.md`;
3. `../ax-firmware/docs/planning/AXIOMA_SOFTWARE_FIRST_ROADMAP.md`;
4. [CONTRACTS.md](CONTRACTS.md);
5. o módulo da funcionalidade alterada.

O firmware diferencia “implementado por software” de “validado em hardware”.
A documentação e a interface da IDE devem manter essa distinção.

## Ordem de carregamento

Não mova os scripts de `index.html` sem revisar as dependências globais. A
ordem atual é:

1. Blockly, tradução PT-BR e gerador Python;
2. `studio-profile.js`, com perfil de hardware e renderizador Blockly;
3. `studio-projects.js`, com estado, persistência, abas e tipos de porta;
4. script principal inline, tema, blocos e geradores base;
5. `studio-program.js`, com workspace, validação e geração Python;
6. manifesto/integração USB inline;
7. extensões de UX, blocos, aprendizagem, multi-hub, simulador, sensores e
   diagnóstico;
8. `studio-ports.js`, que aplica a configuração final das seis portas.
9. `studio-media.js`, que registra as importações de áudio e imagem.
10. `studio-transport.js`, que assume conexão e envio ao hub.

## Persistência local

Projetos usam um envelope versionado no `localStorage`, mais uma cópia de
recuperação da versão anterior. Não altere o formato sem atualizar o leitor de
migração em `studio-projects.js`. Os bytes de áudio e imagem usam IndexedDB em
`studio-media.js`; a abertura de um projeto limpa a mídia anterior e restaura
somente os recursos associados àquela aba.

## Alterações comuns

### Novo bloco

- registrar definição e gerador em `studio-blocks.js` ou no núcleo, conforme a
  categoria;
- adicionar o bloco à categoria do toolbox;
- validar compatibilidade com o perfil de hardware;
- implementar o comportamento correspondente no simulador, quando aplicável;
- atualizar a tabela de blocos/contratos e os testes de texto existentes.

### Novo sensor

- adicionar tipo, modo e rótulo em `TYPES`;
- definir validação da porta e unidade de leitura;
- atualizar manifesto e firmware;
- não habilitar bloco I²C específico sem CI, endereço, driver e teste de
  bancada definidos.

### Alteração multi-hub

Preserve: um único **Início**, seleção de hub apenas em hardware, IDs CAN
únicos, estado `unknown` quando não há telemetria e `ready:false` enquanto os
módulos locais não forem executáveis. Atualize também
`tests/check_ide_multihub.mjs`.

### Alteração de envio

Preserve a ordem código → mídia → manifesto. O manifesto é a confirmação do
pacote, e não deve ser enviado antes de todos os arquivos. Para USB, mantenha a
mesma ideia de confirmação atômica usada pelo firmware.

## Verificações locais

A IDE possui uma suíte Node sem dependências externas para contratos críticos:

```powershell
node --test tests/ide_static.test.mjs
```

Ela cobre sintaxe, servidor estático, raízes Início/Sempre, isolamento de
classes do simulador e regras de tela cheia.

Os fluxos end-to-end usam Playwright e iniciam `dev-server.js`
automaticamente:

```powershell
npx playwright test
```

Os seis cenários Chromium cobrem criação de projeto, margem do Blockly,
alternância Blocos/Python, menu Configurar, quatro motores no simulador, tela
cheia e ações da barra inferior. Use `npm test` para executar as duas suítes.

As verificações do firmware relacionadas à IDE continuam em
`../ax-firmware/tests`:

```powershell
node ax-firmware/tests/check_ide_multihub.mjs
node ax-firmware/tests/check_project_package.mjs
```

Esses testes usam caminhos históricos absolutos em alguns ambientes. Se
falharem apenas por caminho, corrija o ambiente de teste antes de interpretar
o resultado como falha de contrato.

Para uma verificação manual mínima:

1. iniciar `node dev-server.js`;
2. criar um projeto e confirmar persistência após recarregar a página;
3. configurar toque, analógico e mídia;
4. verificar o Python gerado e o download;
5. abrir o simulador, alterar sensor, pressionar botão e executar **Sempre**;
6. testar sem bloco Início, com mais de um Início e com mídia ausente;
7. apontar para um hub real somente quando a bancada estiver autorizada.

## Encerramento obrigatório de uma etapa

Ao concluir qualquer solicitação de desenvolvimento:

1. atualizar a tabela de etapas em [ROADMAP.md](ROADMAP.md);
2. marcar a entrega como concluída, parcial, bloqueada ou planejada;
3. registrar a próxima etapa recomendada e seu critério de conclusão;
4. atualizar o documento específico afetado, como `ARCHITECTURE.md`,
   `CONTRACTS.md`, `LEARNING_CONTENT.md` ou `VISUAL_SYSTEM.md`;
5. registrar validações executadas e limitações relevantes;
6. não declarar uma função pronta quando depender de firmware ou bancada ainda
   não validados.

Essa atualização faz parte da definição de pronto da IDE e não deve ser
deixada para uma tarefa posterior.

## Segurança e ações destrutivas

`Formatar memória` apaga projetos e mídia do bloco. A documentação e qualquer
automação de teste devem exigir confirmação explícita. Não use essa ação como
limpeza normal do desenvolvimento.
