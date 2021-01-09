import React, { FC } from 'react';
import PhysicsWorker from './PhysicsWorker';
import R3FPhysicsObjectUpdater from './R3FPhysicsObjectUpdater';
import { LogicWorker } from '../index';
import CollisionsProvider from '../shared/CollisionsProvider';
import { MappedComponents } from '../shared/types';
import MeshRefs from "./MeshRefs";

export const Engine: FC<{
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
      <MeshRefs>
        <PhysicsWorker maxNumberOfPhysicsObjects={maxNumberOfPhysicsObjects}>
          <CollisionsProvider>
            <R3FPhysicsObjectUpdater>
              <LogicWorker
                worker={logicWorker}
                logicMappedComponents={logicMappedComponents}
              >
                  {children}
              </LogicWorker>
            </R3FPhysicsObjectUpdater>
          </CollisionsProvider>
        </PhysicsWorker>
      </MeshRefs>
    );
  }

  return (
    <MeshRefs>
      <PhysicsWorker maxNumberOfPhysicsObjects={maxNumberOfPhysicsObjects}>
        <CollisionsProvider>
          <R3FPhysicsObjectUpdater>
              {children}
          </R3FPhysicsObjectUpdater>
        </CollisionsProvider>
      </PhysicsWorker>
    </MeshRefs>
  );
};
