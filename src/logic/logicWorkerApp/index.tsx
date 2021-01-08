import React, { useCallback, useState } from 'react';
import { FC, useEffect } from 'react';
import { useProxy } from 'valtio';
import { MessageData } from '../../shared/types';
import { WorkerOwnerMessageType } from '../../main/worker/shared/types';

const WorkerApp: FC<{
  worker: Worker;
  workerRef: {
    physicsWorker: null | Worker | MessagePort;
  };
  state: {
    physicsWorkerLoaded: boolean;
    initiated: boolean;
  };
  app: any;
}> = ({ app, worker, state, workerRef }) => {
  const proxyState = useProxy(state);
  const initiated = proxyState.initiated;
  const physicsWorkerLoaded = proxyState.physicsWorkerLoaded;
  const [physicsWorker, setPhysicsWorker] = useState<
    null | Worker | MessagePort
  >(null);

  useEffect(() => {
    if (physicsWorkerLoaded) {
      if (!workerRef.physicsWorker) {
        throw new Error(`Worker missing.`);
      }
      setPhysicsWorker(workerRef.physicsWorker);
    }
  }, [physicsWorkerLoaded]);

  const sendMessageToMain = useCallback(
    (message: MessageData) => {
      const update = {
        type: WorkerOwnerMessageType.MESSAGE,
        message,
      };

      worker.postMessage(update);
    },
    [worker]
  );

  if (!initiated || !physicsWorker) return null;

  const App = app

  return (
      <App physicsWorker={physicsWorker} sendMessageToMain={sendMessageToMain}/>
  )

};

export { WorkerApp };
