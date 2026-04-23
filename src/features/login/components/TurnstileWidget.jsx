import { useEffect, useRef } from 'react';

export default function TurnstileWidget({ onVerify, onExpire, onError, onReady }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let intervalId;

    const mountWidget = () => {
      if (!mounted || !window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current !== null) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        theme: 'light',
        appearance: 'always',
        execution: 'execute',
        retry: 'auto',
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

      onReady?.(widgetIdRef.current);
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
      mounted = false;
      if (intervalId) clearInterval(intervalId);

      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [onVerify, onExpire, onError, onReady]);

  return <div ref={containerRef} className="flex justify-center" />;
}