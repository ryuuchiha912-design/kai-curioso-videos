# Prompt RESUMO: continue numa conversa nova sem perder nada

Do vídeo **"A IA não lembra da sua conversa"**. A IA relê a conversa inteira a cada mensagem, e o espaço que ela enxerga de uma vez (a *janela de contexto*) tem limite. Quando a conversa fica longa demais, o começo é cortado ou resumido e a resposta fica confusa.

**Como usar:**
1. **Cole** o prompt abaixo no fim da conversa que ficou longa (Claude, ChatGPT, Gemini…).
2. **Copie** o resumo que ela devolver.
3. **Abra** uma conversa nova, cole o resumo e escreva embaixo o que você quer agora.

```text
Esta conversa ficou longa e vou continuar numa conversa nova. Escreva um RESUMO para eu colar lá, com:

1. Objetivo: o que eu quero conseguir, em 1 ou 2 frases.
2. Contexto: quem sou eu, para quem é o trabalho, tom e formato que eu pedi.
3. Decisões já tomadas: o que escolhemos e por quê (em tópicos).
4. Fatos e dados importantes: números, nomes, datas, links, trechos de código ou de texto que não podem se perder. Copie exatamente, sem resumir.
5. O que já está pronto e o que falta, em ordem.
6. O que eu NÃO quero: pedidos que eu recusei ou corrigi.
7. Próximo passo: a primeira coisa a fazer na conversa nova.

Seja direto, use tópicos, não invente nada que não esteja na conversa. Se algo estiver em dúvida, marque com (?).
Comece o resumo com: "Contexto de uma conversa anterior. Leia tudo antes de responder."
```

> **Dica:** não espere a conversa travar. Quando a IA começar a esquecer detalhes ou repetir erros que você já corrigiu, é hora do resumo.

**Fontes:** [Anthropic: Context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) · [OpenAI: Understanding and counting tokens](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
