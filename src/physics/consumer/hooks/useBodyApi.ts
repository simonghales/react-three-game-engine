import {useEffect, useMemo, useState} from "react";
import {useSendPhysicsMessage} from "../PhysicsConsumerHandler.context";
import {WorkerMessageTypes} from "../../../genericWorker/types";

export const useBodyApi = (id: string) => {

    const sendMessage = useSendPhysicsMessage()
    const [api] = useState(() => ({
        applyMethod: (method: string, args?: any[]) => {
            sendMessage({
                type: WorkerMessageTypes.PHYSICS_BODY_METHOD,
                body: id,
                method,
                args,
            })
        }
    }))

    useEffect(() => {
        api.applyMethod = (method: string, args?: any[]) => {
            sendMessage({
                type: WorkerMessageTypes.PHYSICS_BODY_METHOD,
                body: id,
                method,
                args,
            })
        }
    }, [sendMessage])

    return api
}