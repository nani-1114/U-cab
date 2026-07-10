import { useEffect, useRef, useCallback } from 'react';

export const usePolling = (callback, interval = 5000, enabled = true) => {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; }, [callback]);

  const tick = useCallback(async () => {
    if (saved.current) await saved.current();
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    tick();
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [tick, interval, enabled]);
};
