import { Config } from "@remotion/cli/config";
// Ambiente de nuvem sem GPU: Chromium local + WebGL por software. No seu PC, remova estas 2 linhas.
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
Config.setChromiumOpenGlRenderer("swangle");
// Sem GPU o primeiro quadro demora (pós-processamento por software): mais tempo de espera.
Config.setDelayRenderTimeoutInMilliseconds(180000);
Config.setConcurrency(2);
