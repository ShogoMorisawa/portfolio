"use client";

import { useUIStore } from "@/shared/uiStore";

export default function DialogueOverlay() {
  const isOpen = useUIStore((state) => state.activeOverlay === "dialogue");
  const activeMessage = useUIStore((state) => state.activeMessage);
  const closeDialogue = useUIStore((state) => state.closeDialogue);

  if (!isOpen || !activeMessage) return null;

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto cursor-pointer z-10000"
      onClick={closeDialogue}
    >
      <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
        <div className="bg-black/80 text-white w-[min(92vw,42rem)] xl:w-[min(80vw,52rem)] p-6 md:p-8 xl:p-10 rounded-2xl text-center shadow-2xl border border-white/10 transform transition-all">
          <p className="text-lg md:text-xl xl:text-2xl font-medium leading-relaxed font-sans">
            {activeMessage}
          </p>
          <p className="type-caption mt-4 text-gray-400 opacity-70">
            Tap anywhere to close
          </p>
        </div>
      </div>
    </div>
  );
}
