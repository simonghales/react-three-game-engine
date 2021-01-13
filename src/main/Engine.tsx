import React, { FC } from 'react';
import PhysicsWorker from './PhysicsWorker';
import R3FPhysicsObjectUpdater from './R3FPhysicsObjectUpdater';
import CollisionsProvider from '../shared/CollisionsProvider';
import { MappedComponents } from '../shared/types';
import MeshRefs from "./MeshRefs";
import {PhysicsProps} from "./worker/shared/types";
import {LogicWorker} from "./LogicWorker";

export const Engine: FC<PhysicsProps & {
  logicWorker?: Worker;
  logicMappedComponents?: MappedComponents;
}> = ({
  children,
  config,
  worldParams,
  logicWorker,
  logicMappedComponents = {},
}) => {
  if (logicWorker) {
    return (
      <MeshRefs>
        <PhysicsWorker config={config} worldParams={worldParams}>
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
      <PhysicsWorker config={config} worldParams={worldParams}>
        <CollisionsProvider>
          <R3FPhysicsObjectUpdater>
              {children}
          </R3FPhysicsObjectUpdater>
        </CollisionsProvider>
      </PhysicsWorker>
    </MeshRefs>
  );
};
