import { Subscribe, useWorkerMessages } from '../../hooks/useWorkerMessages';
import { useEffect, useState } from 'react';

export const useSubscribeLogicWorker = (
  worker: Worker | MessagePort | undefined
) => {
  const subscribe = useWorkerMessages(worker);
  return subscribe;
};

export const useLogicWorker = (
  worker: Worker,
  subscribe: Subscribe
): undefined | Worker | MessagePort => {
  const [logicWorker, setLogicWorker] = useState<MessagePort>();

  useEffect(() => {
    let logicWorkerPort: MessagePort;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.command === 'connect') {
        logicWorkerPort = event.ports[0];
        setLogicWorker(logicWorkerPort);
        return;
      } else if (event.data.command === 'forward') {
        logicWorkerPort.postMessage(event.data.message);
        return;
      }
    };

    const unsubscribe = subscribe(event => {
      if (event.data.command) {
        handleMessage(event);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [worker, subscribe, setLogicWorker]);

  return logicWorker;
};
