import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Object3D } from 'three';
import { ValidUUID } from '../main/worker/shared/types';
import { getPositionAndAngle } from './utils';
import { useStoredData } from './StoredPhysicsData';
import { lerp } from '../utils/numbers';
import {getNow} from "../utils/time";
import {PHYSICS_UPDATE_RATE} from "../main/worker/planckjs/config";

export type ContextState = {
  lerpMeshes: (
    getPhysicsStepTimeRemainingRatio: (time: number) => number
  ) => void;
  updateMeshes: (
    positions: Float32Array,
    angles: Float32Array,
    immediate: boolean
  ) => void;
  addSubscription: (
    uuid: ValidUUID,
    object: Object3D,
    applyAngle: boolean
  ) => () => void;
};

export const Context = createContext((null as unknown) as ContextState);

export const useLerpMeshes = () => {
  return useContext(Context).lerpMeshes;
};

export const useAddMeshSubscription = () => {
  return useContext(Context).addSubscription;
};

export const useSubscribeMesh = (
  uuid: ValidUUID,
  object: Object3D,
  applyAngle: boolean = true,
  isDynamic: boolean = true
) => {
  const addSubscription = useContext(Context).addSubscription;

  useEffect(() => {
    if (!isDynamic) return;

    const unsubscribe = addSubscription(uuid, object, applyAngle);

    return () => {
      unsubscribe();
    };
  }, [uuid, object, applyAngle, isDynamic, addSubscription]);
};

export const useUpdateMeshes = () => {
  return useContext(Context).updateMeshes;
};

type Subscriptions = {
    [uuid: string]: {
        uuid: ValidUUID,
        object: Object3D,
        applyAngle: boolean,
        lastUpdate?: number,
        lastRender?: number,
        previous?: {
            position: [number, number],
            angle: number,
        },
        target?: {
            position: [number, number],
            angle: number,
        },
    }
}

const MeshSubscriptions: React.FC = ({ children }) => {
  const subscriptionsRef = useRef<Subscriptions>({});

  const lerpMeshes = useCallback(
    (getPhysicsStepTimeRemainingRatio: (time: number) => number) => {
      Object.values(subscriptionsRef.current).forEach(
        ({ uuid,
             object,
             target,
             previous,
             applyAngle,
             lastUpdate , lastRender}) => {
          if (!target || !previous) {
              return;
          }
          const { position, angle } = target;
          const {position: previousPosition, angle: previousAngle} = previous
          lastUpdate = lastUpdate || getNow()

            // lastUpdate = 10
            // nextUpdate = 20
            // currentUpdate = 15
            // min = 10
            // max = 20

            const nextExpectedUpdate = lastUpdate + PHYSICS_UPDATE_RATE + 2

            const min = lastUpdate
            const max = nextExpectedUpdate
            const now = getNow()

            const timeSinceLastRender = now - (lastRender || now)

            const timeUntilNextUpdate = nextExpectedUpdate - now

            // console.log('timeUntilNextUpdate', timeUntilNextUpdate)

            let normalised = ((now - min) / (max - min))

            normalised = normalised < 0 ? 0 : normalised > 1 ? 1 : normalised

          const physicsRemainingRatio = normalised

          object.position.x = lerp(
            previousPosition[0],
            position[0],
            physicsRemainingRatio
          );
          object.position.y = lerp(
            previousPosition[1],
            position[1],
            physicsRemainingRatio
          );
          if (applyAngle) {
            object.rotation.z = angle; // todo - lerp
          }

            subscriptionsRef.current[uuid as string].lastRender = getNow()

        }
      );
    },
    [subscriptionsRef]
  );

  const storedData = useStoredData();

  const updateMeshes = useCallback(
    (positions: Float32Array, angles: Float32Array, immediate: boolean) => {
      Object.entries(subscriptionsRef.current).forEach(
        ([uuid, { object, target, previous, applyAngle }]) => {
          const index = storedData.bodies[uuid];
          const update = getPositionAndAngle({ positions, angles }, index);
          if (update) {
            if (immediate) {
              object.position.x = update.position[0];
              object.position.y = update.position[1];
              if (applyAngle) {
                object.rotation.x = update.angle;
              }
            }
            const previousTarget = subscriptionsRef.current[uuid].target
            if (!previousTarget) {
                subscriptionsRef.current[uuid].previous = {
                  position: [object.position.x, object.position.y],
                  angle: object.rotation.x,
                };
            } else {
                subscriptionsRef.current[uuid].previous = {
                    position: previousTarget.position,
                    angle: previousTarget.angle,
                };
            }
            subscriptionsRef.current[uuid].target = {
              position: update.position,
              angle: update.angle,
            };
            subscriptionsRef.current[uuid as string].lastUpdate = getNow()
          }
        }
      );
    },
    [subscriptionsRef, storedData]
  );

  const addSubscription = useCallback(
    (uuid: ValidUUID, object: Object3D, applyAngle: boolean) => {
      subscriptionsRef.current[uuid as string] = {
        uuid,
        object,
        applyAngle,
      };

      const unsubscribe = () => {
        delete subscriptionsRef.current[uuid as string];
      };

      return unsubscribe;
    },
    [subscriptionsRef]
  );

  return (
    <Context.Provider
      value={{
        lerpMeshes,
        updateMeshes,
        addSubscription,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default MeshSubscriptions;
