import { Subscribe } from '../../hooks/useWorkerMessages';
export declare const useSubscribeLogicWorker: (worker: Worker | MessagePort | undefined) => (callback: (event: MessageEvent) => void) => () => void;
export declare const useLogicWorker: (worker: Worker, subscribe: Subscribe) => undefined | Worker | MessagePort;
