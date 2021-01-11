import React, { useCallback, useEffect, useState } from 'react';
import { useAppContext, useWorld } from './appContext';
import { ValidUUID, WorkerMessageType } from '../shared/types';
import {
  Body,
  BodyDef,
  Box,
  Circle,
  DistanceJoint,
  FixtureOpt,
  Joint,
  RopeJoint,
  Vec2,
} from 'planck-js';
import {
  AddBodyProps,
  BodyShape,
  BodyType,
  BoxFixture,
  CircleFixture,
  RemoveBodyProps,
  SetBodyProps,
  UpdateBodyProps,
} from '../planckjs/bodies';
import { Shape } from 'planck-js/lib/shape';
import { useWorldState } from './WorldState';

const tempVec = Vec2(0, 0);

export const useSubscribeToWorkerMessages = (
  messageHandler: (event: MessageEvent) => void
) => {
  const { subscribe, logicSubscribe } = useAppContext();

  useEffect(() => {
    const unsubscribe = subscribe(messageHandler);

    const unsubscribeLogic = logicSubscribe(messageHandler);

    return () => {
      unsubscribe();
      unsubscribeLogic();
    };
  }, [subscribe, logicSubscribe, messageHandler]);
};

type BodiesMap = Map<ValidUUID, Body>;
type CachedBodiesMap = Map<string, Body[]>;

const applyBodyConfigToExistingBody = (
  body: Body,
  data: AddBodyProps
): Body => {
  const {
    uuid,
    cacheKey,
    listenForCollisions,
    fixtures = [],
    attachToRope = false,
    ...props
  } = data;

  if (fixtures && fixtures.length > 0) {
    let bodyFixture = body.getFixtureList();

    fixtures.forEach((fixture, fixtureIndex) => {
      let fixtureOptions = fixture.fixtureOptions;

      fixtureOptions = {
        userData: {
          uuid,
          fixtureIndex,
          ...fixtureOptions?.userData,
        },
        ...fixtureOptions,
      };

      if (bodyFixture) {
        if (fixtureOptions) {
          bodyFixture.setUserData(fixtureOptions.userData);
        }

        bodyFixture = bodyFixture.getNext();
      }
    });
  }

  const { position, angle } = props;

  if (position) {
    body.setPosition(position);
  }

  if (angle) {
    body.setAngle(angle);
  }

  body.setActive(true);

  return body;
};

const useAddBody = (bodies: BodiesMap, cachedBodies: CachedBodiesMap) => {
  const {
    dynamicBodies,
    collisionListeners,
    bodiesNeedSyncRef,
    logicBodiesNeedSyncRef,
  } = useWorldState();

  const addDynamicBody = useCallback(
    (uuid: ValidUUID) => {
      dynamicBodies.add(uuid);
      bodiesNeedSyncRef.current = true;
      logicBodiesNeedSyncRef.current = true;
    },
    [dynamicBodies, bodiesNeedSyncRef, logicBodiesNeedSyncRef]
  );

  const addCollisionListeners = useCallback(
    (uuid: ValidUUID) => {
      collisionListeners.add(uuid);
    },
    [collisionListeners]
  );

  const world = useWorld();

  const getCachedBody = useCallback(
    (cacheKey: string) => {
      const cached = cachedBodies.get(cacheKey);

      if (cached && cached.length > 0) {
        const body = cached.pop();
        if (body) {
          return body;
        }
      }

      return null;
    },
    [cachedBodies]
  );

  return useCallback(
    (data: AddBodyProps) => {
      const {
        uuid,
        cacheKey,
        listenForCollisions,
        fixtures = [],
        attachToRope = false,
        ...props
      } = data;

      const existingBody = bodies.get(uuid);

      if (existingBody) {
        return existingBody;
      }

      if (listenForCollisions) {
        addCollisionListeners(uuid);
      }

      const bodyDef: BodyDef = {
        type: BodyType.static,
        fixedRotation: true,
        ...props,
      };

      const { type } = bodyDef;

      let body: Body | null = null;

      if (cacheKey) {
        let cachedBody = getCachedBody(cacheKey);

        if (cachedBody) {
          body = applyBodyConfigToExistingBody(cachedBody, data);
        }
      }

      if (!body) {
        body = world.createBody(bodyDef);

        if (fixtures && fixtures.length > 0) {
          fixtures.forEach((fixture, fixtureIndex) => {
            const { shape } = fixture;

            let fixtureOptions = fixture.fixtureOptions ?? {};

            fixtureOptions = {
              ...fixtureOptions,
              userData: {
                uuid,
                fixtureIndex,
                ...fixtureOptions?.userData,
              },
            };

            let bodyShape: Shape;

            switch (shape) {
              case BodyShape.box:
                const { hx, hy, center } = fixture as BoxFixture;
                bodyShape = (Box(
                  (hx as number) / 2,
                  (hy as number) / 2,
                  center ? Vec2(center[0], center[1]) : undefined
                ) as unknown) as Shape;
                break;
              case BodyShape.circle:
                const { radius } = fixture as CircleFixture;
                bodyShape = (Circle(radius as number) as unknown) as Shape;
                break;
              default:
                throw new Error(`Unhandled body shape ${shape}`);
            }

            if (fixtureOptions) {
              if (body) {
                body.createFixture(bodyShape, fixtureOptions as FixtureOpt);
              }
            } else {
              if (body) {
                body.createFixture(bodyShape);
              }
            }

            // todo - handle rope properly...
            if (attachToRope) {
              const { position, angle } = props;

              const ropeJointDef = {
                maxLength: 0.5,
                localAnchorA: position,
                localAnchorB: position,
              };

              const startingBodyDef: BodyDef = {
                type: BodyType.static,
                fixedRotation: true,
                position,
                angle,
              };

              const startingBody = world.createBody(startingBodyDef);

              if (body) {
                const distanceJoint = DistanceJoint(
                  {
                    collideConnected: false,
                    frequencyHz: 5,
                    dampingRatio: 0.5,
                    length: 0.15,
                  },
                  startingBody,
                  body,
                  position ?? Vec2(0, 0),
                  position ?? Vec2(0, 0)
                );

                const rope2 = world.createJoint(
                  (RopeJoint(
                    ropeJointDef,
                    startingBody,
                    body,
                    position ?? Vec2(0, 0)
                  ) as unknown) as Joint
                );
                const rope = world.createJoint(
                  (distanceJoint as unknown) as Joint
                );
              }
            }
          });
        }
      }

      if (type !== BodyType.static) {
        addDynamicBody(uuid);
      }

      if (!body) {
        throw new Error(`No body`);
      }

      bodies.set(uuid, body);

      console.log('added body', bodies);

      return body;
    },
    [world, bodies, getCachedBody, addDynamicBody, addCollisionListeners]
  );
};

const useRemoveBody = (bodies: BodiesMap, cachedBodies: CachedBodiesMap) => {
  const world = useWorld();
  const {
    dynamicBodies,
    collisionListeners,
    bodiesNeedSyncRef,
    logicBodiesNeedSyncRef,
  } = useWorldState();

  return useCallback(
    ({ uuid, cacheKey }: RemoveBodyProps) => {
      if (dynamicBodies.has(uuid)) {
        dynamicBodies.delete(uuid);
        bodiesNeedSyncRef.current = true;
        logicBodiesNeedSyncRef.current = true;
      }

      collisionListeners.delete(uuid);

      const body = bodies.get(uuid);

      if (!body) {
        console.warn(`Body not found for ${uuid}`);
        return;
      }

      bodies.delete(uuid);

      if (cacheKey) {
        tempVec.set(-1000, -1000);
        body.setPosition(tempVec);
        tempVec.set(0, 0);
        body.setLinearVelocity(tempVec);
        body.setActive(false);
        const cached = cachedBodies.get(cacheKey);
        if (cached) {
          cached.push(body);
        } else {
          cachedBodies.set(cacheKey, [body]);
        }
      } else {
        world.destroyBody(body);
      }
    },
    [
      world,
      bodies,
      dynamicBodies,
      collisionListeners,
      bodiesNeedSyncRef,
      logicBodiesNeedSyncRef,
      cachedBodies,
    ]
  );
};

const useSetBody = (bodies: BodiesMap) => {
  return useCallback(
    ({ uuid, method, methodParams }: SetBodyProps) => {
      const body = bodies.get(uuid);
      if (!body) {
        console.warn(`Body not found for ${uuid}`, bodies);
        return;
      }
      switch (method) {
        default:
          (body as any)[method](...methodParams);
      }
    },
    [bodies]
  );
};

const useUpdateBody = (bodies: BodiesMap) => {
  return useCallback(
    ({ uuid, data }: UpdateBodyProps) => {
      const body = bodies.get(uuid);
      if (!body) {
        console.warn(`Body not found for ${uuid}`);
        return;
      }
      const { fixtureUpdate } = data;
      if (fixtureUpdate) {
        const fixture = body.getFixtureList();
        if (fixture) {
          const { groupIndex, categoryBits, maskBits } = fixtureUpdate;
          if (
            groupIndex !== undefined ||
            categoryBits !== undefined ||
            maskBits !== undefined
          ) {
            const originalGroupIndex = fixture.getFilterGroupIndex();
            const originalCategoryBits = fixture.getFilterCategoryBits();
            const originalMaskBits = fixture.getFilterMaskBits();
            fixture.setFilterData({
              groupIndex:
                groupIndex !== undefined ? groupIndex : originalGroupIndex,
              categoryBits:
                categoryBits !== undefined
                  ? categoryBits
                  : originalCategoryBits,
              maskBits: maskBits !== undefined ? maskBits : originalMaskBits,
            });
          }
        }
      }
    },
    [bodies]
  );
};

export const Bodies: React.FC = () => {
  const { bodies } = useWorldState();
  const [cachedBodies] = useState<CachedBodiesMap>(() => new Map());

  const addBody = useAddBody(bodies, cachedBodies);
  const removeBody = useRemoveBody(bodies, cachedBodies);
  const setBody = useSetBody(bodies);
  const updateBody = useUpdateBody(bodies);

  const onMessage = useCallback(
    (event: MessageEvent) => {
      const { type, props = {} } = event.data as {
        type: WorkerMessageType;
        props: any;
      };
      switch (type) {
        case WorkerMessageType.ADD_BODY:
          addBody(props);
          break;
        case WorkerMessageType.REMOVE_BODY:
          removeBody(props);
          break;
        case WorkerMessageType.SET_BODY:
          setBody(props);
          break;
        case WorkerMessageType.UPDATE_BODY:
          updateBody(props);
          break;
      }
    },
    [addBody, removeBody, setBody, updateBody]
  );

  useSubscribeToWorkerMessages(onMessage);

  return null;
};
