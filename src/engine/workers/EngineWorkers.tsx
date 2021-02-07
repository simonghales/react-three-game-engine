import React, {useEffect, useState} from "react"
import {Workers} from "../types";
import {WorkersProvider} from "../../genericWorker/workerApp/Workers";

const useHandleWorkers = (workers: Workers) => {

    useEffect(() => {

        Object.entries(workers).forEach(([id, {worker, connectTo}]) => {
            if (connectTo) {
                connectTo.forEach((workerId) => {
                    if (workers[workerId]) {
                        const channel = new MessageChannel();
                        worker.postMessage({ command: 'connect' }, [channel.port1]);
                        workers[workerId].worker.postMessage({ command: 'connect' }, [channel.port2]);
                    }
                })
            }
        })

    }, [])

}

const EngineWorkers: React.FC<{
    workers: {
        [key: string]: {
            worker: Worker,
        }
    }
}> = ({children, workers}) => {

    useHandleWorkers(workers)

    const [preppedWorkers] = useState(() => {
        const prepped: {
            [key: string]: Worker,
        } = {}
        Object.entries(workers).forEach(([id, {worker}]) => {
            prepped[id] = worker
        })
        return prepped
    })

    return (
        <WorkersProvider workers={preppedWorkers}>
            {children}
        </WorkersProvider>
    )
}

export default EngineWorkers