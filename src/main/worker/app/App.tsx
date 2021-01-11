import React, {useState} from "react"
import {Vec2, World, WorldDef} from "planck-js";
import { AppContext } from "./appContext";
import WorkerOnMessageProvider from "../../../shared/WorkerOnMessageProvider";
import {useWorkerMessages} from "../../hooks/useWorkerMessages";

export const App: React.FC<{
    worldParams: WorldDef,
    worker: Worker,
}> = ({worldParams, worker}) => {

    const defaultParams = {
        allowSleep: true,
        gravity: Vec2(0, 0),
        ...worldParams,
    }

    const [world] = useState(() => World(defaultParams))

    const subscribe = useWorkerMessages(worker)

    return (
        <AppContext.Provider value={{world}}>
            <WorkerOnMessageProvider subscribe={subscribe}>

            </WorkerOnMessageProvider>
        </AppContext.Provider>
    )
}