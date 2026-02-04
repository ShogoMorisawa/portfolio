"use client";

import { Joystick } from "react-joystick-component";

interface JoystickMoveEvent {
  x: number | null;
  y: number | null;
}
import { useInputStore } from "@/lib/world/store";

const JoystickControls = () => {
  const setJoystick = useInputStore((state) => state.setJoystick);

  const handleMove = (e: JoystickMoveEvent) => {
    // x, y は -1 〜 1 の値で返ってくる（nullの場合は0として扱う）
    setJoystick(e.x ?? 0, e.y ?? 0, true);
  };

  const handleStop = () => {
    setJoystick(0, 0, false);
  };

  return (
    <div className="fixed bottom-10 right-10 z-50">
      <Joystick
        size={100}
        sticky={false}
        baseColor="#EEEEEE"
        stickColor="#333333"
        move={handleMove}
        stop={handleStop}
      />
    </div>
  );
};

export default JoystickControls;