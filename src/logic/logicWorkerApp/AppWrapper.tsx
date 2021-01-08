import React, { useContext } from 'react';
import { Context as LogicWorkerAppContext } from './index';
import { Context as PhysicsProviderContext } from '../../shared/PhysicsProvider';
import { Context as WorkerOnMessageProviderContext } from '../../shared/WorkerOnMessageProvider';
import { Context as MeshSubscriptionsContext } from '../../shared/MeshSubscriptions';

const AppWrapper: React.FC<{
  app: any;
}> = ({ app }) => {
  const App = app;
  const logicWorkerAppContext = useContext(LogicWorkerAppContext);
  const physicsProviderContext = useContext(PhysicsProviderContext);
  const workerOnMessageProviderContext = useContext(
    WorkerOnMessageProviderContext
  );
  const meshSubscriptionsContext = useContext(MeshSubscriptionsContext);
  return (
    <App
      logicWorkerAppContext={logicWorkerAppContext}
      physicsProviderContext={physicsProviderContext}
      workerOnMessageProviderContext={workerOnMessageProviderContext}
      meshSubscriptionsContext={meshSubscriptionsContext}
    />
  );
};

export default AppWrapper;
