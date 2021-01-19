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

const MeshSubscriptions: React.FC = ({ children }) => {
  const subscriptionsRef = useRef<{
    [uuid: string]: {
      uuid: ValidUUID;
      object: Object3D;
      applyAngle: boolean;
      lastUpdate?: number;
      target?: {
        position: [number, number];
        angle: number;
      };
    };
  }>({});

  const lerpMeshes = useCallback(
    (getPhysicsStepTimeRemainingRatio: (time: number) => number) => {
      Object.values(subscriptionsRef.current).forEach(
        ({ uuid, object, target, applyAngle, lastUpdate }) => {
          if (!target) return;
          const { position, angle } = target;
          let physicsRemainingRatio = getPhysicsStepTimeRemainingRatio(
            lastUpdate ?? Date.now()
          );
          object.position.x = lerp(
            object.position.x,
            position[0],
            physicsRemainingRatio
          );
          object.position.y = lerp(
            object.position.y,
            position[1],
            physicsRemainingRatio
          );
          if (applyAngle) {
            object.rotation.z = angle; // todo - lerp
          }
          subscriptionsRef.current[uuid as string].lastUpdate = Date.now();
        }
      );
    },
    [subscriptionsRef]
  );

  const storedData = useStoredData();

  const updateMeshes = useCallback(
    (positions: Float32Array, angles: Float32Array, immediate: boolean) => {
      Object.entries(subscriptionsRef.current).forEach(
        ([uuid, { object, target, applyAngle }]) => {
          const index = storedData.bodies[uuid];
          const update = getPositionAndAngle({ positions, angles }, index);
          if (update) {
            if (immediate) {
              object.position.x = update.position[0];
              object.position.y = update.position[1];
              if (applyAngle) {
                object.rotation.x = update.angle;
              }
            } else if (target) {
              // object.position.x = target.position[0];
              // object.position.y = target.position[1];
              // if (applyAngle) {
              //   object.rotation.x = target.angle;
              // }
            }
            subscriptionsRef.current[uuid].target = {
              position: update.position,
              angle: update.angle,
            };
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
