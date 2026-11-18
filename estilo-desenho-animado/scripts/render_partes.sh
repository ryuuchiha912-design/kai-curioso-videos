#!/bin/bash
# Renderiza o short em pedaços de 150 quadros (5 s) e junta no fim. Se parar, rode de novo: pula os pedaços prontos.
# Uso: bash scripts/render_partes.sh [escala]   (0.5 = 540x960, 1.3333 = 1440x2560)
cd "$(dirname "$0")/.."
ESC=${1:-0.5}; OUT=out/contato/partes_$ESC; mkdir -p $OUT
TOTAL=$(node -e "const t=require('./src/videos/contato/timeline.json');console.log(Math.ceil((t.total+0.4)*30))")
for ((a=0; a<TOTAL; a+=150)); do
  b=$((a+149)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$OUT/p$(printf %05d $a).mp4
  [ -s "$f" ] && continue
  npx remotion render src/index.ts ContatoShort "$f.tmp.mp4" --frames=$a-$b --scale=$ESC --concurrency=3 --timeout=180000 --codec h264 --crf 18 --log=error && mv "$f.tmp.mp4" "$f"
  echo "pronto $a-$b de $TOTAL"
done
ls $OUT/p*.mp4 | sed 's/^/file /;s/file /file '"'"'/;s/$/'"'"'/' | sed "s|'$OUT/|'|" > $OUT/lista.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i $OUT/lista.txt -c copy out/contato/video_$ESC.mp4 && echo "video -> out/contato/video_$ESC.mp4"
