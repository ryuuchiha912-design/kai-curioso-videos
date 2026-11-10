import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { AbsoluteFill, useVideoConfig } from "remotion";

export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov?: number; roll?: number };

/** Posiciona a câmera a cada frame (sem estado, sem relógio). */
export const CamRig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera, size } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  // Tela vertical: recua a câmera e abre um pouco a lente para manter a mesma largura de enquadramento.
  const portrait = size.width < size.height;
  const D = portrait ? 1.5 : 1, FOVK = portrait ? 1.18 : 1;
  const [tx, ty, tz] = cam.target;
  c.position.set(tx + (cam.pos[0] - tx) * D, ty + (cam.pos[1] - ty) * D, tz + (cam.pos[2] - tz) * D);
  c.up.set(Math.sin(cam.roll ?? 0), Math.cos(cam.roll ?? 0), 0);
  c.lookAt(...cam.target);
  c.fov = (cam.fov ?? 35) * FOVK;
  c.aspect = size.width / size.height;
  c.near = 0.05;
  c.far = 200;
  c.updateProjectionMatrix();
  return null;
};

/** Regra 2: luz suave e quente, preenchimento azulado, contraluz pra destacar silhueta. */
export const Lights: React.FC<{ warm?: string; sky?: string; key?: number; keyPos?: [number, number, number]; shadows?: boolean }> = ({
  warm = "#ffe2b8", sky = "#bcd8ff", key = 2.4, keyPos = [3, 6, 4], shadows = true,
}) => (
  <>
    <hemisphereLight args={[sky, "#a77a55", 1.15]} />
    <ambientLight intensity={0.25} />
    <directionalLight
      position={keyPos}
      intensity={key}
      color={warm}
      castShadow={shadows}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-6}
      shadow-camera-right={6}
      shadow-camera-top={6}
      shadow-camera-bottom={-6}
      shadow-bias={-0.0004}
      shadow-radius={6}
    />
    <directionalLight position={[-4, 3, -5]} intensity={1.2} color="#ffd1f0" />
  </>
);

/**
 * Duas camadas com a mesma câmera:
 *  - fundo (bg) desfocado por CSS, a profundidade de campo "fake";
 *  - frente (fg) nítida, com personagens e chão.
 * Mais confiável que pós-processamento no render headless.
 */
export const Stage: React.FC<{
  cam: Cam;
  bg?: React.ReactNode;
  fg: React.ReactNode;
  blur?: number;
  background?: string;
  lights?: React.ReactNode;
  fog?: [string, number, number];
  /** sem tone mapping: cores chapadas (estilo cel) */
  flat?: boolean;
}> = ({ cam, bg, fg, blur = 7, background = "#f6d7a8", lights, fog, flat = false }) => {
  const { width, height } = useVideoConfig();
  const L = lights ?? <Lights />;
  const glProps = { antialias: true, alpha: true, preserveDrawingBuffer: true };
  return (
    <AbsoluteFill style={{ background }}>
      {bg && (
        <AbsoluteFill style={{ filter: `blur(${blur}px)` }}>
          <ThreeCanvas width={width} height={height} gl={glProps} shadows flat={flat}>
            <CamRig cam={cam} />
            {fog && <fog attach="fog" args={fog} />}
            {L}
            {bg}
          </ThreeCanvas>
        </AbsoluteFill>
      )}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} gl={glProps} shadows={{ type: THREE.PCFShadowMap }} flat={flat}>
          <CamRig cam={cam} />
          {L}
          {fg}
        </ThreeCanvas>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Vinheta leve, cara de "cinema". */
export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(40,15,0,0.35) 100%)", pointerEvents: "none" }} />
);
