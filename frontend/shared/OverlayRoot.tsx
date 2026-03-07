"use client";

import BookOverlay from "@/features/book/BookOverlay";
import BoxOverlay from "@/features/box/BoxOverlay";
import ComputerOverlay from "@/features/computer/ComputerOverlay";
import PostOverlay from "@/features/post/PostOverlay";
import DialogueOverlay from "@/features/world/DialogueOverlay";
import { useUIStore } from "@/shared/uiStore";

export function OverlayRoot() {
  const activeOverlay = useUIStore((state) => state.activeOverlay);

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
