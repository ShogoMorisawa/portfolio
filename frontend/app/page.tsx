"use client";

import { Canvas } from "@react-three/fiber";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { useMemo } from "react";
import GorilliaIsland from "@/components/GorilliaIsland";

enum Controls {
  left = "left",
  right = "right",
  forward = "forward",
  backward = "backward",
}

export default function Home() {
  const controlMap = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.backward, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
    ],
    []
  );

  return (
    <div className="w-full h-screen bg-[#87CEEB]">
      <KeyboardControls map={controlMap}>
        <Canvas
          shadows
          camera={{ position: [0, 10, 20], fov: 50 }}
          dpr={[1, 2]}
        >
          <GorilliaIsland />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
