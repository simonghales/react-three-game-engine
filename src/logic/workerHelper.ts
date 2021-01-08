import { render } from 'react-nil';
import { createElement, FC } from 'react';
import { proxy } from 'valtio';
import { WorkerMessageType } from '../main/worker/shared/types';

export const logicWorkerHandler = (selfWorker: Worker, app: FC) => {
  let physicsWorkerPort: MessagePort;

  const state = proxy<{
    physicsWorkerLoaded: boolean;
    initiated: boolean;
  }>({
    physicsWorkerLoaded: false,
    initiated: false,
  });

  const workerRef: {
    physicsWorker: null | Worker | MessagePort;
  } = {
    physicsWorker: null,
  };

  selfWorker.onmessage = (event: MessageEvent) => {
    switch (event.data.command) {
      case 'connect':
        physicsWorkerPort = event.ports[0];
        workerRef.physicsWorker = physicsWorkerPort;
        state.physicsWorkerLoaded = true;
        return;

      case 'forward':
        physicsWorkerPort.postMessage(event.data.message);
        return;
    }

    const { type, props = {} } = event.data as {
      type: WorkerMessageType;
      props: any;
    };

    switch (type) {
      case WorkerMessageType.INIT:
        state.initiated = true;
        break;
    }
  };
  render(
    createElement(
      require('./logicWorkerApp/index').WorkerApp,
      {
        worker: selfWorker,
        state,
        workerRef,
      },
      createElement(app, null, null)
    )
  );
};
