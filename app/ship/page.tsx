import SpaceShipScene from "@/component/SpaceShipScene";
import CrossGridCursorCanvas from "@/ui/canvas/CrossGridCursorCanvas";

export default function Page() {
  return (
    <div className="h-screen relative">
      <SpaceShipScene></SpaceShipScene>
      <div className="absolute inset-0">
        <CrossGridCursorCanvas></CrossGridCursorCanvas>
      </div>
    </div>
  );
}
