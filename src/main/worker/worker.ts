import { WorkerMessageType } from './shared/types';
import { handleLogicWorkerMessage } from './logicWorker';
import { init } from './methods';
import { storedData } from './data';
import { stepProcessed } from './shared';
import { addBody, removeBody, setBody, updateBody } from './planckjs/bodies';

const selfWorker = (self as unknown) as Worker;

let initiated = false

storedData.mainWorker = selfWorker;

selfWorker.onmessage = (event: MessageEvent) => {
  if (event.data.command) {
    handleLogicWorkerMessage(event);
    return;
  }

  const { type, props = {} } = event.data as {
    type: WorkerMessageType;
    props: any;
  };
  switch (type) {
    case WorkerMessageType.PHYSICS_STEP_PROCESSED:
      if (!initiated) return
      stepProcessed(
        true,
        event.data.physicsTick,
        event.data.positions,
        event.data.angles
      );
      break;
    case WorkerMessageType.INIT:
      initiated = true;
      init(props);
      break;
    case WorkerMessageType.ADD_BODY:
      if (!initiated) return
      addBody(props);
      break;
    case WorkerMessageType.REMOVE_BODY:
      if (!initiated) return
      removeBody(props);
      break;
    case WorkerMessageType.SET_BODY:
      if (!initiated) return
      setBody(props);
      break;
    case WorkerMessageType.UPDATE_BODY:
      if (!initiated) return
      updateBody(props);
      break;
  }
};
