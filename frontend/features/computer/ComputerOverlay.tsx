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
        className="absolute left-1/2 top-1/2 flex h-[82dvh] w-full -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden px-3 pt-6 pb-8 md:h-full md:w-[50vw] md:rounded-xl md:px-10 md:pt-10 md:pb-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`absolute z-0 left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-full min-[1920px]:w-[calc(100%+120px)] h-[50%] bg-white rounded-lg md:rounded-xl transition-opacity duration-400 ${
            showWhitePanel ? "opacity-100" : "opacity-0"
          }`}
        />
        <button
          type="button"
          onClick={handleClose}
          className="absolute z-20 top-3 right-3 md:top-4 md:right-4 xl:top-5 xl:right-5 min-[1920px]:top-6 min-[1920px]:right-6 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-[1.7rem] leading-none text-neutral-800 hover:bg-neutral-100 cursor-pointer md:h-12 md:w-12 xl:h-14 xl:w-14 min-[1920px]:h-16 min-[1920px]:w-16 min-[1920px]:text-[2.1rem]"
          aria-label="閉じる"
        >
          ×
        </button>
        <div
          className={`relative z-10 my-auto flex w-full flex-col transition-opacity duration-1200 ease-out ${
            showFrame ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex h-[min(44vw,56dvh)] min-h-[280px] items-center justify-center md:h-[min(40vw,54dvh)] xl:h-[min(36vw,56dvh)] min-[1920px]:h-[min(34vw,58dvh)]">
            <div className="relative mx-auto aspect-square w-[min(90vw,50dvh)] md:w-[min(50vw,520px,52dvh)] xl:w-[min(50vw,620px,56dvh)] min-[1920px]:w-[min(50vw,760px,54dvh)]">
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
                  className="absolute z-20 left-[-8px] md:left-[-12px] xl:left-[-16px] min-[1920px]:left-[-22px] top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 transition-colors cursor-pointer hover:bg-black/70 md:h-[3.25rem] md:w-[3.25rem] xl:h-[3.75rem] xl:w-[3.75rem] min-[1920px]:h-[4.5rem] min-[1920px]:w-[4.5rem]"
                  aria-label="前の作品"
                >
                  <span
                    className="h-0 w-0 border-y-[10px] border-y-transparent border-r-[15px] border-r-white md:border-y-[11px] md:border-r-[17px] xl:border-y-[13px] xl:border-r-[20px] min-[1920px]:border-y-[15px] min-[1920px]:border-r-[24px]"
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
                  className="absolute z-20 right-[-8px] md:right-[-12px] xl:right-[-16px] min-[1920px]:right-[-22px] top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 transition-colors cursor-pointer hover:bg-black/70 md:h-[3.25rem] md:w-[3.25rem] xl:h-[3.75rem] xl:w-[3.75rem] min-[1920px]:h-[4.5rem] min-[1920px]:w-[4.5rem]"
                  aria-label="次の作品"
                >
                  <span
                    className="h-0 w-0 border-y-[10px] border-y-transparent border-l-[15px] border-l-white md:border-y-[11px] md:border-l-[17px] xl:border-y-[13px] xl:border-l-[20px] min-[1920px]:border-y-[15px] min-[1920px]:border-l-[24px]"
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
          </div>
          <div className="mt-4 mx-auto w-full max-w-[min(96vw,560px)] min-h-[120px] md:min-h-[136px] xl:max-w-[680px] xl:min-h-[152px] min-[1920px]:max-w-[820px] min-[1920px]:min-h-[176px] text-center text-neutral-900">
            <h3 className="type-title font-bold tracking-wide">
              {currentWork.title}
            </h3>
            <p className="type-body mt-3 text-neutral-700">
              {currentWork.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
