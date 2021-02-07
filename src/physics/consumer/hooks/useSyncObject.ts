import {MutableRefObject, useEffect} from "react";
import {Object3D} from "three";
import {useSyncBody} from "../PhysicsConsumerHandler.context";

export const useSyncObject = (id: string, ref: MutableRefObject<Object3D>) => {
    const syncBody = useSyncBody()
    useEffect(() => {
        return syncBody(id, ref)
    }, [id, ref])
}