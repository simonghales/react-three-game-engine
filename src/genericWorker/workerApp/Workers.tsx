import React, {useCallback, useEffect, useRef, useState} from "react"
import {Context, MessagingHandlers} from "./Workers.context";
import WorkerCommunication from "./WorkerCommunication";

const useHandleWorkerMessaging = (worker: Worker): MessagingHandlers => {

    const countRef = useRef(0)
    const [messageSubscriptions] = useState<{
        [key: string]: (event: MessageEvent) => void,
    }>({})

    const onWorkerMessage = useCallback((callback: (event: MessageEvent) => void) => {
        const id = countRef.current
        countRef.current += 1
        messageSubscriptions[id] = callback
        return () => {
            delete messageSubscriptions[id]
        }
    }, [])

    const sendWorkerMessage = useCallback((message: any, options?: any) => {
        worker.postMessage(message, options)
    }, [])

    useEffect(() => {
        const previousOnMessage: any = worker.onmessage;
        worker.onmessage = (event: MessageEvent) => {
            if (previousOnMessage) {
                previousOnMessage(event)
            }
            Object.values(messageSubscriptions).forEach((callback) => {
                callback(event)
            })
        }
    }, [])

    return [onWorkerMessage, sendWorkerMessage]

}

const AdditionalWorker: React.FC<{
    id: string,
    worker: Worker,
    onAdd: (handlers: MessagingHandlers) => void,
}> = ({id, worker, onAdd}) => {
    const handlers = useHandleWorkerMessaging(worker)
    useEffect(() => {
        onAdd(handlers)
    }, [])
    return null
}

export const WorkersProvider: React.FC<{
    initialWorkers?: {
        [key: string]: MessagingHandlers,
    },
    workers: {
        [key: string]: Worker,
    },
}> = ({children, workers, initialWorkers = {}}) => {
    const [registeredWorkers, setRegisteredWorkers] = useState<{
        [key: string]: MessagingHandlers
    }>(initialWorkers)

    const addRegisteredWorker = useCallback((id: string, handlers: MessagingHandlers) => {
        setRegisteredWorkers(state => ({
            ...state,
            [id]: handlers,
        }))
    }, [])

    return (
        <Context.Provider value={{workers: registeredWorkers}}>
            {
                Object.entries(workers).map(([id, worker]) => (
                    <AdditionalWorker id={id} worker={worker} key={id} onAdd={(handlers: MessagingHandlers) => {
                        addRegisteredWorker(id, handlers)
                    }}/>
                ))
            }
            <WorkerCommunication>
                {children}
            </WorkerCommunication>
        </Context.Provider>
    )
}

const Workers: React.FC<{
    worker: Worker,
}> = ({worker, children}) => {

    const countRef = useRef(0)
    const [onWorkerMessage, sendWorkerMessage] = useHandleWorkerMessaging(worker)
    const [additionalWorkers, setAdditionalWorkers] = useState<{
        [key: string]: Worker,
    }>({})

    useEffect(() => {
        return onWorkerMessage(event => {
            switch (event.data.command) {
                case 'connect':
                    const id = `worker-${countRef.current}`
                    countRef.current += 1
                    setAdditionalWorkers(state => ({
                        ...state,
                        [id]: event.ports[0] as unknown as Worker,
                    }))
                    break;
            }
        })
    }, [])

    return (
        <WorkersProvider workers={additionalWorkers} initialWorkers={{
            parent: [onWorkerMessage, sendWorkerMessage]
        }}>
            {children}
        </WorkersProvider>
    )
}

export default Workers