import React, { FC } from 'react';
import PhysicsWorker from './PhysicsWorker';
import R3FPhysicsObjectUpdater from './R3FPhysicsObjectUpdater';
import { LogicWorker } from '../index';
import CollisionsProvider from '../shared/CollisionsProvider';

export const Physics: FC<{
  maxNumberOfPhysicsObjects?: number;
  logicWorker?: Worker;
}> = ({ children, maxNumberOfPhysicsObjects = 100, logicWorker }) => {
  if (logicWorker) {
    return (
      <PhysicsWorker maxNumberOfPhysicsObjects={maxNumberOfPhysicsObjects}>
        <CollisionsProvider>
          <R3FPhysicsObjectUpdater>
            <LogicWorker worker={logicWorker}>{children}</LogicWorker>
          </R3FPhysicsObjectUpdater>
        </CollisionsProvider>
      </PhysicsWorker>
    );
  }

  return (
    <PhysicsWorker maxNumberOfPhysicsObjects={maxNumberOfPhysicsObjects}>
      <CollisionsProvider>
        <R3FPhysicsObjectUpdater>{children}</R3FPhysicsObjectUpdater>
      </CollisionsProvider>
    </PhysicsWorker>
  );
};
