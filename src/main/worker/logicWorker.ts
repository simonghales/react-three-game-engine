import { storedData } from './data';
import { WorkerMessageType } from './shared/types';
import { generateBuffers } from './utils';
import { stepProcessed } from './shared';
import { addBody, removeBody, setBody, updateBody } from './planckjs/bodies';

let logicWorkerPort: MessagePort;

const onMessageFromLogicWorker = (event: MessageEvent) => {
  const { type, props = {} } = event.data as {
    type: WorkerMessageType;
    props: any;
  };
  switch (type) {
    case WorkerMessageType.PHYSICS_STEP_PROCESSED:
      stepProcessed(
        false,
        event.data.physicsTick,
        event.data.positions,
        event.data.angles
      );
      break;
    case WorkerMessageType.ADD_BODY:
      addBody(props);
      break;
    case WorkerMessageType.REMOVE_BODY:
      removeBody(props);
      break;
    case WorkerMessageType.SET_BODY:
      setBody(props);
      break;
    case WorkerMessageType.UPDATE_BODY:
      updateBody(props);
      break;
  }
};

export const handleLogicWorkerMessage = (event: MessageEvent) => {
  if (event.data.command === 'connect') {
    logicWorkerPort = event.ports[0];
    storedData.logicBuffers = generateBuffers(
      storedData.maxNumberOfPhysicsObjects
    );
    storedData.logicWorker = logicWorkerPort;
    logicWorkerPort.onmessage = onMessageFromLogicWorker;
    return;
  } else if (event.data.command === 'forward') {
    logicWorkerPort.postMessage(event.data.message);
    return;
  }
};
