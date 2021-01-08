import React from 'react';
import StoredPhysicsData from '../../shared/StoredPhysicsData';
import MeshSubscriptions from '../../shared/MeshSubscriptions';
import WorkerOnMessageProvider from '../../shared/WorkerOnMessageProvider';
import PhysicsSync from '../../shared/PhysicsSync';
import PhysicsProvider from '../../shared/PhysicsProvider';

const PhysicsHandler: React.FC<{
  worker: null | Worker | MessagePort;
}> = ({ children, worker }) => {
  if (!worker) return null;

  return (
    <PhysicsProvider worker={worker}>
      <WorkerOnMessageProvider worker={worker}>
        <StoredPhysicsData>
          <MeshSubscriptions>
            <PhysicsSync worker={worker} noLerping>
              {children}
            </PhysicsSync>
          </MeshSubscriptions>
        </StoredPhysicsData>
      </WorkerOnMessageProvider>
    </PhysicsProvider>
  );
};

export default PhysicsHandler;
