import React from 'react';
import {
  Context as LogicWorkerAppContext,
  ContextState as LogicWorkerAppContextState,
} from './logicWorkerApp';
import {
  Context as PhysicsProviderContext,
  ContextState as PhysicsProviderContextState,
} from '../shared/PhysicsProvider';
import {
  Context as WorkerOnMessageProviderContext,
  ContextState as WorkerOnMessageProviderContextState,
} from '../shared/WorkerOnMessageProvider';
import {
  Context as MeshSubscriptionsContext,
  ContextState as MeshSubscriptionsContextState,
} from '../shared/MeshSubscriptions';

const ApiWrapper: React.FC<{
  logicWorkerAppContext: LogicWorkerAppContextState;
  physicsProviderContext: PhysicsProviderContextState;
  workerOnMessageProviderContext: WorkerOnMessageProviderContextState;
  meshSubscriptionsContext: MeshSubscriptionsContextState;
}> = ({
  children,
  logicWorkerAppContext,
  physicsProviderContext,
  workerOnMessageProviderContext,
  meshSubscriptionsContext,
}) => {
  return (
    <LogicWorkerAppContext.Provider value={logicWorkerAppContext}>
      <PhysicsProviderContext.Provider value={physicsProviderContext}>
        <WorkerOnMessageProviderContext.Provider
          value={workerOnMessageProviderContext}
        >
          <MeshSubscriptionsContext.Provider value={meshSubscriptionsContext}>
            {children}
          </MeshSubscriptionsContext.Provider>
        </WorkerOnMessageProviderContext.Provider>
      </PhysicsProviderContext.Provider>
    </LogicWorkerAppContext.Provider>
  );
};

export default ApiWrapper;

export const withLogicWrapper = (WrappedComponent: any) => {
  return (props: any) => {
    return (
      <ApiWrapper {...props}>
        <WrappedComponent />
      </ApiWrapper>
    );
  };
};
