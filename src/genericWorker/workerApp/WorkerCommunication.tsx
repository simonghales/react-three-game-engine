import React, {useCallback, useEffect, useState} from "react"
import {useWorkerMessaging, useWorkers} from "./Workers.context";
import {AvailableFeatures, AvailableFeaturesData, WorkerMessageData, WorkerMessageTypes} from "../types";
import {Context} from "./WorkerCommunication.context"

const IndividualWorker: React.FC<{
    id: string,
    myFeatures: any,
    onAddFeatures: (features: AvailableFeaturesData) => void,
}> = ({id, myFeatures, onAddFeatures}) => {

    const [onMessage, sendMessage] = useWorkerMessaging(id)

    const sendAvailableFeatures = useCallback(() => {
        sendMessage({
            type: WorkerMessageTypes.AVAILABLE_FEATURES,
            data: myFeatures,
        })
    }, [myFeatures])

    useEffect(() => {
        sendAvailableFeatures()
        return onMessage(event => {
            const message: WorkerMessageData = event.data
            switch (message.type) {
                // because of potential timing issues
                case WorkerMessageTypes.REQUEST_AVAILABLE_FEATURES:
                    sendAvailableFeatures()
                    break;
            }
        })
    }, [myFeatures, sendAvailableFeatures])

    useEffect(() => {
        const unsub = onMessage(event => {
            const message: WorkerMessageData = event.data
            switch (message.type) {
                case WorkerMessageTypes.AVAILABLE_FEATURES:
                    const availableFeatures = message.data as AvailableFeaturesData
                    onAddFeatures(availableFeatures)
                    break;
            }
        })
        // because of potential timing issues
        sendMessage({
            type: WorkerMessageTypes.REQUEST_AVAILABLE_FEATURES,
        })
        return unsub
    }, [])

    return null

}

const WorkerCommunication: React.FC = ({children}) => {

    const [myFeatures, setMyFeatures] = useState<{
        [key: string]: boolean,
    }>({})
    const [workersFeatures, setWorkersFeatures] = useState<{
        [key: string]: AvailableFeaturesData,
    }>({})
    const workers = useWorkers()

    const registerFeature = useCallback((feature: AvailableFeatures) => {
        setMyFeatures(state => ({
            ...state,
            [feature]: true,
        }))
    }, [])

    return (
        <Context.Provider value={{
            workersFeatures,
            registerFeature,
        }}>
            {
                Object.keys(workers).map(id => (
                    <IndividualWorker myFeatures={myFeatures} id={id} key={id} onAddFeatures={(features: AvailableFeaturesData) => {
                        setWorkersFeatures(state => ({
                            ...state,
                            [id]: features,
                        }))
                    }}/>
                ))
            }
            {children}
        </Context.Provider>
    )
}

export default WorkerCommunication