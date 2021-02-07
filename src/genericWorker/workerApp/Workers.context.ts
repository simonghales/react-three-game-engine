import {createContext, useContext} from "react";

export type MessagingHandlers = [
    (callback: (event: MessageEvent) => void) => () => void,
    (message: any, options?: any) => void
]

type State = {
    workers: {
        [key: string]: MessagingHandlers
    }
}

export const Context = createContext<State>({
    workers: {},
})

export const useWorkers = () => {
    return useContext(Context).workers
}

export const useWorkerMessaging = (id: string) => {
    return useContext(Context).workers[id]
}

/*

<Engine workers={{
    physics: {
        genericWorker: Worker,
    },
    logic: {
        genericWorker: Worker,
        connectTo: ['physics'],
    }
}}>
</Engine>

Engine:

For workers, if connect to, initiate a connection

WorkerWrapper.

On connection, send message declaring what I have to offer, receive what they have to offer.

 */