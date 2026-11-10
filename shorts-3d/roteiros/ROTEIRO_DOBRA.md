# ROTEIRO — "E se o seu dinheiro dobrasse a cada hora?" (Kai Curioso)

**Ideia em uma frase:** o Kai ganha o poder de fazer o próprio dinheiro dobrar a cada hora, fica mais rico que o país… até descobrir que *tudo que é dele* dobra, inclusive a dívida do cartão.

**Inspiração (adaptação própria):** a premissa genérica "dinheiro dobrando" (problema matemático clássico) aparece no Short *"E se o seu DINHEIRO dobrasse a cada hora?"* do canal **E Se?**. Nada é reaproveitado: personagens, falas, cenários, visual, virada e bordões são originais. Só a **proporção corporal** (cabeça enorme, corpo pequeno) segue a imagem de referência.

**Formato:** vertical 1080×1920, 30 fps, ~45 s · **Público:** geral · **Tom:** fábula engraçada · **CTA:** "Comenta DOBRA".

## Elenco
| Personagem | Visual | Voz |
|---|---|---|
| **Kai** (personagem novo → `src/kit/Kai.tsx`) | Cabeça enorme e corpo pequeno; cabelo preto liso com franja repartida e mechas laterais; olhos grandes escuros; cachecol preto com ponta laranja; moletom azul-marinho | Edge `pt-BR-AntonioNeural`, rate +12%, pitch +25Hz (mais jovem) |
| **Bia** (nova, `src/kit/Toon.tsx`, `kind="bia"`) | Cabeçuda de pernas finas, moletom verde-água, cabelo castanho com coque e prendedor amarelo | Edge `pt-BR-FranciscaNeural`, rate +10%, pitch +20Hz |
| **Narrador** | — (só voz) | Edge `pt-BR-AntonioNeural`, rate +6%, pitch +0Hz |

## Cenários (luz quente de fim de tarde, fundo sempre desfocado)
1. **Rua do bairro:** `Street` do kit.
2. **Garagem:** set novo e simples (portão, chão de cimento, prateleira).
3. **Pátio da escola:** set novo (muro, relógio grande).
4. **Quarto do Kai:** `Bedroom` do kit.

## HUD fixo (canto superior)
`HORA XX` / `R$ valor`: atualiza junto com a fala do narrador.

## Falas
| # | Quem | Texto | Plano | Objeto-informação |
|---|---|---|---|---|
| 1 | Narrador | **E se o seu dinheiro dobrasse a cada hora?** | Close-up do Kai de frente, dolly-in | Moeda de R$ 1 girando na mão do Kai (gancho, 0–2 s) |
| 2 | Kai | Eu só tenho um real. | Plano médio, arco lento | **1** moeda aparece em "um" |
| 3 | Narrador | ✱ Hora dez: mil e vinte e quatro reais. | Plongée, pilha de notas | HUD "HORA 10 · R$ 1.024"; **10** notas caem em "dez" |
| 4 | Kai | Bia! Pastel pra escola inteira! | Rua, os dois lado a lado (2 m, fov 48) | Bandeja de pastéis surge |
| 5 | Narrador | ✱ Hora vinte: mais de um milhão. | Close da maleta abrindo | HUD "HORA 20 · R$ 1.048.576"; maleta de dinheiro |
| 6 | Bia | Kai… por que tem três motos na sua garagem? | Garagem, travelling lateral | **3** motos aparecem em "três" |
| 7 | Kai | Uma pra cada dia que eu lembro de usar. | Contraplano do Kai, sorriso convencido | — |
| 8 | Narrador | ✱ Hora trinta: mais de um bilhão. | Contra-plongée, cofre gigante | HUD "HORA 30 · R$ 1.073.741.824"; cofre |
| 9 | Kai | Comprei a escola. Agora o recreio dura duas horas. | Pátio da escola, grua subindo | **2** relógios aparecem em "duas" |
| 10 | Narrador | ✱ Hora quarenta: mais de um trilhão. | Kai em cima de uma montanha de moedas, órbita | HUD "HORA 40 · R$ 1.099.511.627.776" |
| 11 | Bia | Kai… e aquela dívida de cinquenta reais no cartão? | Close da Bia, dolly-in | Cartão de crédito com "R$ 50" |
| 12 | Kai | Que dívida? | Close do Kai: a expressão troca no meio da piscada (feliz → preocupado) | — |
| 13 | Narrador | O problema: tudo que é seu dobra. Inclusive a dívida. | Whip pan, HUD fica vermelho | O contador da dívida dispara |
| 14 | — | `{"pause": 0.6}` | Silêncio, câmera girando devagar em volta do Kai | — |
| 15 | Kai | Bia… me empresta um real? | Plano dos dois, Bia de braços cruzados | **1** moeda (fecha com a fala 2) |
| 16 | Narrador | Comenta "DOBRA" se você aceitaria esse poder! | Kai acenando, rua ao pôr do sol | Caixa de comentário digitando "DOBRA" |

## Afirmações de fato (✱): conferir
- **Fala 3:** R$ 1 dobrando por 10 horas = 2¹⁰ = **R$ 1.024** ✔ (conta exata).
- **Fala 5:** 2²⁰ = **R$ 1.048.576** ✔ ("mais de um milhão").
- **Fala 8:** 2³⁰ = **R$ 1.073.741.824** ✔ ("mais de um bilhão").
- **Fala 10 (usada):** 2⁴⁰ = 1.099.511.627.776 ≈ **R$ 1,1 trilhão** ✔ (troquei a comparação com o PIB por um fato só matemático, sem número externo para conferir).
- **Fala 13 / placar da dívida:** 50 × 2⁴⁰ = **R$ 54.975.581.388.800** ✔ — a dívida dobrou as mesmas 40 vezes e passou o dinheiro dele (R$ 1,1 tri), por isso ele pede um real no final.
- A fala 13 ("a dívida também dobra") é **ficção**, a regra do mundo do vídeo, e não uma afirmação de fato.

## Duração estimada
Cerca de 120 palavras, com pausas, dão **uns 42 a 48 segundos**.
