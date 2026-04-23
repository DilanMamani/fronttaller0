import { useEffect, useRef } from 'react';

export default function TurnstileWidget({ onVerify, onExpire, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let intervalId;

    const mountWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current !== null) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        theme: 'light',
        appearance: 'always',
        callback: (token) => {
          onVerify?.(token);
        },
        'expired-callback': () => {
          onExpire?.();
        },
        'error-callback': () => {
          onError?.();
        },
      });
    };

    if (window.turnstile) {
      mountWidget();
    } else {
      intervalId = setInterval(() => {
        if (window.turnstile) {
          clearInterval(intervalId);
          mountWidget();
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [onVerify, onExpire, onError]);

  return <div ref={containerRef} className="flex justify-center" />;
}