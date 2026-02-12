"use client";

import React, { useState } from "react";
import { useInputStore } from "@/lib/world/store";

type Vec2 = { x: number; y: number };

const RADIUS = 60;

const JoystickControls = () => {
  const setJoystick = useInputStore((state) => state.setJoystick);
  const isTalking = useInputStore((state) => state.isTalking);
  const [basePos, setBasePos] = useState<Vec2 | null>(null);
  const [knobPos, setKnobPos] = useState<Vec2 | null>(null);

  const resetStick = () => {
    setJoystick(0, 0, false);
    setBasePos(null);
    setKnobPos(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTalking) return;
    const pos = { x: e.clientX, y: e.clientY };
    setBasePos(pos);
    setKnobPos(pos);
    setJoystick(0, 0, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!basePos || isTalking) return;
    const dx = e.clientX - basePos.x;
    const dy = e.clientY - basePos.y;
    const dist = Math.hypot(dx, dy);
    const clamped = dist > RADIUS ? RADIUS / dist : 1;
    const cx = dx * clamped;
    const cy = dy * clamped;

    // 画面の上方向が前進になるようにYは反転
    const normX = cx / RADIUS;
    const normY = -cy / RADIUS;

    setKnobPos({ x: basePos.x + cx, y: basePos.y + cy });
    setJoystick(normX, normY, true);
  };

  const handlePointerUp = () => {
    resetStick();
  };

  if (isTalking) return null;

  return (
    <div
      className="fixed inset-0 z-50 touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {basePos && knobPos && (
        <>
          <div
            className="absolute w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm border border-white/30"
            style={{
              left: basePos.x,
              top: basePos.y,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-12 h-12 rounded-full bg-white/60 border border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]"
            style={{
              left: knobPos.x,
              top: knobPos.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        </>
      )}
    </div>
  );
};

export default JoystickControls;
