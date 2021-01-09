import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react';
import { WorkerMessageType } from './worker/shared/types';
import WorkerOnMessageProvider from '../shared/WorkerOnMessageProvider';
import PhysicsSync from '../shared/PhysicsSync';
import StoredPhysicsData from '../shared/StoredPhysicsData';
import MeshSubscriptions from '../shared/MeshSubscriptions';
import PhysicsProvider from '../shared/PhysicsProvider';

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

  useEffect(() => {
    worker.postMessage({
      type: WorkerMessageType.INIT,
      props: {
        maxNumberOfPhysicsObjects: maxNumberOfPhysicsObjects,
      },
    });
  }, [worker]);

  return (
    <Context.Provider
      value={{
        worker,
      }}
    >
      <PhysicsProvider worker={worker}>
        <StoredPhysicsData>
          <MeshSubscriptions>
            <WorkerOnMessageProvider worker={worker}>
              <PhysicsSync worker={worker}>{children}</PhysicsSync>
            </WorkerOnMessageProvider>
          </MeshSubscriptions>
        </StoredPhysicsData>
      </PhysicsProvider>
    </Context.Provider>
  );
};

export default PhysicsWorker;
