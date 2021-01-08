import React, { createContext, useCallback, useContext, useState } from 'react';
import { ValidUUID } from '../main/worker/shared/types';
import { CollisionEventProps } from '../main/worker/planckjs/data';

type CollisionsProviderContextState = {
  addCollisionHandler: (
    started: boolean,
    uuid: ValidUUID,
    callback: (data: any, fixtureIndex: number, isSensor: boolean) => void
  ) => void;
  removeCollisionHandler: (started: boolean, uuid: ValidUUID) => void;
  handleBeginCollision: (data: CollisionEventProps) => void;
  handleEndCollision: (data: CollisionEventProps) => void;
};

const CollisionsProviderContext = createContext(
  (null as unknown) as CollisionsProviderContextState
);

export const useCollisionsProviderContext = (): CollisionsProviderContextState => {
  return useContext(CollisionsProviderContext);
};

const CollisionsProvider: React.FC = ({ children }) => {
  const [collisionStartedEvents] = useState<{
    [key: string]: (data: any, fixtureIndex: number, isSensor: boolean) => void;
  }>({});

  const [collisionEndedEvents] = useState<{
    [key: string]: (data: any, fixtureIndex: number, isSensor: boolean) => void;
  }>({});

  const addCollisionHandler = useCallback(
    (
      started: boolean,
      uuid: ValidUUID,
      callback: (data: any, fixtureIndex: number, isSensor: boolean) => void
    ) => {
      if (started) {
        collisionStartedEvents[uuid] = callback;
      } else {
        collisionEndedEvents[uuid] = callback;
      }
    },
    []
  );

  const removeCollisionHandler = useCallback(
    (started: boolean, uuid: ValidUUID) => {
      if (started) {
        delete collisionStartedEvents[uuid];
      } else {
        delete collisionEndedEvents[uuid];
      }
    },
    []
  );

  const handleBeginCollision = useCallback(
    (data: CollisionEventProps) => {
      if (collisionStartedEvents[data.uuid]) {
        collisionStartedEvents[data.uuid](
          data.data,
          data.fixtureIndex,
          data.isSensor
        );
      }
    },
    [collisionStartedEvents]
  );

  const handleEndCollision = useCallback(
    (data: CollisionEventProps) => {
      if (collisionEndedEvents[data.uuid]) {
        collisionEndedEvents[data.uuid](
          data.data,
          data.fixtureIndex,
          data.isSensor
        );
      }
    },
    [collisionEndedEvents]
  );

  return (
    <CollisionsProviderContext.Provider
      value={{
        addCollisionHandler,
        removeCollisionHandler,
        handleBeginCollision,
        handleEndCollision,
      }}
    >
      {children}
    </CollisionsProviderContext.Provider>
  );
};

export default CollisionsProvider;
