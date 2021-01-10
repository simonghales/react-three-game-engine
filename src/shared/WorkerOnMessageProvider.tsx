import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export type ContextState = {
  subscribe: (callback: (event: MessageEvent) => void) => () => void;
};

export const Context = createContext((null as unknown) as ContextState);

export const useWorkerOnMessage = () => {
  return useContext(Context).subscribe;
};

const WorkerOnMessageProvider: React.FC<{
    subscribe: (callback: (event: MessageEvent) => void) => () => void;
}> = ({ children, subscribe }) => {
  return (
    <Context.Provider
      value={{
        subscribe,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default WorkerOnMessageProvider;
