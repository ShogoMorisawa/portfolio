"use client";

import { Loader } from "@react-three/drei";
import World from "@/features/world/World";
import JoystickControls from "@/features/world/JoystickControls";
import { IntroOverlay } from "@/features/world/IntroOverlay";
import { InteractionPrompt } from "@/shared/InteractionPrompt";
import { OverlayRoot } from "@/shared/OverlayRoot";

export default function Home() {
  return (
    <main className="relative w-full h-dvh overflow-hidden bg-black">
      <World />
      <JoystickControls />
      <IntroOverlay />
      <InteractionPrompt />
      <OverlayRoot />

      <Loader
        containerStyles={{ background: "black" }}
        innerStyles={{ background: "white", height: "2px" }}
        barStyles={{ background: "white", height: "2px" }}
        dataStyles={{
          color: "white",
          fontSize: "1.2rem",
          fontFamily: "sans-serif",
        }}
        dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
      />
    </main>
  );
}
