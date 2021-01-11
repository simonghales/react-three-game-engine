import { useCallback } from 'react';

export const useHandleWorkerMessage = (isMainWorker: boolean = true) => {
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // todo - iterate through subscribers...
    },
    [isMainWorker]
  );

  return handleMessage;
};
