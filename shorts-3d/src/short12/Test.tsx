import React from "react";
import { AbsoluteFill } from "remotion";
import { Stage } from "../kit/Stage";
import { Cel } from "../kit/cel";
import { Toon } from "../kit/Toon";
import { Javelin, LIGHT_STADIUM } from "./cena";
type V3 = [number, number, number];
const held = (arm: V3, node: React.ReactNode) => <group rotation={[-arm[0], 0, -arm[2]]}>{node}</group>;
const P: { armR: V3; armL: V3; lean?: number; twist?: number }[] = [
  { armR: [0.6, 0, 0.6], armL: [-0.6, 0, -0.3] },
  { armR: [1.2, 0, 0.5], armL: [-0.9, 0, -0.3], lean: 0.1 },
  { armR: [0.4, 0, 2.2], armL: [-1.0, 0, -0.3] },
  { armR: [1.3, 0, 1.2], armL: [-1.2, 0, -0.2], twist: -0.4 },
  { armR: [-2.6, 0, 0.3], armL: [0.6, 0, -0.3], lean: 0.4 },
  { armR: [-1.4, 0, 0.2], armL: [0.8, 0, -0.4], lean: 0.5 },
];
export const JavTest: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Stage flat background="#cfe6ff" lights={LIGHT_STADIUM} cam={{ pos: [0, 1.2, 9], target: [0, 1.0, 0], fov: 40 }} fg={
      <Cel>
        <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#4f9a46" /></mesh>
        {P.map((p, i) => (
          <group key={i} position={[(i % 3 - 1) * 2.2, i < 3 ? 2.2 : 0, 0]}>
            <Toon kind="nico" rotationY={-Math.PI / 2 + 0.0} face={{ expr: "neutral", eyes: "big", iris: "#e2a236" }} pose={{ armR: p.armR, armL: p.armL, lean: p.lean, twist: p.twist }}
              holdR={held(p.armR, <Javelin rot={[-0.3, -Math.PI / 2, 0]} s={0.75} />)} />
          </group>
        ))}
      </Cel>
    } />
  </AbsoluteFill>
);
