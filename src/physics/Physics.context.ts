import {createContext, useContext} from "react";
import {Body, World} from "planck-js";

type State = {
    world: World,
    addSyncedBody: (uid: string, body: Body) => () => void,
    removeSyncedBody: (uid: string) => void,
    syncedBodies: {
        [key: string]: Body,
    },
    syncedBodiesOrder: string[],
    stepRate: number,
    maxNumberOfSyncedBodies: number,
    syncedBodiesUpdateCount: number,
    addBody: (uid: string, body: Body) => () => void,
    onBodyMethod: (uid: string, method: string, args?: any[]) => void,
}

export const Context = createContext(null as unknown as State)

export const usePhysics = () => {
    return useContext(Context)
}

export const usePhysicsWorld = () => {
    return usePhysics().world
}

export const useAddSyncedBody = () => {
    return usePhysics().addSyncedBody
}

export const useRemoveSyncedBody = () => {
    return usePhysics().removeSyncedBody
}