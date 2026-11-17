import { Composition } from "remotion";
import { Cena3D } from "./Cena3D";
import { ShortDemo } from "./short/ShortDemo";
import { ShortV2 } from "./short/ShortV2";
import { ShortV3 } from "./short/v3/ShortV3";

export const RemotionRoot = () => (
  <>
    <Composition id="ShortV3" component={ShortV3} durationInFrames={294} fps={30} width={1080} height={1920} />
    <Composition id="ShortV2" component={ShortV2} durationInFrames={210} fps={30} width={1080} height={1920} />
    <Composition id="ShortDemo" component={ShortDemo} durationInFrames={210} fps={30} width={1080} height={1920} />
    <Composition id="Cena3D" component={Cena3D} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
