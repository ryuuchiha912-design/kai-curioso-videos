import { useCurrentFrame } from "remotion";
import { Character, Fish } from "../kit/Character";
import { Expr } from "../kit/Face";
import { Stage } from "../kit/Stage";
import { blinkAt } from "../kit/anim";

const EXPRS: Expr[] = ["neutral", "happy", "joy", "excited", "surprised", "sad", "worried", "determined", "tearsJoy", "wink"];

/** Folha de personagens: confere proporção, material e expressões antes de animar. */
export const CharacterSheet: React.FC = () => {
  const f = useCurrentFrame();
  const expr = EXPRS[Math.floor(f / 10) % EXPRS.length];
  const turn = f * 0.035;
  return (
    <Stage
      background="#f3c98f"
      cam={{ pos: [0, 1.1, 6.4], target: [0, 0.85, 0], fov: 32 }}
      fg={
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[6, 64]} />
            <meshStandardMaterial color="#e9b77a" roughness={0.9} />
          </mesh>
          <Character kind="leo" position={[-0.75, 0, 0]} rotationY={Math.sin(turn) * 0.6} face={{ expr, blink: blinkAt(f, 1, 40) }} />
          <Character kind="bia" position={[0.75, 0, 0]} rotationY={Math.sin(turn + 1) * 0.6} face={{ expr, blink: blinkAt(f, 3, 40) }} pose={{ armR: [0, 0, 2.4] }} />
          <Fish frame={f} position={[0, 0.35, 1]} rotationY={-Math.PI / 2 + Math.sin(turn) * 0.8} scale={1.3} />
        </>
      }
    />
  );
};
