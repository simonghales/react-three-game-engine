import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {ValidUUID, WorkerOwnerMessageType} from '../main/worker/shared/types';
import { CollisionEventProps } from '../main/worker/planckjs/data';
import {useWorkerOnMessage} from "./WorkerOnMessageProvider";

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

  const onMessage = useWorkerOnMessage();

  useEffect(() => {

      const unsubscribe = onMessage((event: MessageEvent) => {
          const type = event.data.type;

          switch (type) {
              case WorkerOwnerMessageType.BEGIN_COLLISION:
                handleBeginCollision(event.data.props as any)
                break;
              case WorkerOwnerMessageType.END_COLLISION:
                handleEndCollision(event.data.props as any)
                break;
              default:
          }

      })

      return unsubscribe

  }, [])

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
