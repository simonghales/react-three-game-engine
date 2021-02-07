import React, {useCallback, useEffect, useState} from "react"
import {Body, Vec2, World, WorldDef} from "planck-js";
import {Context} from "./Physics.context";
import PhysicsUpdater from "./PhysicsUpdater";
import {useRegisterFeature} from "../genericWorker/workerApp/WorkerCommunication.context";
import {AvailableFeatures} from "../genericWorker/types";
import {PHYSICS_UPDATE_RATE} from "../main/worker/planckjs/config";

type Return = {
    world: World,
    addSyncedBody: (uid: string, body: Body) => () => void,
    removeSyncedBody: (uid: string) => void,
    syncedBodies: {
        [key: string]: Body,
    },
    syncedBodiesOrder: string[],
    syncedBodiesUpdateCount: number,
    addBody: (uid: string, body: Body) => () => void,
    onBodyMethod: (uid: string, method: string, args?: any[]) => void,
}

const useInitPhysics = (worldParams: WorldDef = {}): Return => {

    const defaultParams = {
        allowSleep: true,
        gravity: Vec2(0, 0),
        ...worldParams,
    }

    const [world] = useState<World>(() => World(defaultParams));
    const [bodies] = useState<{
        [key: string]: Body,
    }>({})
    const [syncedBodies] = useState<{
        [key: string]: Body,
    }>({})
    const [syncedBodiesOrder] = useState<string[]>([])
    const [syncedBodiesUpdateCount, setSyncedBodiesUpdateCount] = useState(0)

    const addBody = useCallback((uid: string, body: Body) => {
        bodies[uid] = body
        return () => {
            delete bodies[uid]
        }
    }, [])

    const onBodyMethod = useCallback((id: string, method: string, args?: any[]) => {
        const body = bodies[id]
        if (!body) {
            console.warn(`No body found for ${id}`)
            return
        }
        if (args) {
            (body as any)[method](...args)
        } else {
            (body as any)[method]()
        }
    }, [])

    const addSyncedBody = useCallback((uid: string, body: Body) => {
        syncedBodiesOrder.push(uid)
        syncedBodies[uid] = body
        setSyncedBodiesUpdateCount(state => state + 1)
        return () => {
            const index = syncedBodiesOrder.indexOf(uid)
            syncedBodiesOrder.splice(index, 1)
            delete syncedBodies[uid]
            setSyncedBodiesUpdateCount(state => state + 1)
        }
    }, [])

    const removeSyncedBody = useCallback((uid: string) => {
        const index = syncedBodiesOrder.indexOf(uid)
        syncedBodiesOrder.splice(index, 1)
        delete syncedBodies[uid]
        setSyncedBodiesUpdateCount(state => state + 1)
    }, [])

    return {
        world,
        addSyncedBody,
        removeSyncedBody,
        syncedBodies,
        syncedBodiesOrder,
        syncedBodiesUpdateCount,
        addBody,
        onBodyMethod,
    }

}

const Physics: React.FC<{
    updateRate?: number,
    maxNumberOfSyncedBodies?: number,
}> = ({children,
                         updateRate = PHYSICS_UPDATE_RATE,
                         maxNumberOfSyncedBodies= 100}) => {


    const {world, addSyncedBody, removeSyncedBody, syncedBodies, syncedBodiesOrder, syncedBodiesUpdateCount, addBody, onBodyMethod} = useInitPhysics()
    const registerFeature = useRegisterFeature()

    useEffect(() => {
        console.log('registering my features')
        registerFeature(AvailableFeatures.PHYSICS)
    }, [])

    return (
        <Context.Provider value={{
            world,
            addSyncedBody,
            removeSyncedBody,
            syncedBodies,
            syncedBodiesOrder,
            stepRate: updateRate,
            maxNumberOfSyncedBodies,
            syncedBodiesUpdateCount,
            addBody,
            onBodyMethod,
        }}>
            <PhysicsUpdater stepRate={updateRate}/>
            {children}
        </Context.Provider>
    )
}

export default Physics