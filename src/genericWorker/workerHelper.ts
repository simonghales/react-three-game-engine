import { render } from 'react-nil';
import { createElement, FC } from 'react';

export const workerHandler = (selfWorker: Worker, app: FC) => {
  render(
    createElement(
      require('./workerApp/index').WorkerApp,
      {
        worker: selfWorker,
        app,
      },
      null
    )
  );
};
