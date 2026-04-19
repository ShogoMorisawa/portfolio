"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { isOwnerModeEnabled, syncOwnerMode } from "@/shared/ownerMode";

const PORTFOLIO_VISIT_SESSION_KEY = "portfolio_visit_notified";

function getVisitPayload() {
  const documentWithReferrerPolicy = document as Document & {
    referrerPolicy?: string;
  };

  return {
    url: window.location.href,
    path: window.location.pathname,
    referer: document.referrer || "Direct/None",
    referrerPolicy: documentWithReferrerPolicy.referrerPolicy || "unknown",
    language: navigator.language || "unknown",
    languages: navigator.languages || [],
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo",
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
}

export function PortfolioVisitNotifier() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    syncOwnerMode(searchParams);
    if (isOwnerModeEnabled()) return;
    if (window.sessionStorage.getItem(PORTFOLIO_VISIT_SESSION_KEY) === "1") {
      return;
    }

    window.sessionStorage.setItem(PORTFOLIO_VISIT_SESSION_KEY, "1");

    void fetch("/api/portfolio-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getVisitPayload()),
      keepalive: true,
    }).catch(() => {});
  }, [searchParams]);

  return null;
}
