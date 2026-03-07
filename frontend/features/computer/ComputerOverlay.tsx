"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useUIStore } from "@/shared/uiStore";
import { COMPUTER_WORKS } from "./computerData";

export default function ComputerOverlay() {
  const isOpen = useUIStore((state) => state.activeOverlay === "computer");
  const closeComputer = useUIStore((state) => state.closeComputer);
  const tabletScreenImageIndex = useUIStore(
    (state) => state.tabletScreenImageIndex,
  );
  const setTabletScreenImageIndex = useUIStore(
    (state) => state.setTabletScreenImageIndex,
  );
  const [showWhitePanel, setShowWhitePanel] = useState(false);
  const [showFrame, setShowFrame] = useState(false);

  const handleClose = useCallback(() => {
    setShowWhitePanel(false);
    setShowFrame(false);
    closeComputer();
  }, [closeComputer]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const whitePanelTimer = window.setTimeout(() => setShowWhitePanel(true), 250);
    const frameTimer = window.setTimeout(() => setShowFrame(true), 600);

    return () => {
      window.clearTimeout(whitePanelTimer);
      window.clearTimeout(frameTimer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentIndex =
    ((tabletScreenImageIndex % COMPUTER_WORKS.length) + COMPUTER_WORKS.length) %
    COMPUTER_WORKS.length;
  const currentWork = COMPUTER_WORKS[currentIndex] ?? COMPUTER_WORKS[0];
  const canSwitch = COMPUTER_WORKS.length >= 2;

  return (
    <div
      className="absolute inset-0 z-10000 pointer-events-auto cursor-pointer"
      onClick={handleClose}
      aria-label="閉じる"
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[82dvh] md:h-full md:w-[min(90vw,760px)] md:rounded-xl px-3 md:px-10 pt-6 md:pt-10 pb-8 md:pb-8 overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`absolute z-0 left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-full h-[50%] bg-white rounded-lg md:rounded-xl transition-opacity duration-400 ${
            showWhitePanel ? "opacity-100" : "opacity-0"
          }`}
        />
        <button
          type="button"
          onClick={handleClose}
          className="absolute z-20 top-3 right-3 md:top-4 md:right-4 w-10 h-10 flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 text-2xl leading-none hover:bg-neutral-100 cursor-pointer"
          aria-label="閉じる"
        >
          ×
        </button>
        <div
          className={`relative z-10 w-full max-w-[90vw] md:max-w-[520px] mx-auto aspect-square transition-opacity duration-1200 ease-out ${
            showFrame ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src="/computer/frame.png"
            alt="frame"
            fill
            className="object-contain"
            priority
          />
          {canSwitch && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setTabletScreenImageIndex(
                    (index) => (index - 1 + COMPUTER_WORKS.length) % COMPUTER_WORKS.length,
                  );
                }}
                className="absolute z-20 left-[-6px] md:left-[-10px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/70 transition-colors cursor-pointer"
                aria-label="前の作品"
              >
                <span
                  className="w-0 h-0 border-y-[9px] md:border-y-[10px] border-y-transparent border-r-[14px] md:border-r-[16px] border-r-white"
                  aria-hidden
                />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setTabletScreenImageIndex(
                    (index) => (index + 1) % COMPUTER_WORKS.length,
                  );
                }}
                className="absolute z-20 right-[-6px] md:right-[-10px] top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/55 hover:bg-black/70 transition-colors cursor-pointer"
                aria-label="次の作品"
              >
                <span
                  className="w-0 h-0 border-y-[9px] md:border-y-[10px] border-y-transparent border-l-[14px] md:border-l-[16px] border-l-white"
                  aria-hidden
                />
              </button>
            </>
          )}
          <div className="absolute inset-[18.6%] -translate-y-[1px]">
            {currentWork.href ? (
              <a
                href={currentWork.href}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 block cursor-pointer"
                onClick={(event) => event.stopPropagation()}
                aria-label={`${currentWork.title} のサイトを開く`}
              >
                <Image
                  src={currentWork.imageSrc}
                  alt={currentWork.title}
                  fill
                  className="object-cover"
                  priority
                />
              </a>
            ) : (
              <Image
                src={currentWork.imageSrc}
                alt={currentWork.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>
        <div
          className={`relative z-10 mt-5 text-center text-neutral-900 transition-opacity duration-1200 ease-out ${
            showFrame ? "opacity-100" : "opacity-0"
          }`}
        >
          <h3 className="text-2xl md:text-3xl font-bold tracking-wide">
            {currentWork.title}
          </h3>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-neutral-700">
            {currentWork.description}
          </p>
        </div>
      </div>
    </div>
  );
}
