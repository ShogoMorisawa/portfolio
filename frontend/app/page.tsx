"use client";

import dynamic from "next/dynamic";
import { Loader } from "@react-three/drei";
import World from "@/components/world/World";
import JoystickControls from "@/components/world/ui/JoystickControls";
import InteractionUI from "@/components/ui/InteractionUI";
import AdventureBookUI from "@/components/ui/AdventureBookUI";
import { useInputStore } from "@/lib/world/store";

const BoxUI = dynamic(() => import("@/components/ui/BoxUI"), { ssr: false });

export default function Home() {
  const boxView = useInputStore((s) => s.boxView);

  return (
    <main className="relative w-full h-screen bg-black">
      <World />
      <JoystickControls />
      <InteractionUI />
      <AdventureBookUI />
      {boxView !== "closed" && <BoxUI />}

      <Loader
        containerStyles={{ background: "black" }}
        innerStyles={{ background: "white", height: "2px" }}
        barStyles={{ background: "white", height: "2px" }}
        dataStyles={{ color: "white", fontSize: "1.2rem", fontFamily: "sans-serif" }}
        dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
      />
    </main>
  );
}
