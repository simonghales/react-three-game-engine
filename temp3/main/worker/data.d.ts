import { Buffers } from './shared/types';
export declare const storedData: {
    physicsTick: number;
    unsyncedBodies: boolean;
    unsyncedLogicBodies: boolean;
    maxNumberOfPhysicsObjects: number;
    buffers: Buffers;
    logicBuffers: Buffers;
    mainWorker: null | Worker;
    logicWorker: null | MessagePort;
};
