import React from 'react';
import StoredPhysicsData from '../../shared/StoredPhysicsData';
import MeshSubscriptions from '../../shared/MeshSubscriptions';
import WorkerOnMessageProvider from '../../shared/WorkerOnMessageProvider';
import PhysicsSync from '../../shared/PhysicsSync';
import PhysicsProvider from '../../shared/PhysicsProvider';
import {useWorkerMessages} from "../../main/hooks/useWorkerMessages";

const PhysicsHandler: React.FC<{
  worker: null | Worker | MessagePort;
}> = ({ children, worker }) => {
  if (!worker) return null;

  const subscribe = useWorkerMessages(worker)

  return (
    <PhysicsProvider worker={worker}>
      <WorkerOnMessageProvider subscribe={subscribe}>
        <StoredPhysicsData>
          <MeshSubscriptions>
            <PhysicsSync worker={worker} physicsUpdateRate={0} noLerping>
              {children}
            </PhysicsSync>
          </MeshSubscriptions>
        </StoredPhysicsData>
      </WorkerOnMessageProvider>
    </PhysicsProvider>
  );
};

export default PhysicsHandler;
