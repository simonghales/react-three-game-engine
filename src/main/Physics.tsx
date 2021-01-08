import React, { FC } from 'react';
import PhysicsWorker from './PhysicsWorker';
import R3FPhysicsObjectUpdater from './R3FPhysicsObjectUpdater';
import { LogicWorker } from '../index';
import CollisionsProvider from '../shared/CollisionsProvider';
import { MappedComponents } from '../shared/types';
import MeshRefs from "./MeshRefs";

export const Physics: FC<{
  maxNumberOfPhysicsObjects?: number;
  logicWorker?: Worker;
  logicMappedComponents?: MappedComponents;
}> = ({
  children,
  maxNumberOfPhysicsObjects = 100,
  logicWorker,
  logicMappedComponents = {},
}) => {
  if (logicWorker) {
    return (
      <PhysicsWorker maxNumberOfPhysicsObjects={maxNumberOfPhysicsObjects}>
        <CollisionsProvider>
          <R3FPhysicsObjectUpdater>
            <LogicWorker
              worker={logicWorker}
              logicMappedComponents={logicMappedComponents}
            >
              <MeshRefs>
                {children}
              </MeshRefs>
            </LogicWorker>
          </R3FPhysicsObjectUpdater>
        </CollisionsProvider>
      </PhysicsWorker>
    );
  }

  return (
    <PhysicsWorker maxNumberOfPhysicsObjects={maxNumberOfPhysicsObjects}>
      <CollisionsProvider>
        <R3FPhysicsObjectUpdater>
          <MeshRefs>
            {children}
          </MeshRefs>
        </R3FPhysicsObjectUpdater>
      </CollisionsProvider>
    </PhysicsWorker>
  );
};
