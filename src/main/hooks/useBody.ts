import {
  AddBodyDef,
  BodyType,
  UpdateBodyData,
} from '../worker/planckjs/bodies';
import { PhysicsCacheKeys } from '../worker/planckjs/cache';
import {
  MutableRefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Object3D } from 'three';
import { usePhysicsProvider } from '../../shared/PhysicsProvider';
import { ValidUUID } from '../worker/shared/types';
import { Vec2 } from 'planck-js';
import {
  useAddMeshSubscription,
  useSubscribeMesh,
} from '../../shared/MeshSubscriptions';

export type BodyApi = {
  applyForceToCenter: (vec: Vec2, uuid?: ValidUUID) => void;
  applyLinearImpulse: (vec: Vec2, pos: Vec2, uuid?: ValidUUID) => void;
  setPosition: (vec: Vec2, uuid?: ValidUUID) => void;
  setLinearVelocity: (vec: Vec2, uuid?: ValidUUID) => void;
  setAngle: (angle: number, uuid?: ValidUUID) => void;
  updateBody: (data: UpdateBodyData, uuid?: ValidUUID) => void;
};

export const useBodyApi = (passedUuid: ValidUUID): BodyApi => {
  const { workerSetBody, workerUpdateBody } = usePhysicsProvider();

  const api = useMemo<BodyApi>(() => {
    return {
      applyForceToCenter: (vec, uuid) => {
        workerSetBody({
          uuid: uuid ?? passedUuid,
          method: 'applyForceToCenter',
          methodParams: [vec, true],
        });
      },
      applyLinearImpulse: (vec, pos, uuid) => {
        workerSetBody({
          uuid: uuid ?? passedUuid,
          method: 'applyLinearImpulse',
          methodParams: [vec, pos, true],
        });
      },
      setPosition: (vec, uuid) => {
        workerSetBody({
          uuid: uuid ?? passedUuid,
          method: 'setPosition',
          methodParams: [vec],
        });
      },
      setLinearVelocity: (vec, uuid) => {
        workerSetBody({
          uuid: uuid ?? passedUuid,
          method: 'setLinearVelocity',
          methodParams: [vec],
        });
      },
      updateBody: (data: UpdateBodyData, uuid) => {
        workerUpdateBody({ uuid: uuid ?? passedUuid, data });
      },
      setAngle: (angle: number, uuid) => {
        workerSetBody({
          uuid: uuid ?? passedUuid,
          method: 'setAngle',
          methodParams: [angle],
        });
      },
    };
  }, [passedUuid]);

  return api;
};

export const useBody = (
  propsFn: () => AddBodyDef,
  {
    applyAngle = false,
    cacheKey,
    uuid: passedUUID,
    fwdRef,
    listenForCollisions = false,
  }: {
    listenForCollisions?: boolean;
    applyAngle?: boolean;
    cacheKey?: PhysicsCacheKeys;
    uuid?: ValidUUID;
    fwdRef?: MutableRefObject<Object3D>;
  }
): [any, BodyApi, ValidUUID] => {
  const localRef = useRef<Object3D>((null as unknown) as Object3D);
  const ref = fwdRef ? fwdRef : localRef;
  const [uuid] = useState(() => {
    if (passedUUID) return passedUUID;
    if (!ref.current) {
      ref.current = new Object3D();
    }
    return ref.current.uuid;
  });
  const [isDynamic] = useState(() => {
    const props = propsFn();
    return props.type !== BodyType.static;
  });
  const { workerAddBody, workerRemoveBody } = usePhysicsProvider();

  useLayoutEffect(() => {
    const props = propsFn();

    const object = ref.current;

    object.position.x = props.position?.x || 0;
    object.position.y = props.position?.y || 0;

    workerAddBody({
      uuid,
      listenForCollisions,
      cacheKey,
      ...props,
    });

    return () => {
      workerRemoveBody({ uuid, cacheKey });
    };
  }, []);

  useSubscribeMesh(uuid, ref.current, applyAngle, isDynamic);

  const api = useBodyApi(uuid);

  return [ref, api, uuid];
};
