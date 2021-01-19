import { createContext, MutableRefObject, useContext } from 'react';
import { World } from 'planck-js';
import { Subscribe } from '../../hooks/useWorkerMessages';
import { Buffers } from '../shared/types';

export type AppContextState = {
  updateRate: number;
  world: World;
  worker: Worker;
  logicWorker?: Worker | MessagePort;
  subscribe: Subscribe;
  logicSubscribe: Subscribe;
  buffers: Buffers;
  buffersSecondary: Buffers;
  logicBuffers: Buffers;
  logicBuffersSecondary: Buffers;
  buffersRef: MutableRefObject<{
    mainCount: number;
    logicCount: number;
  }>;
  maxNumberOfDynamicObjects: number;
};

export const AppContext = createContext((null as unknown) as AppContextState);

export const useWorld = (): World => {
  return useContext(AppContext).world;
};

export const useAppContext = (): AppContextState => {
  return useContext(AppContext);
};
