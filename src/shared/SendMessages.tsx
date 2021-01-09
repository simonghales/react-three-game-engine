import React, {createContext, useCallback, useContext} from "react"
import {WorkerOwnerMessageType} from "../main/worker/shared/types";
import {MessageKeys} from "./types";

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

    const sendMessage = useCallback((key: string, data: any) => {

        if (key === MessageKeys.SYNC_COMPONENT) {
            throw new Error(`${key} is a reserved message key.`)
        }

        worker.postMessage({
            type: WorkerOwnerMessageType.MESSAGE,
            message: {
                key,
                data,
            },
        })
    }, [worker])

    return (
        <Context.Provider value={{sendMessage}}>
            {children}
        </Context.Provider>
    )
}

export default SendMessages