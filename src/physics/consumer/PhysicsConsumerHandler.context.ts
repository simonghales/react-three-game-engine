import {createContext, MutableRefObject, useContext, useEffect} from "react";
import {Object3D} from "three";

type State = {
    syncMeshes: () => void,
    syncBody: (id: string, ref: MutableRefObject<Object3D>) => () => void,
    sendPhysicsMessage: (message: any) => void,
    subscribeToOnPhysicsUpdate: (callback: (delta: number) => void) => () => void,
}

export const Context = createContext(null as unknown as State)

export const useOnFixedUpdate = (callback: (delta: number) => void) => {
    const {subscribeToOnPhysicsUpdate} = useContext(Context)
    useEffect(() => {
        return subscribeToOnPhysicsUpdate(callback)
    }, [callback])
}

export const useSyncMeshes = () => {
    return useContext(Context).syncMeshes
}

export const useSyncBody = () => {
    return useContext(Context).syncBody
}

export const useSendPhysicsMessage = () => {
    return useContext(Context).sendPhysicsMessage
}