import { useCurrentFrame } from "remotion";
import { Capybara } from "../kit/Capybara";
import { Expr } from "../kit/Face";
import { Stage } from "../kit/Stage";
import { blinkAt } from "../kit/anim";

const EXPRS: Expr[] = ["happy", "joy", "smile", "surprised", "worried", "sad", "excited", "neutral", "talk", "determined"];

/** Folha da Jujuba: 4 níveis de inchaço lado a lado (0, 0.35, 0.7, 1), expressões trocando a cada 10 quadros. */
export const CapySheet: React.FC<{ view?: "front" | "side" | "close" }> = ({ view = "front" }) => {
  const f = useCurrentFrame();
  const expr = EXPRS[Math.floor(f / 10) % EXPRS.length];
  const cams = {
    front: { pos: [0, 1.3, 9] as [number, number, number], target: [0, 1.0, 0] as [number, number, number], fov: 34 },
    side: { pos: [7, 1.6, 5] as [number, number, number], target: [0, 1.0, 0] as [number, number, number], fov: 34 },
    close: { pos: [-2.6, 1.15, 2.4] as [number, number, number], target: [-2.6, 1.0, 0] as [number, number, number], fov: 34 },
  };
  return (
    <Stage
      background="#f3c98f"
      cam={cams[view]}
      fg={
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[9, 64]} />
            <meshStandardMaterial color="#9fcf6a" roughness={0.9} />
          </mesh>
          {[0, 0.35, 0.7, 1].map((inf, i) => (
            <Capybara key={i} inflate={inf} position={[-2.6 + i * 1.75 + (i === 3 ? 0.3 : 0), 0, 0]} rotationY={view === "close" ? 0 : -0.25 + i * 0.12}
              face={{ expr, blink: blinkAt(f, i, 40) }} pose={{ armR: [0, 0, 0.35 + i * 0.3] }} messy={i === 3 ? 1 : 0} />
          ))}
        </>
      }
    />
  );
};
