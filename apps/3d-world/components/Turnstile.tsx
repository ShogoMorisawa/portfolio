"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  action: string;
  onToken: (token: string) => void;
};

const SCRIPT_ID = "cloudflare-turnstile-script";

export function Turnstile({ action, onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!sitekey) {
      onToken("");
      return;
    }

    let widgetId: string | undefined;
    let cancelled = false;
    const render = () => {
      if (cancelled || widgetId || !containerRef.current || !window.turnstile)
        return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey,
        action,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", render);
    render();

    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [action, onToken]);

  return <div ref={containerRef} />;
}
