"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";

const OWNER_MODE_STORAGE_KEY = "site_owner_mode";

export function syncOwnerMode(searchParams: ReadonlyURLSearchParams) {
  if (typeof window === "undefined") return;

  const me = searchParams.get("me");

  if (me === "true") {
    window.localStorage.setItem(OWNER_MODE_STORAGE_KEY, "1");
  } else if (me === "false") {
    window.localStorage.removeItem(OWNER_MODE_STORAGE_KEY);
  }
}

export function isOwnerModeEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(OWNER_MODE_STORAGE_KEY) === "1";
}

