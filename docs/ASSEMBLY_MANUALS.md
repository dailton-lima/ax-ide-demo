# Manuais de montagem — contrato de conteúdo

Os **Projetos prontos** aceitam um manual visual próprio. A interface já existe,
mas nenhum manual deve ser marcado como disponível antes de as imagens e a
montagem física serem validadas.

## Estrutura por projeto

Cada manual usa o identificador do projeto e segue este contrato:

```js
{
  projectId: 'rover',
  status: 'ready',
  version: 1,
  cover: 'assets/assembly/rover/capa.webp',
  parts: ['2 motores DC', 'Hub EVORA', '...'],
  steps: [
    { image: 'assets/assembly/rover/01.webp', text: 'Fixe os motores à base.' }
  ]
}
```

Um manual só é tratado como `ready` se tiver capa, ao menos uma peça e todos os
passos com imagem e texto. Caso contrário, a IDE mantém o estado honesto de
**montagem em preparação**.

## Assets esperados

- imagens WebP ou PNG, com fundo limpo e boa leitura em tela pequena;
- uma capa horizontal ou quadrada do robô montado;
- uma imagem por passo, numerada na sequência de montagem;
- texto curto, direto e seguro para cada passo;
- lista conferida de peças e alertas quando houver motor, ferramenta ou ponto
  de aperto.

Os arquivos devem ser adicionados ao repositório antes de mudar o estado do
manual para `ready`.
