import { useCallback, useEffect, useRef } from 'react';

export type Subscribe = (callback: (event: MessageEvent) => void) => () => void;

export const useWorkerMessages = (worker: undefined | Worker | MessagePort) => {
  const idCount = useRef(0);
  const subscriptionsRef = useRef<{
    [key: string]: (event: MessageEvent) => void;
  }>({});

  const subscribe = useCallback(
    (callback: (event: MessageEvent) => void) => {
      const id = idCount.current;
      idCount.current += 1;

      subscriptionsRef.current[id] = callback;

      return () => {
        delete subscriptionsRef.current[id];
      };
    },
    [subscriptionsRef]
  );

  useEffect(() => {
    if (!worker) return;
    const previousOnMessage = worker.onmessage;
    worker.onmessage = (event: MessageEvent) => {
      Object.values(subscriptionsRef.current).forEach(callback => {
        callback(event);
      });
      if (previousOnMessage) {
        (previousOnMessage as any)(event);
      }
    };
  }, [worker, subscriptionsRef]);

  return subscribe;
};
