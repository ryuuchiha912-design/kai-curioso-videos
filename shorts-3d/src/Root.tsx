import { Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/LilitaOne";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { FPS } from "./kit/anim";
import { CharacterSheet } from "./tests/CharacterSheet";
import { Short } from "./short/Short";
import { TOTAL_SEC as MOEDINHA_SEC } from "./short/timeline";
import { Ocarina } from "./short2/Ocarina";
import { TOTAL_SEC as OCARINA_SEC } from "./short2/timeline";
import { Capivara } from "./short3/Capivara";
import { CapySheet } from "./short3/CapySheet";
import { TOTAL_SEC as CAPIVARA_SEC } from "./short3/timeline";
import { Reel } from "./short4/Reel";
import { TOTAL_SEC as REEL_SEC } from "./short4/timeline";
import { ToonSheet } from "./short5/ToonSheet";
import { Dobra } from "./short5/Dobra";
import { CelTest } from "./short6/CelTest";
import { Microondas } from "./short6/Microondas";
import { RenSheet } from "./short7/RenSheet";
import { Aviao } from "./short8/Aviao";
import { Capa as AviaoCapa } from "./short8/Capa";
import { Pombo } from "./short9/Pombo";
import { Torre } from "./short10/Torre";
import { TorreCapa } from "./short10/Capa";
import { Bike } from "./short11/Bike";
import { BikeCapa } from "./short11/Capa";
import { TOTAL as BIKE_SEC } from "./short11/shots";
import { NicoAvatar, NicoBanner } from "./channel/NicoBrand";
import { TOTAL as TORRE_SEC } from "./short10/shots";
import { TOTAL as POMBO_SEC } from "./short9/shots";
import { TOTAL as AVIAO_SEC, timing as aviaoTiming } from "./short8/shots";
import { Ultimo } from "./short7/Ultimo";
import { TOTAL as ULTIMO_SEC } from "./short7/shots";
import { TOTAL as MICRO_SEC } from "./short6/shots";
import { TOTAL_SEC as DOBRA_SEC } from "./short5/timeline";

loadFont();
loadNunito("normal", { weights: ["800"] });

const V = { fps: FPS, width: 1080, height: 1920 };

export const Root = () => (
  <>
    {/* Shorts verticais (1080x1920, 30 fps) */}
    <Composition id="Short" component={Short} durationInFrames={Math.ceil(MOEDINHA_SEC * FPS)} {...V} defaultProps={{ captions: true }} />
    <Composition id="Ocarina" component={Ocarina} durationInFrames={Math.ceil(OCARINA_SEC * FPS)} {...V} defaultProps={{ captions: true }} />
    <Composition id="Capivara" component={Capivara} durationInFrames={Math.ceil(CAPIVARA_SEC * FPS)} {...V} defaultProps={{ captions: true }} />
    <Composition id="Dobra" component={Dobra} durationInFrames={Math.ceil(DOBRA_SEC * FPS)} {...V} defaultProps={{ captions: true }} />
    <Composition id="Microondas" component={Microondas} durationInFrames={Math.ceil(MICRO_SEC * FPS)} {...V} defaultProps={{ captions: true }} />
    {/* Canal do Nico (curiosidades em 3D) */}
    <Composition id="Aviao" component={Aviao} durationInFrames={Math.ceil(AVIAO_SEC * FPS)} {...V} defaultProps={{ captions: true, audio: true }} />
    <Composition id="AviaoEN" component={Aviao} durationInFrames={Math.ceil(aviaoTiming("en").total * FPS)} {...V} defaultProps={{ captions: true, audio: true, lang: "en" as const }} />
    <Composition id="Pombo" component={Pombo} durationInFrames={Math.ceil(POMBO_SEC * FPS)} {...V} defaultProps={{ captions: true, audio: true }} />
    <Composition id="PomboTeste" component={Pombo} durationInFrames={210} {...V} defaultProps={{ captions: true, audio: true }} />
    <Composition id="TorreEN" component={Torre} durationInFrames={Math.ceil(TORRE_SEC * FPS)} {...V} defaultProps={{ captions: true, audio: true }} />
    <Composition id="TorreCapaEN" component={TorreCapa} durationInFrames={1} {...V} />
    <Composition id="NicoAvatar" component={NicoAvatar} durationInFrames={1} fps={FPS} width={800} height={800} />
    <Composition id="NicoBanner" component={NicoBanner} durationInFrames={1} fps={FPS} width={2560} height={1440} defaultProps={{ lang: "en" as const }} />
    <Composition id="BikeEN" component={Bike} durationInFrames={Math.ceil(BIKE_SEC * FPS)} {...V} defaultProps={{ captions: true, audio: true }} />
    <Composition id="BikeCapaEN" component={BikeCapa} durationInFrames={1} {...V} />
    <Composition id="AviaoCapa" component={AviaoCapa} durationInFrames={1} {...V} defaultProps={{ lang: "pt" as const }} />
    <Composition id="AviaoCapaEN" component={AviaoCapa} durationInFrames={1} {...V} defaultProps={{ lang: "en" as const }} />
    {/* Vídeo longo 16:9 (canal do Ren) */}
    <Composition id="Ultimo" component={Ultimo} durationInFrames={Math.ceil(ULTIMO_SEC * FPS)} fps={FPS} width={1920} height={1080} defaultProps={{ captions: true, audio: true }} />
    <Composition id="UltimoHD" component={Ultimo} durationInFrames={Math.ceil(ULTIMO_SEC * FPS)} fps={FPS} width={1280} height={720} defaultProps={{ captions: true, audio: false }} />
    <Composition id="Reel3D" component={Reel} durationInFrames={Math.ceil(REEL_SEC * FPS)} {...V} defaultProps={{ captions: true }} />
    {/* Folhas de personagem (para conferir modelos) */}
    <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={100} fps={30} width={1080} height={1080} />
    <Composition id="ToonSheet" component={ToonSheet} durationInFrames={100} fps={30} width={1080} height={1080} defaultProps={{ view: "front" as const, expr: "smile" as const }} />
    <Composition id="CelTest" component={CelTest} durationInFrames={90} {...V} defaultProps={{ cel: true }} />
    <Composition id="RenSheet" component={RenSheet} durationInFrames={30} fps={30} width={1080} height={1080} defaultProps={{ view: "front" as const, expr: "neutral" as const }} />
    <Composition id="CapivaraSheet" component={CapySheet} durationInFrames={100} fps={30} width={1080} height={1080} defaultProps={{ view: "front" as const }} />
  </>
);
