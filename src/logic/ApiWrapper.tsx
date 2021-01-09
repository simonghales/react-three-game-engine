import React, {createContext, useContext} from 'react';
import {MessageData} from "../shared/types";
import PhysicsHandler from "./logicWorkerApp/PhysicsHandler";
import CollisionsProvider from "../shared/CollisionsProvider";
import MeshRefs from "../main/MeshRefs";
import Messages from "../shared/Messages";
import SendMessages from "../shared/SendMessages";
import MessageHandler from "./logicWorkerApp/MessageHandler";

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
  worker: Worker,
  physicsWorker: Worker | MessagePort,
  sendMessageToMain: (message: MessageData) => void,
}> = ({
  children,
  worker,
  physicsWorker,
  sendMessageToMain
}) => {
  return (
      <Context.Provider value={{ physicsWorker, sendMessageToMain }}>
        <Messages>
          <MessageHandler worker={worker}>
            <SendMessages worker={worker}>
              <MeshRefs>
                <PhysicsHandler worker={physicsWorker}>
                  <CollisionsProvider>
                      {children}
                  </CollisionsProvider>
                </PhysicsHandler>
              </MeshRefs>
            </SendMessages>
          </MessageHandler>
        </Messages>
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
