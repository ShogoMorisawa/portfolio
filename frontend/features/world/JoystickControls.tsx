"use client";

import React, { useState } from "react";
import { useUIStore } from "@/shared/uiStore";

type Vec2 = { x: number; y: number };

const RADIUS = 60;

export default function JoystickControls() {
  const setJoystick = useUIStore((state) => state.setJoystick);
  const isDialogueOpen = useUIStore((state) => state.activeOverlay === "dialogue");
  const [basePosition, setBasePosition] = useState<Vec2 | null>(null);
  const [knobPosition, setKnobPosition] = useState<Vec2 | null>(null);

  const resetStick = () => {
    setJoystick(0, 0, false);
    setBasePosition(null);
    setKnobPosition(null);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDialogueOpen) return;
    const position = { x: event.clientX, y: event.clientY };
    setBasePosition(position);
    setKnobPosition(position);
    setJoystick(0, 0, true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!basePosition || isDialogueOpen) return;

    const dx = event.clientX - basePosition.x;
    const dy = event.clientY - basePosition.y;
    const distance = Math.hypot(dx, dy);
    const clampRatio = distance > RADIUS ? RADIUS / distance : 1;
    const clampedX = dx * clampRatio;
    const clampedY = dy * clampRatio;

    setKnobPosition({
      x: basePosition.x + clampedX,
      y: basePosition.y + clampedY,
    });
    setJoystick(clampedX / RADIUS, -clampedY / RADIUS, true);
  };

  if (isDialogueOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={resetStick}
      onPointerCancel={resetStick}
    >
      {basePosition && knobPosition && (
        <>
          <div
            className="absolute w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
            style={{
              left: basePosition.x,
              top: basePosition.y,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-12 h-12 rounded-full bg-white/60 border border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]"
            style={{
              left: knobPosition.x,
              top: knobPosition.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        </>
      )}
    </div>
  );
}
