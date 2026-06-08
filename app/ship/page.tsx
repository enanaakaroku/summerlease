import SpaceShipScene from "@/component/SpaceShipScene";
import GlitchPageEffect from "@/ui/effect/GlitchPageEffect";
import CRTEffect from "@/ui/effect/CRTEffect";
import CRTDisplayEffect from "@/ui/effect/CRTDisplayEffect";

export default function Page() {
  return (
    <CRTDisplayEffect intensity="medium">
      <div className="h-screen">
        <SpaceShipScene></SpaceShipScene>
      </div>
    </CRTDisplayEffect>
  );
}
