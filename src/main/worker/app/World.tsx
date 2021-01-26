import React, {MutableRefObject, useCallback, useEffect, useRef, useState} from 'react';
import {useAppContext, useWorld} from './appContext';
import {Buffers, WorkerMessageType, WorkerOwnerMessageType,} from '../shared/types';
import {useWorldState} from './WorldState';
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
    lastPhysicsStep: 0,
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

  const update = useCallback((isMain: boolean) => {
    if (isMain) {
      sendPhysicsUpdate(worker, mainBuffers, true);
    } else if (logicWorker) {
      sendPhysicsUpdate(logicWorker, logicBuffers, false);
    }
  }, [worker, logicWorker, sendPhysicsUpdate, mainBuffers, logicBuffers]);

  const updateRef = useRef(update);

  useEffect(() => {
    updateRef.current = update;
  }, [update, updateRef]);

  return useCallback((isMain: boolean) => {
    // using ref, as i don't want to interrupt the interval
    updateRef.current(isMain);
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

  return useCallback(
    (
      isMain: boolean,
      lastProcessedPhysicsTick: number,
      positions: Float32Array,
      angles: Float32Array
    ) => {
      const buffers = isMain ? mainBuffers : logicBuffers;

      if (isMain) {
        buffers.positions = positions;
        buffers.angles = angles;
      } else {
        buffers.positions = positions;
        buffers.angles = angles;
      }
    },
    [mainBuffers, logicBuffers, tickRef, worker, logicWorker]
  );
};

const useWorldLoop = () => {
  const world = useWorld();
  const { updateRate, subscribe, logicSubscribe } = useAppContext();
  const tickRef = useRef(0);
  const [tickCount, setTickCount] = useState(0)

  const lastSentMainUpdateRef = useRef(-1)
  const lastSentLogicUpdateRef = useRef(-1)
  const [mainBufferReady, setMainBufferReady] = useState(false)
  const [logicBufferReady, setLogicBufferReady] = useState(false)
  const sendPhysicsUpdate = useSendPhysicsUpdates(tickRef);

  useEffect(() => {

    if (mainBufferReady && lastSentMainUpdateRef.current < tickCount) {
      sendPhysicsUpdate(true)
      lastSentMainUpdateRef.current = tickCount
      setMainBufferReady(false)
    }

  }, [tickCount, mainBufferReady])

  useEffect(() => {

    if (logicBufferReady && lastSentLogicUpdateRef.current < tickCount) {
      sendPhysicsUpdate(false)
      lastSentLogicUpdateRef.current = tickCount
      setLogicBufferReady(false)
    }

  }, [tickCount, logicBufferReady])

  useEffect(() => {

    const step = () => {
      world.step(updateRate);
    };

    const interval = setInterval(() => {
      tickRef.current += 1;
      setTickCount(state => state + 1)
      step();
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
      if (type === WorkerMessageType.READY_FOR_PHYSICS) {
        if (isMain) {
          setMainBufferReady(true)
        } else {
          setLogicBufferReady(true)
        }
      } else if (type === WorkerMessageType.PHYSICS_STEP_PROCESSED) {
        stepProcessed(
          isMain,
          event.data.physicsTick,
          event.data.positions,
          event.data.angles
        );
        if (isMain) {
          setMainBufferReady(true)
        } else {
          setLogicBufferReady(true)
        }
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
