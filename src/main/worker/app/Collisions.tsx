import React, { useCallback, useEffect } from 'react';
import { useAppContext, useWorld } from './appContext';
import { Contact, Fixture } from 'planck-js';
import {
  getFixtureData,
  getFixtureIndex,
  getFixtureUuid,
} from '../planckjs/collisions/collisions';
import { useWorldState } from './WorldState';
import { WorkerOwnerMessageType } from '../shared/types';

const useHandleBeginCollision = () => {
  const { worker, logicWorker } = useAppContext();
  const { collisionListeners } = useWorldState();
  const sendCollisionBeginEvent = useCallback(
    (uuid: string, data: any, fixtureIndex: number, isSensor: boolean) => {
      const update = {
        type: WorkerOwnerMessageType.BEGIN_COLLISION,
        props: {
          uuid,
          data,
          fixtureIndex,
          isSensor,
        },
      };
      worker.postMessage(update);
      if (logicWorker) {
        logicWorker.postMessage(update);
      }
    },
    [worker, logicWorker]
  );

  return useCallback(
    (fixtureA: Fixture, fixtureB: Fixture) => {
      const aData = getFixtureData(fixtureA);
      const bData = getFixtureData(fixtureB);
      const aUUID = getFixtureUuid(aData);
      const bUUID = getFixtureUuid(bData);

      if (aUUID && collisionListeners.has(aUUID)) {
        sendCollisionBeginEvent(
          aUUID,
          bData,
          getFixtureIndex(aData),
          fixtureB.isSensor()
        );
      }

      if (bUUID && collisionListeners.has(bUUID)) {
        sendCollisionBeginEvent(
          bUUID,
          aData,
          getFixtureIndex(bData),
          fixtureA.isSensor()
        );
      }
    },
    [collisionListeners, sendCollisionBeginEvent]
  );
};

const useHandleEndCollision = () => {
  const { worker, logicWorker } = useAppContext();
  const { collisionListeners } = useWorldState();

  const sendCollisionEndEvent = useCallback(
    (uuid: string, data: any, fixtureIndex: number, isSensor: boolean) => {
      const update = {
        type: WorkerOwnerMessageType.END_COLLISION,
        props: {
          uuid,
          data,
          fixtureIndex,
          isSensor,
        },
      };
      worker.postMessage(update);
      if (logicWorker) {
        logicWorker.postMessage(update);
      }
    },
    [worker, logicWorker]
  );

  return useCallback(
    (fixtureA: Fixture, fixtureB: Fixture) => {
      const aData = getFixtureData(fixtureA);
      const bData = getFixtureData(fixtureB);
      const aUUID = getFixtureUuid(aData);
      const bUUID = getFixtureUuid(bData);

      if (aUUID && collisionListeners.has(aUUID)) {
        sendCollisionEndEvent(
          aUUID,
          bData,
          getFixtureIndex(aData),
          fixtureB.isSensor()
        );
      }

      if (bUUID && collisionListeners.has(bUUID)) {
        sendCollisionEndEvent(
          bUUID,
          aData,
          getFixtureIndex(bData),
          fixtureA.isSensor()
        );
      }
    },
    [collisionListeners, sendCollisionEndEvent]
  );
};

export const Collisions: React.FC = () => {
  const world = useWorld();

  const handleBeginCollision = useHandleBeginCollision();
  const handleEndCollision = useHandleEndCollision();

  useEffect(() => {
    world.on('begin-contact', (contact: Contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      handleBeginCollision(fixtureA, fixtureB);
    });

    world.on('end-contact', (contact: Contact) => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      handleEndCollision(fixtureA, fixtureB);
    });
  }, [world]);

  return null;
};
