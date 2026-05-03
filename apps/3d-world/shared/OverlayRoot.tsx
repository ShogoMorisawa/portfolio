"use client";

import { useEffect, useRef } from "react";
import BookOverlay from "@/features/book/BookOverlay";
import BoxOverlay from "@/features/box/BoxOverlay";
import ComputerOverlay from "@/features/computer/ComputerOverlay";
import PostOverlay from "@/features/post/PostOverlay";
import DialogueOverlay from "@/features/world/DialogueOverlay";
import {
  setOverlayHistoryClosingState,
  useUIStore,
} from "@/shared/uiStore";

const OVERLAY_HISTORY_STATE_KEY = "portfolioOverlay";

export function OverlayRoot() {
  const activeOverlay = useUIStore((state) => state.activeOverlay);
  const hasOverlayHistoryRef = useRef(false);

  useEffect(() => {
    const handlePopState = () => {
      if (useUIStore.getState().activeOverlay === "none") {
        hasOverlayHistoryRef.current = false;
        return;
      }

      hasOverlayHistoryRef.current = false;
      setOverlayHistoryClosingState(true);
      useUIStore.getState().closeActiveOverlay();
      queueMicrotask(() => setOverlayHistoryClosingState(false));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (activeOverlay === "none") {
      hasOverlayHistoryRef.current = false;
      return;
    }

    if (hasOverlayHistoryRef.current) return;

    window.history.pushState(
      {
        ...(window.history.state ?? {}),
        [OVERLAY_HISTORY_STATE_KEY]: true,
      },
      "",
      window.location.href,
    );
    hasOverlayHistoryRef.current = true;
  }, [activeOverlay]);

  if (activeOverlay === "none") return null;

  return (
    <>
      {activeOverlay === "dialogue" && <DialogueOverlay />}
      {activeOverlay === "book" && <BookOverlay />}
      {activeOverlay === "box" && <BoxOverlay />}
      {activeOverlay === "post" && <PostOverlay />}
      {activeOverlay === "computer" && <ComputerOverlay />}
    </>
  );
}
