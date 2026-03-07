"use client";

import { useUIStore } from "@/shared/uiStore";

export function InteractionPrompt() {
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const nearbyTarget = useUIStore((state) => state.nearbyTarget);
  const startDialogue = useUIStore((state) => state.startDialogue);
  const openBook = useUIStore((state) => state.openBook);
  const openBox = useUIStore((state) => state.openBox);
  const openPost = useUIStore((state) => state.openPost);
  const openComputer = useUIStore((state) => state.openComputer);

  if (activeOverlay !== "none" || !nearbyTarget) return null;

  const handleOpen = () => {
    if (nearbyTarget === "crystal") {
      startDialogue();
      return;
    }
    if (nearbyTarget === "book") {
      openBook();
      return;
    }
    if (nearbyTarget === "box") {
      openBox();
      return;
    }
    if (nearbyTarget === "post") {
      openPost();
      return;
    }
    openComputer();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-9999">
      <button
        type="button"
        onClick={handleOpen}
        className="pointer-events-auto cursor-pointer group relative flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-110 hover:bg-white/40 active:scale-95 animate-pulse"
      >
        <span className="text-white font-bold text-xl tracking-widest drop-shadow-md group-hover:text-yellow-200">
          TAP
        </span>
        <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-50" />
      </button>
    </div>
  );
}
