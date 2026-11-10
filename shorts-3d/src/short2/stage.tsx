import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Cam, CamRig, Lights } from "../kit/Stage";

/**
 * Palco do short 2: igual ao Stage do kit (fundo desfocado + frente nítida), com uma 3ª camada opcional:
 * o "fantasma" (a memória do Caio criança), desenhado por cima com transparência e brilho quente.
 * `tint` pinta a imagem toda com uma luz colorida (a luz de 1998 invadindo a sala).
 */
export const Stage2: React.FC<{
  cam: Cam; bg?: React.ReactNode; fg: React.ReactNode; ghost?: React.ReactNode; ghostOpacity?: number;
  blur?: number; background?: string; lights?: React.ReactNode; tint?: [string, number];
}> = ({ cam, bg, fg, ghost, ghostOpacity = 0.6, blur = 7, background = "#f6d7a8", lights, tint }) => {
  const { width, height } = useVideoConfig();
  const L = lights ?? <Lights />;
  const glProps = { antialias: true, alpha: true, preserveDrawingBuffer: true };
  return (
    <AbsoluteFill style={{ background }}>
      {bg && (
        <AbsoluteFill style={{ filter: `blur(${blur}px)` }}>
          <ThreeCanvas width={width} height={height} gl={glProps} shadows>
            <CamRig cam={cam} />
            {L}
            {bg}
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} gl={glProps} shadows={{ type: THREE.PCFShadowMap }}>
          <CamRig cam={cam} />
          {L}
          {fg}
        </ThreeCanvas>
      </AbsoluteFill>
      {tint && tint[1] > 0 && <AbsoluteFill style={{ background: tint[0], opacity: tint[1], mixBlendMode: "soft-light" }} />}
      {ghost && ghostOpacity > 0.001 && (
        <AbsoluteFill style={{ opacity: ghostOpacity, filter: "drop-shadow(0 0 28px rgba(255,190,110,0.95)) brightness(1.15) sepia(0.25)" }}>
          <ThreeCanvas width={width} height={height} gl={glProps}>
            <CamRig cam={cam} />
            <Lights warm="#ffd9a0" sky="#ffe6c4" key={2.2} shadows={false} />
            {ghost}
          </ThreeCanvas>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Fundo plano (para os planos de "vida passando"): gradiente com brilho. */
export const Backdrop: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${a} 0%, ${b} 75%)` }} />
);
