# Estúdio de Shorts 3D (Remotion + Three.js)

Vídeos verticais 9:16 com personagens 3D de cabeça grande, membros de palito,
rosto desenhado em 2D, contorno marrom grosso e legenda palavra por palavra.

## Comandos
```bash
npm install            # 1ª vez numa máquina nova
npm run studio         # editor visual com preview (no seu computador)
npx remotion render src/index.ts ShortV3 out/video.mp4 --concurrency=4
npx remotion still  src/index.ts ShortV3 out/teste.png --frame=120 --scale=0.5
```
Neste ambiente de nuvem (sem GPU) o `remotion.config.ts` usa o Chromium local e
WebGL por software (`swangle`). No seu PC, pode remover a linha `setBrowserExecutable`.

## Arquivos principais (src/short/v3/)
| Arquivo | O que é |
|---|---|
| `Personagem3.tsx` | O personagem: corpo, roupas, rosto 2D animável, poses, óculos, objetos na mão |
| `Escritorio3.tsx` | Cenário do escritório + props (celular, joinha, balão de pensamento) |
| `ShortV3.tsx` | O vídeo: roteiro/legendas, câmeras (planos), expressões e poses no tempo |

## Criar um personagem novo
Em `ShortV3.tsx`, copie um `Look`:
```ts
const ANA: Look = {
  pele: "#e7b48f", cabelo: "#5a3825", cabeloTipo: "longo", // curto | longo | careca | lateral
  barba: false,
  roupa: "listrada",              // lisa | listrada | xadrez | terno
  cor1: "#f4efe6", cor2: "#3b5f8f", mangaLonga: false,
  calca: "#26262c", sapato: "#7a3e22",
};
```

## Expressões (Rosto) — todos 0..1
`fala, surpresa, sorriso (boca aberta), sorrisinho (canto), palpebra (cínico),
olhosFelizes (^^), piscar, nervoso (dentes cerrados), assobio, suor, olharX/olharY (-1..1),
sobrancelha (-1 brava .. 1 levantada)`

## Poses (Braco)
`ombroZ` (abre p/ o lado), `ombroX` (p/ frente, negativo), `cotovelo`, `cotoveloZ`.
Prontas: `ATRAS_CABECA`, `SEGURA_CEL`, `SOLTO`. Objetos na mão: `maoD={<Celular />}`.

## Câmera
Lista `PLANOS` em `ShortV3.tsx`: cada plano tem início (s), posição inicial/final e alvo.
Corte seco entre planos, movimento lento dentro do plano.

## Legendas
Lista `BLOCOS`: 1–2 palavras por bloco com o tempo em segundos.
Com narração real: transcrever com Whisper (faster-whisper já instalado) para obter os tempos.

## Guia de estilo (tirado dos quadros de referência)
- Cabeça grande levemente oval, colada no tronco (sem pescoço); tronco em forma de pera.
- Pernas/braços de palito; mãos e pés em bolinhas; mangas da cor da roupa.
- Contorno marrom-escuro grosso (#2e1c12) em personagens e objetos.
- Rosto 2D: olhos brancos com contorno marrom e pupila pequena, sobrancelhas grossas,
  pálpebra caída = cínico, olhos em arco = feliz, dentes em grade = nervoso, gota de suor.
- Luz principal forte de lado (metade do rosto em sombra), cenário em tons neutros,
  objetos coloridos (luminária de lava, cacto, caneca), vinheta suave.
- Câmera: planos curtos (1–2,5 s), close-ups apertados, cortes secos.
- Legenda: Nunito 900 branca, contorno preto, sombra, 1–2 palavras, terço inferior.
