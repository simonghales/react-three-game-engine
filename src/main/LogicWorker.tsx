import React, { useEffect } from 'react';
import { usePhysicsWorker } from './PhysicsWorker';
import {
  WorkerMessageType,
  WorkerOwnerMessageType,
} from './worker/shared/types';
import { MappedComponents, MessageData } from '../shared/types';
import Messages, { useMessagesContext } from './Messages';
import LogicHandler from './LogicHandler';

const LogicWorker: React.FC<{
  worker: Worker;
}> = ({ children, worker }) => {
  const physicsWorker = usePhysicsWorker();

  const { handleMessage } = useMessagesContext();

  useEffect(() => {
    const channel = new MessageChannel();
    physicsWorker.postMessage({ command: 'connect' }, [channel.port1]);
    worker.postMessage({ command: 'connect' }, [channel.port2]);

    worker.onmessage = (event: MessageEvent) => {
      const type = event.data.type;

      switch (type) {
        case WorkerOwnerMessageType.MESSAGE:
          handleMessage(event.data.message as MessageData);
          break;
      }
    };

    worker.postMessage({
      type: WorkerMessageType.INIT,
    });
  }, [worker, physicsWorker]);

  return <>{children}</>;
};

const LogicWorkerWrapper: React.FC<{
  worker: Worker;
  logicMappedComponents: MappedComponents;
}> = ({ worker, children, logicMappedComponents }) => {
  return (
    <Messages>
      <LogicWorker worker={worker}>
        <LogicHandler mappedComponentTypes={logicMappedComponents}>
          {children}
        </LogicHandler>
      </LogicWorker>
    </Messages>
  );
};

export default LogicWorkerWrapper;
