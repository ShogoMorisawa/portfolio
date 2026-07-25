"use client";

import { Suspense, useEffect } from "react";
import { Loader } from "@react-three/drei";
import { PortfolioVisitNotifier } from "@/components/providers/PortfolioVisitNotifier";
import World from "@/features/world/World";
import JoystickControls from "@/features/world/JoystickControls";
import { IntroOverlay } from "@/features/world/IntroOverlay";
import { InteractionPrompt } from "@/shared/InteractionPrompt";
import { OverlayRoot } from "@/shared/OverlayRoot";
import { LETTER_API_BASE_URL } from "@/lib/letterApi";

export default function Home() {
  useEffect(() => {
    void fetch(`${LETTER_API_BASE_URL}/health/ready`, {
      credentials: "include",
    }).catch(() => undefined);
  }, []);

  return (
    <main className="relative w-full h-dvh overflow-hidden bg-black">
      <Suspense fallback={null}>
        <PortfolioVisitNotifier />
      </Suspense>
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
