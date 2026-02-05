"use client";

import { Loader } from "@react-three/drei";
import World from "@/components/world/World";
import JoystickControls from "@/components/world/ui/JoystickControls";

export default function Home() {
  return (
    <main className="relative w-full h-screen bg-black">
      <World />
      <JoystickControls />

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
