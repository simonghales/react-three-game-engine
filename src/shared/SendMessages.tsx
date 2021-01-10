import React, {createContext, useCallback, useContext} from "react"
import {WorkerOwnerMessageType} from "../main/worker/shared/types";
import {MessageData, MessageKeys} from "./types";
import {useMessagesContext} from "./Messages";

type ContextState = {
    sendMessage: (key: string, data: any) => void,
}

const Context = createContext(null as unknown as ContextState)

export const useSendMessage = () => {
    return useContext(Context).sendMessage
}

const SendMessages: React.FC<{
    worker: Worker,
}> = ({children, worker}) => {

    const { handleMessage } = useMessagesContext();

    const sendMessage = useCallback((key: string, data: any) => {

        if (key === MessageKeys.SYNC_COMPONENT) {
            throw new Error(`${key} is a reserved message key.`)
        }

        const message: MessageData = {
            key,
            data
        }

        worker.postMessage({
            type: WorkerOwnerMessageType.MESSAGE,
            message,
        })

        handleMessage(message)

    }, [worker, handleMessage])

    return (
        <Context.Provider value={{sendMessage}}>
            {children}
        </Context.Provider>
    )
}

export default SendMessages