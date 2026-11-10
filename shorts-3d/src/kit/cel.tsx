import React, { useLayoutEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Estilo "cel": cores chapadas em 3 tons + contorno preto (casco invertido).
 * Envolva qualquer parte da cena com <Cel> — personagens, cenário, objetos.
 * Os materiais originais continuam recebendo as props do React; a cada render
 * copiamos cor/mapa para a versão "toon", então animações de cor e textura seguem funcionando.
 */

let gradient: THREE.DataTexture | null = null;
const toonGradient = () => {
  if (gradient) return gradient;
  const tones = [95, 175, 255];
  const data = new Uint8Array(tones.length * 4);
  tones.forEach((v, i) => data.set([v, v, v, 255], i * 4));
  gradient = new THREE.DataTexture(data, tones.length, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  return gradient;
};

const outlineCache = new Map<string, THREE.MeshBasicMaterial>();
/** Material do contorno: empurra o vértice pela normal em espaço de câmera (espessura constante no mundo). */
const outlineMat = (thickness: number, color: string) => {
  const key = `${thickness}|${color}`;
  const hit = outlineCache.get(key);
  if (hit) return hit;
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uThick = { value: thickness };
    sh.vertexShader = "uniform float uThick;\n" + sh.vertexShader.replace(
      "#include <project_vertex>",
      `vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
       vec3 nView = normalize( normalMatrix * normal );
       mvPosition.xyz += nView * uThick * clamp( -mvPosition.z * 0.35, 0.6, 3.0 );
       gl_Position = projectionMatrix * mvPosition;`,
    );
  };
  m.customProgramCacheKey = () => `outline-${thickness}`;
  outlineCache.set(key, m);
  return m;
};

type Std = THREE.MeshStandardMaterial;
const toToon = (): THREE.MeshToonMaterial => new THREE.MeshToonMaterial({ gradientMap: toonGradient() });
const sync = (dst: THREE.MeshToonMaterial, src: Std) => {
  dst.color.copy(src.color);
  dst.map = src.map;
  dst.emissive.copy(src.emissive);
  dst.emissiveIntensity = src.emissiveIntensity;
  dst.emissiveMap = src.emissiveMap;
  dst.transparent = src.transparent;
  dst.opacity = src.opacity;
  dst.side = src.side;
  dst.polygonOffset = src.polygonOffset;
  dst.polygonOffsetFactor = src.polygonOffsetFactor;
  dst.alphaTest = src.alphaTest;
};

const isFlat = (g: THREE.BufferGeometry) => g.type === "PlaneGeometry" || g.type === "CircleGeometry";

export const Cel: React.FC<{ children: React.ReactNode; thickness?: number; color?: string; outline?: boolean; shade?: boolean }> = ({
  children, thickness = 0.016, color = "#1b120d", outline = true, shade = true,
}) => {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || mesh.userData.hull) return;
      // 1) sombreamento em tons chapados
      if (shade) {
        const srcs: Std[] = mesh.userData.celSrc ?? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Std[];
        if (!mesh.userData.celSrc && srcs.every((m) => (m as Std).isMeshStandardMaterial)) {
          mesh.userData.celSrc = srcs;
          mesh.userData.celDst = srcs.map(() => toToon());
          mesh.material = Array.isArray(mesh.material) ? mesh.userData.celDst : mesh.userData.celDst[0];
        }
        if (mesh.userData.celSrc) (mesh.userData.celDst as THREE.MeshToonMaterial[]).forEach((d, i) => sync(d, mesh.userData.celSrc[i]));
      }
      // 2) contorno (não em planos nem em retalhos transparentes como o rosto)
      if (!outline) return;
      const mat0 = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.Material;
      if (isFlat(mesh.geometry) || mat0.transparent) return;
      let hull = mesh.userData.hullMesh as THREE.Mesh | undefined;
      if (!hull) {
        hull = new THREE.Mesh(mesh.geometry, outlineMat(thickness, color));
        hull.userData.hull = true;
        hull.castShadow = false;
        hull.receiveShadow = false;
        hull.raycast = () => undefined;
        mesh.add(hull);
        mesh.userData.hullMesh = hull;
      }
      hull.geometry = mesh.geometry;
    });
  });
  return <group ref={ref}>{children}</group>;
};
