export declare type Subscribe = (callback: (event: MessageEvent) => void) => () => void;
export declare const useWorkerMessages: (worker: undefined | Worker | MessagePort) => (callback: (event: MessageEvent) => void) => () => void;
