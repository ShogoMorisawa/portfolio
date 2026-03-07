"use client";

import { useUIStore } from "@/shared/uiStore";

export function IntroOverlay() {
  const introSequence = useUIStore((state) => state.introSequence);
  const introMessage = useUIStore((state) => state.introMessage);
  const setIntroSequence = useUIStore((state) => state.setIntroSequence);

  if (introSequence !== "message" || !introMessage) return null;

  return (
    <button
      type="button"
      onClick={() => setIntroSequence("release")}
      className="absolute inset-0 z-9998 cursor-pointer bg-black/15 px-4"
      aria-label="開始メッセージを閉じる"
    >
      <div className="absolute inset-x-0 bottom-20 flex justify-center pointer-events-none">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-black/65 px-6 py-4 text-center text-white shadow-2xl backdrop-blur-sm">
          <p className="text-lg font-medium tracking-wide md:text-2xl">{introMessage}</p>
          <p className="mt-3 text-xs text-white/60">Click to continue</p>
        </div>
      </div>
    </button>
  );
}
