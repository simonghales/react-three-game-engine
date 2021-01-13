import { FC } from 'react';
declare const WorkerApp: FC<{
    worker: Worker;
    workerRef: {
        physicsWorker: null | Worker | MessagePort;
    };
    state: {
        physicsWorkerLoaded: boolean;
        initiated: boolean;
    };
    app: any;
}>;
export { WorkerApp };
