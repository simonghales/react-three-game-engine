import React, {createContext, useContext} from 'react';
import {MessageData} from "../shared/types";
import PhysicsHandler from "./logicWorkerApp/PhysicsHandler";
import CollisionsProvider from "../shared/CollisionsProvider";
import MeshRefs from "../main/MeshRefs";

export type ContextState = {
  physicsWorker: Worker | MessagePort;
  sendMessageToMain: (message: MessageData) => void;
};

export const Context = createContext((null as unknown) as ContextState);

export const useWorkerAppContext = (): ContextState => {
  return useContext(Context);
};

export const useSendMessageToMain = () => {
  return useWorkerAppContext().sendMessageToMain;
};

const ApiWrapper: React.FC<{
  physicsWorker: Worker | MessagePort,
  sendMessageToMain: (message: MessageData) => void,
}> = ({
  children,
  physicsWorker,
  sendMessageToMain
}) => {
  return (
      <Context.Provider value={{ physicsWorker, sendMessageToMain }}>
        <MeshRefs>
          <PhysicsHandler worker={physicsWorker}>
            <CollisionsProvider>
                {children}
            </CollisionsProvider>
          </PhysicsHandler>
        </MeshRefs>
      </Context.Provider>
  );
};

export default ApiWrapper;

export const withLogicWrapper = (WrappedComponent: any) => {
  return (props: any) => {
    return (
      <ApiWrapper {...props}>
        <WrappedComponent />
      </ApiWrapper>
    );
  };
};
