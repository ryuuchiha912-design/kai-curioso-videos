import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Lights, Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Toon, ToonExpr } from "../kit/Toon";

/** Folha do personagem Ren (1080x1080): frente e lado, estilo cel. */
export const RenSheet: React.FC<{ view?: "front" | "side" | "close"; expr?: ToonExpr; kind?: "ren" | "nico" }> = ({ view = "front", expr = "neutral", kind = "ren" }) => {
  const f = useCurrentFrame();
  const side = view === "side", close = view === "close";
  const face = { expr, blink: 0, eyes: "big" as const, iris: kind === "nico" ? "#e2a236" : "#8d929c", lid: kind === "nico" ? -0.14 : 0.22, look: [0.15, 0.1] as [number, number] };
  return (
    <AbsoluteFill>
      <Stage
        flat
        cam={close ? { pos: [0.25, 1.65, 1.6], target: [0, 1.55, 0], fov: 30 } : { pos: side ? [5.0, 1.3, 0] : [0, 1.3, 5.0], target: [0, 1.05, 0], fov: 30 }}
        background="#d9d2c8"
        blur={0}
        lights={<Lights warm="#fff1dc" sky="#e8ecf4" key={2.2} keyPos={[-3, 5, 4]} />}
        fg={
          <Cel>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[3, 48]} />
              <meshStandardMaterial color="#bdb4a8" roughness={0.9} />
            </mesh>
            <Toon kind={kind} position={side ? [0, 0, 0.0] : close ? [0, 0, 0] : [-0.5, 0, 0]} rotationY={close ? 0.15 : 0} face={face} pose={{ armL: [0, 0, -0.12], armR: [0, 0, 0.12] }} />
            {!side && !close && <Toon kind={kind} position={[0.55, 0, 0]} rotationY={-0.5} face={{ ...face, expr: kind === "nico" ? "smile" : "smug" }} pose={{ armL: [-1.9, 0, 0.6], armR: [0, 0, 0.12], head: [0.1, 0, -0.15] }} />}
          </Cel>
        }
      />
    </AbsoluteFill>
  );
};
