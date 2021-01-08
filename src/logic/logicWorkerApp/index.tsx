import React, { createContext, useCallback, useContext, useState } from 'react';
import { FC, useEffect } from 'react';
import { useProxy } from 'valtio';
import { MessageData } from '../../shared/types';
import { WorkerOwnerMessageType } from '../../main/worker/shared/types';
import CollisionsProvider from '../../shared/CollisionsProvider';
import PhysicsHandler from './PhysicsHandler';
import AppWrapper from './AppWrapper';

export type ContextState = {
  initiated: boolean;
  physicsWorker: null | Worker | MessagePort;
  sendMessageToMain: (message: MessageData) => void;
};

export const Context = createContext((null as unknown) as ContextState);

export const useWorkerAppContext = (): ContextState => {
  return useContext(Context);
};

export const useSendMessageToMain = () => {
  return useWorkerAppContext().sendMessageToMain;
};

const Test: FC = () => {
  const context = useWorkerAppContext();
  console.log('context?', context);
  return null;
};

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
}> = ({ app, children, worker, state, workerRef }) => {
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

  if (!initiated) return null;

  return (
    <Context.Provider value={{ initiated, physicsWorker, sendMessageToMain }}>
      <PhysicsHandler worker={physicsWorker}>
        <CollisionsProvider>
          <AppWrapper app={app} />
        </CollisionsProvider>
      </PhysicsHandler>
      <Test />
    </Context.Provider>
  );
};

export { WorkerApp };
