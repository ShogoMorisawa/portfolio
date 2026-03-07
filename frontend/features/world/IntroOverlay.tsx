"use client";

import { useUIStore } from "@/shared/uiStore";

export function IntroOverlay() {
  const introSequence = useUIStore((state) => state.introSequence);
  const introMessage = useUIStore((state) => state.introMessage);
  const setIntroSequence = useUIStore((state) => state.setIntroSequence);

  if (introSequence !== "message" || !introMessage) return null;

  const [firstSegment, ...restSegments] = introMessage.split("！");
  const secondLine = restSegments.join("！");

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto cursor-pointer z-10000"
      onClick={() => setIntroSequence("release")}
      aria-label="開始メッセージを閉じる"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIntroSequence("release");
        }
      }}
    >
      <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
        <div
          className="bg-black/80 text-white p-8 rounded-2xl max-w-2xl w-full text-center shadow-2xl border border-white/10 transform transition-all"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-lg md:text-2xl font-medium leading-relaxed font-sans">
            {secondLine ? (
              <>
                {firstSegment}！
                <br className="md:hidden" />
                {secondLine}
              </>
            ) : (
              introMessage
            )}
          </p>
          <p className="mt-4 text-xs text-gray-400 opacity-70">Tap anywhere to close</p>
        </div>
      </div>
    </div>
  );
}
