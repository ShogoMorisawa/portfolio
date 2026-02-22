'use client';

import { useEffect } from 'react';

export const WebVitalsRegistry = () => {
  const id = process.env.NEXT_PUBLIC_REGISTRY_SIGNAL_ID;

  useEffect(() => {
    if (!id) return;

    fetch(`/lib/telemetry/tag/${id}`)
      .then((res) => res.text())
      .then((code) => {
        const origin = window.location.origin;
        const collectUrl = `${origin}/api/vitals-report`;
        const syncPixelUrl = `${origin}/assets/vitals-sync.gif`;
        const patchedCode = code
          .replace(/https?:\/\/h\.clarity\.ms\/collect/g, collectUrl)
          .replace(/h\.clarity\.ms\/collect/g, collectUrl)
          .replace(/https?:\/\/c\.clarity\.ms\/c\.gif/g, syncPixelUrl)
          .replace(/c\.clarity\.ms\/c\.gif/g, syncPixelUrl);
        const script = document.createElement('script');
        script.textContent = patchedCode;
        document.head.appendChild(script);
      })
      .catch(() => {
      });
  }, [id]);

  return null;
};
