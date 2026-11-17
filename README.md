# Shorts animados 3D (Remotion + Three.js)

Dois estúdios de vídeo vertical (9:16), cada um numa pasta:

| Pasta | Estilo | Começar por |
|---|---|---|
| `estilo-seu-jorge/` | Bonecos 3D de cabeça grande, rosto desenhado em 2D, contorno marrom, escritório | `GUIA.md` e `src/short/v3/ShortV3.tsx` |
| `estilo-desenho-animado/` | Bonecos 2D chapados num mundo 3D colorido (skill `desenho-animado`, exemplo Torre de Pisa) | skill em https://github.com/davixavier-coder/Animated-23D-Xavier |

`videos/` tem o vídeo pronto de exemplo (Seu Jorge, versão 3).

## Usar numa máquina nova
```bash
cd estilo-seu-jorge && npm install && npm run studio
```
```bash
cd estilo-desenho-animado && npm install && npx remotion studio src/index.ts
```
O `remotion.config.ts` de cada pasta aponta para o Chromium e o WebGL por software do ambiente de nuvem.
No seu computador, apague as linhas `setBrowserExecutable` e `setChromiumOpenGlRenderer`.
Para a skill `desenho-animado` no Claude Code: peça "instala essa skill: https://github.com/davixavier-coder/Animated-23D-Xavier".
