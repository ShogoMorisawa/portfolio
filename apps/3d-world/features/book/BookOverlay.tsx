"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUIStore } from "@/shared/uiStore";
import {
  ADVENTURE_SLOTS,
  getAdventureSlot,
  type AdventureSlotId,
} from "@/features/book/bookData";

const FONT_CLASS = "font-adventure";

function SlotList({
  onSelect,
  onClose,
}: {
  onSelect: (id: AdventureSlotId) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <p
        className={`text-white text-center text-lg md:text-xl ${FONT_CLASS} tracking-wide`}
      >
        <span className="block md:inline">どの　ぼうけんのしょ　を　</span>
        <span>みますか？</span>
      </p>
      <div className="flex flex-col gap-3">
        {ADVENTURE_SLOTS.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelect(slot.id)}
            className={`
              w-full text-left px-5 py-4 rounded
              bg-black border-2 border-white
              ${FONT_CLASS} text-white text-base md:text-lg
              hover:bg-white hover:text-black transition-colors
            `}
          >
            <span className="block">ぼうけんのしょ{slot.id}</span>
            <span className="block text-sm opacity-80 mt-0.5">
              {slot.id === 1 && "こうこうせい"}
              {slot.id === 2 && "はうすきーぱー"}
              {slot.id === 3 && "えんじにあ"}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className={`
          mt-4 px-6 py-2 border-2 border-white text-white
          ${FONT_CLASS} text-sm
          hover:bg-white hover:text-black transition-colors
        `}
      >
        とじる
      </button>
    </div>
  );
}

function GaugeBar({
  label,
  current,
  max,
  className = "",
}: {
  label: string;
  current: number;
  max: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span className={FONT_CLASS}>{label}</span>
        <span className={FONT_CLASS}>
          {current}/{max}
        </span>
      </div>
      <div className="h-3 border-2 border-white bg-black overflow-hidden">
        <div
          className="h-full bg-white transition-all"
          style={{ width: `${(current / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

function DetailView({
  slotId,
  onBack,
}: {
  slotId: AdventureSlotId;
  onBack: () => void;
}) {
  const slot = getAdventureSlot(slotId);
  if (!slot) return null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-white text-sm md:text-base">
        <span className={FONT_CLASS}>レベル</span>
        <span className={FONT_CLASS}>Lv. {slot.level}</span>
        <span className={FONT_CLASS}>しょくぎょう</span>
        <span className={FONT_CLASS}>{slot.job}</span>
        <span className={FONT_CLASS}>ばしょ</span>
        <span className={FONT_CLASS}>{slot.location}</span>
      </div>

      <GaugeBar label="HP" current={slot.hp} max={slot.hpMax} className="text-white" />
      <GaugeBar label="MP" current={slot.mp} max={slot.mpMax} className="text-white" />

      {slot.skills.length > 0 && (
        <div>
          <p className={`${FONT_CLASS} text-white text-sm mb-2`}>とくぎ</p>
          <ul className="list-disc list-inside text-white text-sm space-y-1">
            {slot.skills.map((skill, index) => (
              <li key={index} className={FONT_CLASS}>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className={`${FONT_CLASS} text-white text-sm mb-2`}>せつめい</p>
        <p
          className={`${FONT_CLASS} text-white text-sm leading-relaxed whitespace-pre-line`}
        >
          {slot.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onBack}
        className={`
          mt-2 px-6 py-2 border-2 border-white text-white
          ${FONT_CLASS} text-sm
          hover:bg-white hover:text-black transition-colors
        `}
      >
        もどる
      </button>
    </div>
  );
}

export default function BookOverlay() {
  const isOpen = useUIStore((state) => state.activeOverlay === "book");
  const selectedSlot = useUIStore((state) => state.selectedAdventureSlot);
  const closeBook = useUIStore((state) => state.closeBook);
  const setSelectedAdventureSlot = useUIStore(
    (state) => state.setSelectedAdventureSlot,
  );
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const handleBack = useCallback(() => {
    setSelectedAdventureSlot(null);
  }, [setSelectedAdventureSlot]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedSlot) {
        setSelectedAdventureSlot(null);
        return;
      }
      closeBook();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeBook, isOpen, selectedSlot, setSelectedAdventureSlot]);

  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    let hintTimeout: number | null = null;

    const updateScrollState = () => {
      const canScroll = panel.scrollHeight > panel.clientHeight + 4;
      setIsScrollable(canScroll);
      setShowScrollHint(canScroll);

      if (hintTimeout) window.clearTimeout(hintTimeout);
      if (canScroll) {
        hintTimeout = window.setTimeout(() => {
          setShowScrollHint(false);
        }, 3000);
      }
    };

    const frameId = window.requestAnimationFrame(updateScrollState);

    const handleScroll = () => {
      if (panel.scrollTop > 4) setShowScrollHint(false);
    };

    panel.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.cancelAnimationFrame(frameId);
      panel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
      if (hintTimeout) window.clearTimeout(hintTimeout);
    };
  }, [isOpen, selectedSlot]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
      onClick={(event) => {
        if (event.target === overlayRef.current) closeBook();
      }}
    >
      <div
        ref={panelRef}
        className={`
          relative w-[min(94vw,34rem)] xl:w-[min(74vw,42rem)] max-h-[88vh] overflow-y-auto
          bg-black border-4 border-white
          p-6 md:p-8
          shadow-[0_0_0_4px_black,0_0_0_8px_white]
          ${FONT_CLASS}
        `}
        onClick={(event) => event.stopPropagation()}
      >
        {isScrollable && showScrollHint && (
          <div className="pointer-events-none absolute right-3 top-3 z-10 rounded border border-white/30 bg-black/70 px-2 py-1 text-xs text-white/85 animate-pulse">
            ↑↓
          </div>
        )}
        {selectedSlot === null ? (
          <SlotList onSelect={setSelectedAdventureSlot} onClose={closeBook} />
        ) : (
          <DetailView slotId={selectedSlot} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
