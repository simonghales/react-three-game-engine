import React from 'react';
export declare type ContextState = {
    subscribe: (callback: (event: MessageEvent) => void) => () => void;
};
export declare const Context: React.Context<ContextState>;
export declare const useWorkerOnMessage: () => (callback: (event: MessageEvent) => void) => () => void;
declare const WorkerOnMessageProvider: React.FC<{
    subscribe: (callback: (event: MessageEvent) => void) => () => void;
}>;
export default WorkerOnMessageProvider;
