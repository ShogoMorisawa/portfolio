"use client";

import {
  selectInteractionTarget,
  useUIStore,
  type InteractionTarget,
} from "@/shared/uiStore";

export function InteractionPrompt() {
  const interactionTarget = useUIStore(selectInteractionTarget);
  const startDialogue = useUIStore((state) => state.startDialogue);
  const openBook = useUIStore((state) => state.openBook);
  const openBox = useUIStore((state) => state.openBox);
  const openPost = useUIStore((state) => state.openPost);
  const openComputer = useUIStore((state) => state.openComputer);

  if (!interactionTarget) return null;

  const handleOpen = () => {
    const openByTarget: Record<InteractionTarget, () => void> = {
      crystal: startDialogue,
      book: openBook,
      box: openBox,
      post: openPost,
      computer: openComputer,
    };

    openByTarget[interactionTarget]();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-9999">
      <button
        type="button"
        onClick={handleOpen}
        className="pointer-events-auto cursor-pointer group relative flex items-center justify-center w-28 h-28 md:w-32 md:h-32 xl:w-36 xl:h-36 min-[1920px]:w-40 min-[1920px]:h-40 rounded-full bg-black/55 backdrop-blur-md border-[3px] border-white/85 shadow-[0_0_40px_rgba(255,255,255,0.75),inset_0_0_24px_rgba(255,255,255,0.12)] transition-all duration-300 hover:scale-110 hover:bg-black/70 hover:border-yellow-200 active:scale-95 animate-pulse"
      >
        <span className="text-white font-bold text-2xl md:text-3xl min-[1920px]:text-4xl tracking-widest [text-shadow:0_2px_10px_rgba(0,0,0,0.9)] group-hover:text-yellow-100">
          TAP
        </span>
        <div className="absolute inset-0 rounded-full border-2 border-white/70 animate-ping opacity-70" />
      </button>
    </div>
  );
}
