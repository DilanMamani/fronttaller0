import { useEffect, useRef } from 'react';

export default function TurnstileWidget({ onVerify, onExpire, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const renderWidget = () => {
      if (
        cancelled ||
        !containerRef.current ||
        !window.turnstile ||
        widgetIdRef.current !== null
      ) {
        return;
      }

      containerRef.current.innerHTML = '';

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        callback: (token) => {
          onVerify?.(token);
        },
        'expired-callback': () => {
          widgetIdRef.current = null;
          onExpire?.();
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
          renderWidget();
        },
        'error-callback': () => {
          onError?.();
        },
        theme: 'light',
      });
    };

    const waitForTurnstile = setInterval(() => {
      if (window.turnstile) {
        clearInterval(waitForTurnstile);
        renderWidget();
      }
    }, 300);

    return () => {
      cancelled = true;
      clearInterval(waitForTurnstile);

      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Error al remover Turnstile:', error);
        }
      }
    };
  }, [onVerify, onExpire, onError]);

  return <div ref={containerRef} className="flex justify-center" />;
}