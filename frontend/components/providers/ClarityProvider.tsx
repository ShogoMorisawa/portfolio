"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isOwnerModeEnabled, syncOwnerMode } from "@/shared/ownerMode";

const CLARITY_SCRIPT_ID = "clarity-script";

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

function ensureClarityQueue() {
  if (typeof window.clarity === "function") return;

  const clarity: ((...args: unknown[]) => void) & { q?: unknown[][] } = (
    ...args: unknown[]
  ) => {
    (clarity.q = clarity.q || []).push(args);
  };

  window.clarity = clarity;
}

export function ClarityProvider() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!projectId || typeof window === "undefined") return;
    if (process.env.NODE_ENV === "development") return;
    if (document.getElementById(CLARITY_SCRIPT_ID)) return;

    syncOwnerMode(searchParams);
    if (isOwnerModeEnabled()) return;

    ensureClarityQueue();

    const script = document.createElement("script");
    script.id = CLARITY_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${projectId}`;
    document.head.appendChild(script);
  }, [projectId, searchParams]);

  return null;
}
