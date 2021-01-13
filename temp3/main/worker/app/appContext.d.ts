/// <reference types="react" />
import { World } from 'planck-js';
import { Subscribe } from '../../hooks/useWorkerMessages';
import { Buffers } from '../shared/types';
export declare type AppContextState = {
    updateRate: number;
    world: World;
    worker: Worker;
    logicWorker?: Worker | MessagePort;
    subscribe: Subscribe;
    logicSubscribe: Subscribe;
    buffers: Buffers;
    logicBuffers: Buffers;
};
export declare const AppContext: import("react").Context<AppContextState>;
export declare const useWorld: () => World;
export declare const useAppContext: () => AppContextState;
