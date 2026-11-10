# Prompt: transformar qualquer vídeo ou história num short 3D cartoon

Cole o bloco abaixo no **Claude Code**, aberto na pasta do projeto (`shorts-3d/` do repositório ViralVideo, já com `npm install` feito).
Troque o que está entre `[colchetes]`.

```text
Você vai produzir um short vertical em 3D cartoon (1080x1920, 30 fps, 30 a 50 s) a partir disto:

[COLE AQUI: o link do vídeo, a transcrição, a legenda, ou a história em poucas linhas]

Público: [ex.: crianças e pais / quem curte tecnologia / geral]. Tom: [ex.: fábula engraçada / dica rápida / drama leve].
Final / CTA: [ex.: "link na bio" / uma moral em forma de piada / nenhum].

## Stack (já está no projeto, não troque)
- Remotion 4 + Three.js via @react-three/fiber (@remotion/three). Tudo é desenhado em código: nenhum modelo, textura ou imagem baixada.
- Tudo determinístico e guiado por useCurrentFrame(). Nada de Math.random solto, nada de useFrame, nada de tempo real. Use rand(n) e kf()/kf3()/pop() de src/kit/anim.ts.
- Vozes: Edge TTS neural pt-BR (pacote Python edge-tts), com o tempo de cada palavra (WordBoundary). ffmpeg/ffprobe no PATH.
- Kit reaproveitável em src/kit/: Character (cabeçudos com rosto em canvas), Face (expressões + piscada), Stage/CamRig/Lights, sets, props, Captions.
- Leia o README.md (ou COMO_USAR.md) e um short pronto (por exemplo src/short3/) antes de começar, para copiar a estrutura.

## As 6 regras do estilo (todas obrigatórias)
1. Cabeça enorme, corpo pequeno.
2. Luz quente e fundo desfocado (profundidade de campo; o fundo nunca disputa com o personagem).
3. Número vira objeto na palavra exata: quando a voz diz "três", três coisas aparecem naquele frame (use o tempo da palavra no timeline JSON).
4. A expressão troca no meio da piscada: o rosto muda com os olhos fechados, nunca "de estalo" com os olhos abertos.
5. O gesto termina antes da palavra: a ação começa e acaba 3 a 6 frames antes da fala que ela ilustra.
6. A câmera nunca para: um enquadramento novo a cada ~1 s e dolly/arco constante dentro de cada plano.

## Fluxo (siga nesta ordem, um passo de cada vez)
1. **Roteiro.** Escreva ROTEIRO_<NOME>.md com: ideia em uma frase, tom, elenco (visual + voz Edge de cada um), cenários, e uma tabela "# | Quem | Texto | Plano | Objeto-informação" com 10 a 18 falas curtas. Gancho forte nos 2 primeiros segundos. Marque com ✱ as frases que são afirmação de fato. **Pare e me mostre o roteiro. Só continue depois do meu OK.**
2. **Vozes.** Crie src/data/<nome>-lines.json (id, who, text; {"pause": s} para respiro ou efeito) e um script scripts/tts_<nome>.py copiando o tts_capivara.py (troque VOICES, pastas e nomes). Rode e confira os tempos impressos.
3. **Tempos.** O script gera src/data/<nome>-timeline.json com início/fim de cada fala e de cada palavra. Crie src/short<N>/timeline.ts que lê esse JSON e exporta TOTAL_SEC e helpers (tempo da palavra X da fala Y).
4. **Personagens.** Reaproveite o kit. Personagem novo vai num arquivo NOVO em src/kit/ (não edite os existentes) e ganha uma folha de personagem (Composition de 1080x1080) para conferir de frente e de lado.
5. **Planos.** Escreva src/short<N>/shots.tsx: uma lista de planos com início/fim em segundos, câmera (pos, target, fov) com movimento, e o que acontece. Amarre cada objeto-informação e cada gesto ao tempo da palavra. Em 9:16, dois personagens cabeçudos lado a lado precisam de uns 2 m de largura e fov 48-50.
6. **Composition.** Crie src/short<N>/<Nome>.tsx (planos + áudio + Captions) e adicione UMA linha em src/Root.tsx (releia o arquivo antes de editar).
7. **Folha de contato.** node scripts/shots.mjs src/short<N>/shots.tsx out/<nome>-shots.json e depois SHOTS=out/<nome>-shots.json node scripts/contact.mjs <Id> out/<nome>_contato.png (no PowerShell: $env:SHOTS="out/<nome>-shots.json"; node scripts/contact.mjs <Id> out/<nome>_contato.png). Precisa de 2+ planos; sem SHOTS ele usa os planos do Moedinha. Olhe a imagem, corrija enquadramento, personagem cortado, objeto fora de hora. Repita até ficar bom.
8. **Render.** npx remotion render <Id> entregas/<Nome>_short_v1.mp4 --codec=h264 --crf=20. Confira duração e áudio com ffprobe e me mostre a folha de contato final.

## Direitos autorais e cuidado (não negociável)
- Se o material de origem for de outra pessoa: faça uma ADAPTAÇÃO PRÓPRIA da ideia. Personagens, falas, cenário e visual originais. Não reutilize áudio, imagens, texto na tela, nome, marca ou bordões de quem postou. Avise no roteiro de onde veio a inspiração.
- Não recrie personagens, marcas, logos ou músicas existentes. Ícones de plataformas: use símbolos genéricos (play, nota, câmera).
- Não cite produtos, empresas ou repositórios que você não verificou. Prefira a ideia genérica.
- Afirmações de fato (✱) precisam ser verdadeiras; na dúvida, pergunte.
- Clonagem de voz ou imagem de pessoas reais: só com permissão; se o tema aparecer, diga isso no vídeo.
- Sem música de terceiros. Efeitos sonoros: gere em código (ruído filtrado, senos) ou deixe só as vozes.

Quando terminar, me diga: caminho do MP4, duração, a folha de contato e o que ficou de fora ou não foi verificado.
```

## Dicas
- Começou com um link de Instagram/TikTok que pede login? Abra o embed público (`.../reel/<id>/embed/captioned/`) para ler a legenda, ou cole a transcrição você mesmo.
- Quer outra voz? Liste as vozes com `edge-tts --list-voices | findstr pt-BR` (Windows) ou `grep pt-BR` (Mac/Linux).
- Quer narrar com a sua própria voz? Grave cada fala, troque os arquivos de `public/audio/<nome>/` e peça ao Claude para recalcular os tempos das palavras a partir das suas gravações.
