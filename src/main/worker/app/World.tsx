import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useAppContext, useWorld } from './appContext';
import {
  Buffers,
  WorkerMessageType,
  WorkerOwnerMessageType,
} from '../shared/types';
import { useWorldState } from './WorldState';

const useSyncData = () => {
  const { dynamicBodies, bodies } = useWorldState();
  return useCallback((positions: Float32Array, angles: Float32Array) => {
    const dynamicBodiesArray = Array.from(dynamicBodies);

    dynamicBodiesArray.forEach((uuid, index) => {
      const body = bodies.get(uuid);
      if (!body) return;
      const position = body.getPosition();
      const angle = body.getAngle();
      positions[2 * index + 0] = position.x;
      positions[2 * index + 1] = position.y;
      angles[index] = angle;
    });
  }, []);
};

const debug = {
  mainSent: false,
  mainLogged: false,
  mainLogged2: false,
  logicSent: false,
  logicLogged: false,
  logicLogged2: false,
}


const useSendPhysicsUpdate = (tickRef: MutableRefObject<number>) => {
  const {
    bodiesNeedSyncRef,
    logicBodiesNeedSyncRef,
    dynamicBodies,
  } = useWorldState();

  const syncData = useSyncData();

  return useCallback(
    (target: Worker | MessagePort, buffer: Buffers, isMain: boolean) => {
      const { positions, angles } = buffer;
      if (!(positions.byteLength !== 0 && angles.byteLength !== 0)) {
        if (isMain) {
          if (debug.mainLogged) return
          console.log('cant send update to main', debug.mainSent)
          debug.mainLogged = true
        } else {
          if (debug.logicLogged) return
          console.log('cant send update to logic', debug.logicSent)
          debug.logicLogged = true
        }
        return;
      }
      if (isMain) {
        if (!debug.mainLogged2) {
          console.log('sending to main')
          debug.mainLogged2 = true
        }
        debug.mainSent = true
      } else {
        if (!debug.logicLogged2) {
          console.log('sending to logic')
          debug.logicLogged2 = true
        }
        debug.logicSent = true
      }
      console.log(`sending to:`, isMain)
      syncData(positions, angles);
      const rawMessage: any = {
        type: WorkerOwnerMessageType.PHYSICS_STEP,
        physicsTick: tickRef.current,
      };
      if (isMain) {
        rawMessage.bodies = Array.from(dynamicBodies);
        bodiesNeedSyncRef.current = false;
      } else {
        rawMessage.bodies = Array.from(dynamicBodies);
        logicBodiesNeedSyncRef.current = false;
      }
      const message = {
        ...rawMessage,
        positions,
        angles,
      };
      target.postMessage(message, [positions.buffer, angles.buffer]);
    },
    [bodiesNeedSyncRef, logicBodiesNeedSyncRef, tickRef, syncData]
  );
};

const useSendPhysicsUpdates = (tickRef: MutableRefObject<number>) => {
  const {
    buffers: mainBuffers,
    logicBuffers,
    worker,
    logicWorker,
  } = useAppContext();

  const sendPhysicsUpdate = useSendPhysicsUpdate(tickRef);

  const update = useCallback(() => {
    sendPhysicsUpdate(worker, mainBuffers, true);

    if (logicWorker) {
      sendPhysicsUpdate(logicWorker, logicBuffers, false);
    }
  }, [worker, logicWorker, sendPhysicsUpdate, mainBuffers, logicBuffers]);

  const updateRef = useRef(update);

  useEffect(() => {
    updateRef.current = update;
  }, [update, updateRef]);

  return useCallback(() => {
    // using ref, as i don't want to interrupt the interval
    updateRef.current();
  }, [updateRef]);
};

const useStepProcessed = (tickRef: MutableRefObject<number>) => {
  const {
    buffers: mainBuffers,
    logicBuffers,
    worker,
    logicWorker,
  } = useAppContext();

  const sendPhysicsUpdate = useSendPhysicsUpdate(tickRef);

  return useCallback(
    (
      isMain: boolean,
      lastProcessedPhysicsTick: number,
      positions: Float32Array,
      angles: Float32Array
    ) => {

      console.log('step processed')

      const buffers = isMain ? mainBuffers : logicBuffers;

      buffers.positions = positions;
      buffers.angles = angles;
      if (lastProcessedPhysicsTick < tickRef.current) {
        if (isMain) {
          sendPhysicsUpdate(worker, buffers, true);
        } else if (logicWorker) {
          sendPhysicsUpdate(logicWorker, buffers, false);
        }
      }
    },
    [mainBuffers, logicBuffers, tickRef, worker, logicWorker, sendPhysicsUpdate]
  );
};

const useWorldLoop = () => {
  const world = useWorld();
  const { updateRate, subscribe, logicSubscribe } = useAppContext();
  const tickRef = useRef(0);

  const sendPhysicsUpdate = useSendPhysicsUpdates(tickRef);

  useEffect(() => {
    const step = () => {
      world.step(updateRate);
    };

    const interval = setInterval(() => {
      tickRef.current += 1;
      step();
      sendPhysicsUpdate();
    }, updateRate);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const stepProcessed = useStepProcessed(tickRef);

  useEffect(() => {
    const onMessage = (event: MessageEvent, isMain: boolean = true) => {
      const { type, props = {} } = event.data as {
        type: WorkerMessageType;
        props: any;
      };
      if (type === WorkerMessageType.PHYSICS_STEP_PROCESSED) {
        stepProcessed(
          isMain,
          event.data.physicsTick,
          event.data.positions,
          event.data.angles
        );
      }
    };

    const unsubscribe = subscribe(onMessage);

    const unsubscribeLogic = logicSubscribe(event => onMessage(event, false));

    return () => {
      unsubscribe();
      unsubscribeLogic();
    };
  }, [subscribe, logicSubscribe, stepProcessed]);
};

export const World: React.FC = () => {
  useWorldLoop();
  return null;
};
