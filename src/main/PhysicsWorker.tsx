import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react';
import {WorkerMessageType, WorkerOwnerMessageType} from './worker/shared/types';
import WorkerOnMessageProvider from '../shared/WorkerOnMessageProvider';
import PhysicsSync from '../shared/PhysicsSync';
import StoredPhysicsData from '../shared/StoredPhysicsData';
import MeshSubscriptions from '../shared/MeshSubscriptions';
import PhysicsProvider from '../shared/PhysicsProvider';
import {useWorkerMessages} from "./hooks/useWorkerMessages";

type ContextState = {
  worker: Worker;
};

const Context = createContext((null as unknown) as ContextState);

export const usePhysicsWorker = () => {
  return useContext(Context).worker;
};

const PhysicsWorker: FC<{
  maxNumberOfPhysicsObjects: number;
}> = ({ children, maxNumberOfPhysicsObjects }) => {
  // @ts-ignore
  const [worker] = useState<Worker>(
    () => new Worker('./worker/index.js', { type: 'module' })
  );
  const [initiated, setInitiated] = useState(false)

  useEffect(() => {
    worker.postMessage({
      type: WorkerMessageType.INIT,
      props: {
        maxNumberOfPhysicsObjects: maxNumberOfPhysicsObjects,
      },
    });
  }, [worker]);

  const subscribe = useWorkerMessages(worker)

  useEffect(() => {

    const unsubscribe = subscribe((event) => {

      const type = event.data.type;

      if (type === WorkerOwnerMessageType.INITIATED) {
        setInitiated(true)
      }

      return () => {
        unsubscribe()
      }
    })

  }, [subscribe, setInitiated])

  if (!initiated) return null

  return (
    <Context.Provider
      value={{
        worker,
      }}
    >
      <PhysicsProvider worker={worker}>
        <StoredPhysicsData>
          <MeshSubscriptions>
            <WorkerOnMessageProvider subscribe={subscribe}>
              <PhysicsSync worker={worker}>{children}</PhysicsSync>
            </WorkerOnMessageProvider>
          </MeshSubscriptions>
        </StoredPhysicsData>
      </PhysicsProvider>
    </Context.Provider>
  );
};

export default PhysicsWorker;
