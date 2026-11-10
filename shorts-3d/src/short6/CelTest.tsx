import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Lights, Stage, Vignette } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Toon } from "../kit/Toon";
import { kf } from "../kit/anim";
import { GarageBack, GarageFront, Moto } from "../short5/world";

/** Teste de estilo: Kai e Bia em sombreamento chapado com contorno. */
export const CelTest: React.FC<{ cel?: boolean }> = ({ cel = true }) => {
  const f = useCurrentFrame();
  const W = ({ children }: { children: React.ReactNode }) => (cel ? <Cel>{children}</Cel> : <>{children}</>);
  return (
    <AbsoluteFill>
      <Stage
        flat={cel}
        cam={{ pos: [kf(f, [[0, 0.4], [90, -0.2]]), 1.75, 2.3], target: [0, 1.45, 0], fov: 38 }}
        background="#e8c79a"
        blur={cel ? 1.2 : 4}
        lights={<Lights warm="#ffe0b0" sky="#ffe6c8" key={2.2} keyPos={[-3, 5, 4]} />}
        bg={<W><GarageBack /></W>}
        fg={
          <W>
            <GarageFront />
            <Moto p={[0.2, 0, -1.5]} rot={[0, 0.5, 0]} s={1.8} c="#e04b3c" />
            <Toon kind="kai" position={[-0.55, 0, 0.3]} rotationY={0.35} face={{ expr: "smug", blink: 0, eyes: cel ? "big" : "dot", look: [0.5, 0] }} pose={{ armR: [-0.4, 0, 1.2] }} />
            <Toon kind="bia" position={[0.6, 0, 0.3]} rotationY={-0.4} face={{ expr: "worried", blink: 0, look: [-0.6, 0], eyes: cel ? "big" : "dot" }} pose={{ armL: [-0.9, 0, 0.6], armR: [-0.9, 0, -0.6] }} />
          </W>
        }
      />
      <Vignette />
    </AbsoluteFill>
  );
};
