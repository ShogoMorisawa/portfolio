"use client";

import World from "@/components/world/World";
import JoystickControls from "@/components/world/ui/JoystickControls";

export default function Home() {
  return (
    <main className="relative w-full h-screen">
      <World />
      <JoystickControls />
    </main>
  );
}
