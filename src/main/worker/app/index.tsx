import React, { useEffect, useRef, useState } from 'react';
import { Vec2, World, WorldDef } from 'planck-js';
import { AppContext } from './appContext';
import { useWorkerMessages } from '../../hooks/useWorkerMessages';
import { Bodies } from './Bodies';
import { World as WorldComponent } from './World';
import { useSubscribeLogicWorker, useLogicWorker } from './logicWorker';
import { WorldState } from './WorldState';
import { Collisions } from './Collisions';
import { WorkerOwnerMessageType } from '../shared/types';
import { useBuffers } from './buffers';

export const App: React.FC<{
  config: {
    maxNumberOfDynamicObjects: number;
    updateRate: number;
  };
  worldParams: WorldDef;
  worker: Worker;
}> = ({ worldParams, worker, config }) => {
  const { updateRate, maxNumberOfDynamicObjects } = config;

  const defaultParams = {
    allowSleep: true,
    gravity: Vec2(0, 0),
    ...worldParams,
  };

  const [world] = useState(() => World(defaultParams));

  const subscribe = useWorkerMessages(worker);

  const logicWorker = useLogicWorker(worker, subscribe);

  const logicSubscribe = useSubscribeLogicWorker(logicWorker);

  const buffers = useBuffers(maxNumberOfDynamicObjects);
  const logicBuffers = useBuffers(!logicWorker ? 0 : maxNumberOfDynamicObjects);

  const buffersRef = useRef({
    mainCount: 0,
    logicCount: 0,
  });

  useEffect(() => {
    worker.postMessage({
      type: WorkerOwnerMessageType.INITIATED,
    });
  }, [worker]);

  return (
    <AppContext.Provider
      value={{
        world,
        updateRate,
        worker,
        logicWorker,
        subscribe,
        logicSubscribe,
        buffers,
        logicBuffers,
        buffersRef,
        maxNumberOfDynamicObjects,
      }}
    >
      <WorldState>
        <WorldComponent />
        <Bodies />
        <Collisions />
      </WorldState>
    </AppContext.Provider>
  );
};
