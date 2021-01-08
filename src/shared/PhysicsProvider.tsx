import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  AddBodyProps,
  RemoveBodyProps,
  SetBodyProps,
  UpdateBodyProps,
} from '../main/worker/planckjs/bodies';
import { WorkerMessageType } from '../main/worker/shared/types';

type ContextState = {
  workerAddBody: (props: AddBodyProps) => void;
  workerRemoveBody: (props: RemoveBodyProps) => void;
  workerSetBody: (props: SetBodyProps) => void;
  workerUpdateBody: (props: UpdateBodyProps) => void;
};

const Context = createContext((null as unknown) as ContextState);

export const usePhysicsProvider = (): ContextState => {
  return useContext(Context);
};

const PhysicsProvider: React.FC<{
  worker: Worker | MessagePort;
}> = ({ children, worker }) => {
  const workerAddBody = useCallback((props: AddBodyProps) => {
    worker.postMessage({
      type: WorkerMessageType.ADD_BODY,
      props: props,
    });
  }, []);

  const workerRemoveBody = useCallback((props: RemoveBodyProps) => {
    worker.postMessage({
      type: WorkerMessageType.REMOVE_BODY,
      props,
    });
  }, []);

  const workerSetBody = useCallback((props: SetBodyProps) => {
    worker.postMessage({
      type: WorkerMessageType.SET_BODY,
      props,
    });
  }, []);

  const workerUpdateBody = useCallback((props: UpdateBodyProps) => {
    worker.postMessage({
      type: WorkerMessageType.UPDATE_BODY,
      props,
    });
  }, []);

  return (
    <Context.Provider
      value={{
        workerAddBody,
        workerRemoveBody,
        workerSetBody,
        workerUpdateBody,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default PhysicsProvider;
