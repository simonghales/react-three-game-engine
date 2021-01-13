import React from 'react';
import { MessageData } from "../shared/types";
export declare type ContextState = {
    physicsWorker: Worker | MessagePort;
    sendMessageToMain: (message: MessageData) => void;
};
export declare const Context: React.Context<ContextState>;
export declare const useWorkerAppContext: () => ContextState;
export declare const useSendMessageToMain: () => (message: MessageData) => void;
declare const ApiWrapper: React.FC<{
    worker: Worker;
    physicsWorker: Worker | MessagePort;
    sendMessageToMain: (message: MessageData) => void;
}>;
export default ApiWrapper;
export declare const withLogicWrapper: (WrappedComponent: any) => (props: any) => JSX.Element;
