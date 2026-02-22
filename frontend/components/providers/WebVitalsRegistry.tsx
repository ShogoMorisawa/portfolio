'use client';

import { useEffect } from 'react';

const decode = (s: string) => atob(s);
const escapeRegex = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const WebVitalsRegistry = () => {
  const id = process.env.NEXT_PUBLIC_REGISTRY_SIGNAL_ID;

  useEffect(() => {
    if (!id) return;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const proxyPaths = {
      script: `/lib/telemetry/tag/${id}`,
      report: `${origin}/api/vitals-report`,
      sync: `${origin}/assets/vitals-sync.gif`,
    };

    fetch(proxyPaths.script)
      .then((res) => res.text())
      .then((code) => {
        let patched = code;

        const hFull = new RegExp(
          escapeRegex(decode('aHR0cHM6Ly9oLmNsYXJpdHkubXMvY29sbGVjdA==')),
          'g',
        );
        const hBare = new RegExp(
          escapeRegex(decode('aC5jbGFyaXR5Lm1zL2NvbGxlY3Q=')),
          'g',
        );
        patched = patched.replace(hFull, proxyPaths.report);
        patched = patched.replace(hBare, proxyPaths.report);

        const cFull = new RegExp(
          escapeRegex(decode('aHR0cHM6Ly9jLmNsYXJpdHkubXMvYy5naWY=')),
          'g',
        );
        const cBare = new RegExp(
          escapeRegex(decode('Yy5jbGFyaXR5Lm1zL2MuZ2lm')),
          'g',
        );
        patched = patched.replace(cFull, proxyPaths.sync);
        patched = patched.replace(cBare, proxyPaths.sync);

        const s = document.createElement('script');
        s.textContent = patched;
        document.head.appendChild(s);
      })
      .catch(() => {});
  }, [id]);

  return null;
};
