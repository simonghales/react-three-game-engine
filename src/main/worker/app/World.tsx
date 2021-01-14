import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react';
import { useAppContext, useWorld } from './appContext';
import {
  Buffers,
  WorkerMessageType,
  WorkerOwnerMessageType,
} from '../shared/types';
import { useWorldState } from './WorldState';
import {generateBuffers} from "./buffers";

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
};

const useSendPhysicsUpdate = (tickRef: MutableRefObject<number>) => {

  const localStateRef = useRef({
    failedMainCount: 0,
    failedLogicCount: 0,
  })

  const {
    bodiesNeedSyncRef,
    logicBodiesNeedSyncRef,
    dynamicBodies,
  } = useWorldState();

  const {
    buffers: mainBuffers,
    logicBuffers,
    worker,
    logicWorker,
    maxNumberOfDynamicObjects,
  } = useAppContext();

  const syncData = useSyncData();

  return useCallback(
    (target: Worker | MessagePort, buffer: Buffers, isMain: boolean) => {
      const { positions, angles } = buffer;
      if (!(positions.byteLength !== 0 && angles.byteLength !== 0)) {
        console.warn('cant send physics update to', isMain ? 'main' : 'logic')
        if (isMain) {
          if (localStateRef.current.failedMainCount >= 2) {
            const { positions: newPositions, angles: newAngles } = generateBuffers(maxNumberOfDynamicObjects);
            mainBuffers.positions = newPositions
            mainBuffers.angles = newAngles
          }
        } else {
          if (localStateRef.current.failedLogicCount >= 2) {
            const {positions: newPositions, angles: newAngles} = generateBuffers(maxNumberOfDynamicObjects);
            logicBuffers.positions = newPositions
            logicBuffers.angles = newAngles
          }
        }
        if (isMain) {
          localStateRef.current.failedMainCount += 1
        } else {
          localStateRef.current.failedLogicCount += 1
        }
        return;
      }
      if (isMain) {
        localStateRef.current.failedMainCount = 0
      } else {
        localStateRef.current.failedLogicCount = 0
      }
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
    buffersRef,
  } = useAppContext();

  const sendPhysicsUpdate = useSendPhysicsUpdate(tickRef);

  return useCallback(
    (
      isMain: boolean,
      lastProcessedPhysicsTick: number,
      positions: Float32Array,
      angles: Float32Array
    ) => {
      const buffers = isMain ? mainBuffers : logicBuffers;

      if (isMain) {
        if (lastProcessedPhysicsTick >= buffersRef.current.mainCount) {
          buffers.positions = positions;
          buffers.angles = angles;
        }
      } else {
        if (lastProcessedPhysicsTick >= buffersRef.current.logicCount) {
          buffers.positions = positions;
          buffers.angles = angles;
        }
      }

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
