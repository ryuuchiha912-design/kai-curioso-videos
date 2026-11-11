# Kai Curioso + canal do Ren — instruções para o Claude

Projeto de vídeos animados do usuário (brasileiro, fala português, não é programador: explique tudo em português simples e faça você mesmo o trabalho técnico).

## Canais e estilo
- **Kai Curioso** (@kaicurioso-f4n): Shorts verticais 1080x1920. Formato "E se…?" e histórias emocionais curtas (regra impossível + família + bordão + virada + pergunta para comentar). Personagem Kai (cabelo preto liso, franja repartida, cachecol preto com ponta laranja, moletom azul-marinho). 2D (SVG) ou 3D estilo cel.
  - Voz fixa: Microsoft Edge TTS `pt-BR-AntonioNeural` (rate +3% a +7%, pitch -2Hz).
- **Canal do Ren** (novo): vídeos longos horizontais 16:9 (8–10 min) estilo "Quanto tempo você duraria…?" / sobrevivência dia a dia, com contador de tempo na tela, humor seco e final emocionante. Personagem Ren (kind `"ren"` em `shorts-3d/src/kit/Toon.tsx`: cabelo preto bagunçado, íris cinza, roupa toda preta, munhequeira). Episódio 1: `Ultimo` ("E se você fosse a última pessoa na Terra?").
  - Voz fixa: `it-IT-GiuseppeMultilingualNeural` falando português (rate -6% a +5%).
- Regras: personagens e roteiros originais (nunca copiar personagens, marcas, logos, músicas de outros canais); fatos científicos/históricos conferidos e, quando variam, ditos como estimativa; música e efeitos gerados em código (trilha e efeitos a 50% do volume da voz, ~-14 LUFS).

## Onde está cada coisa
- `shorts-3d/` — projeto Remotion 4 + three.js (vídeos 3D).
  - `src/kit/` — personagens (`Toon.tsx`), estilo cel (`cel.tsx`: contorno + sombra chapada), palco (`Stage.tsx`), legendas.
  - `src/short5/` Dobra · `src/short6/` Micro-ondas · `src/short7/` Ren / Ultimo (vídeo longo).
  - `scripts/tts_*.py` — narração com Edge TTS (marca o tempo de cada palavra) · `scripts/mix_*.py` — trilha + efeitos + mixagem.
  - `src/data/*-timeline.json` — tempos das palavras; `public/audio/...` — áudios.
- `shorts-2d/` — vídeos 2D em SVG + Playwright (`base.js` + `scenes.js` → `render.js` → `mix.py`).
- `shorts-2d/VOZ_FIXA.md` — escolha de voz.

## Neste PC (Windows, com placa de vídeo) — use a GPU
Renderizar um vídeo 3D (exemplo do vídeo longo):
```powershell
cd shorts-3d
npm.cmd ci
npx.cmd remotion render Ultimo out\ultimo.mp4 --codec=h264 --crf=18 --gl=angle
```
- `--gl=angle` usa a placa de vídeo (DirectX). 10 min de vídeo levaram ~15 min aqui.
- Vertical (Shorts): composições `Dobra`, `Microondas`, etc. Horizontal: `Ultimo` (1920x1080).
- Use `npm.cmd`/`npx.cmd` no PowerShell (evita bloqueio de scripts).

### Preparar este PC na primeira vez (faça você mesmo, pedindo permissão)
1. Git: `winget install --id Git.Git -e` (a instalação anterior deu erro de permissão; o `git` não estava no PATH).
2. Python + bibliotecas: `winget install --id Python.Python.3.12 -e` e depois `py -m pip install edge-tts numpy pillow`.
3. FFmpeg: `winget install --id Gyan.FFmpeg -e`.
4. Node.js já instalado (v26). Dependências: `cd shorts-3d; npm.cmd ci`.
5. Para os vídeos 2D: `npm.cmd i -g playwright` e `npx.cmd playwright install chromium`.
Depois de instalar com winget, abra um terminal novo para o PATH valer.

## Fluxo de um vídeo novo
1. Roteiro (gancho no 1º segundo, escalada, virada, pergunta para comentar) → conferir fatos.
2. Narração com `scripts/tts_*.py` (gera os tempos das palavras).
3. Cenas/planos (um por fala; câmera sempre em movimento; reações 0–3 quadros antes da palavra).
4. Folha de contato (uma imagem por plano) para conferir antes do render completo.
5. Trilha + efeitos com `scripts/mix_*.py` (níveis travados a -6 dB da voz).
6. Render na GPU, conferir duração/áudio com ffprobe, entregar o MP4 em `shorts-3d\out\` e abrir a pasta (`explorer out`).
7. Entregar também: título, descrição com capítulos, tags, comentário para fixar e (se pedido) thumbnail.
8. Salvar o projeto no GitHub (`git add`, `git commit`, `git push`).
