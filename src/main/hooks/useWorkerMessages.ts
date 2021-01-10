import {useCallback, useEffect, useRef} from "react";

export const useWorkerMessages = (worker: Worker | MessagePort) => {

    const idCount = useRef(0);
    const subscriptionsRef = useRef<{
        [key: string]: (event: MessageEvent) => void;
    }>({});

    const subscribe = useCallback(
        (callback: (event: MessageEvent) => void) => {
            const id = idCount.current;
            idCount.current += 1;

            subscriptionsRef.current[id] = callback;

            return () => {
                delete subscriptionsRef.current[id];
            };
        },
        [subscriptionsRef]
    );

    useEffect(() => {
        worker.onmessage = (event: MessageEvent) => {
            Object.values(subscriptionsRef.current).forEach(callback => {
                callback(event);
            });
        };
    }, [worker, subscriptionsRef]);

    return subscribe

}