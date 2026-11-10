import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../kit/Stage";
import { Toon, ToonExpr } from "../kit/Toon";

/** Folha de personagem (1080x1080): Kai e Bia de frente e de lado. */
export const ToonSheet: React.FC<{ view?: "front" | "side"; expr?: ToonExpr }> = ({ view = "front", expr = "smile" }) => {
  const f = useCurrentFrame();
  const side = view === "side";
  return (
    <AbsoluteFill>
      <Stage
        cam={{ pos: side ? [5.2, 1.4, 0.0] : [0, 1.4, 5.2], target: [0, 1.0, 0], fov: 30 }}
        background="#f3d2a2"
        blur={0}
        fg={
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[3, 48]} />
              <meshStandardMaterial color="#e8c48f" roughness={0.9} />
            </mesh>
            <Toon kind="kai" position={side ? [0, 0, 0.55] : [-0.55, 0, 0]} rotationY={0} face={{ expr, blink: 0 }} pose={{ armR: [0, 0, 0.25 + Math.sin(f * 0.1) * 0.05] }} />
            <Toon kind="bia" position={side ? [0, 0, -0.55] : [0.55, 0, 0]} rotationY={0} face={{ expr, blink: 0 }} />
          </>
        }
      />
    </AbsoluteFill>
  );
};
