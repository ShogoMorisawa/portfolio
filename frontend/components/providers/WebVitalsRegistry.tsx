'use client';

import Script from 'next/script';

export const WebVitalsRegistry = () => {
  // 環境変数名はあえて「ANALYTICS」を避けて「SIGNAL_ID」などに
  const id = process.env.NEXT_PUBLIC_REGISTRY_SIGNAL_ID;

  if (!id) return null;

  return (
    <Script id="vitals-registry" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;
            // 偽装したパス (/lib/telemetry) を通して通信
            t.src="/lib/telemetry/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${id}");
      `}
    </Script>
  );
};
