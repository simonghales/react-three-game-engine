import {Body} from "planck-js";
import {useCallback, useEffect} from "react";
import {usePhysics} from "../Physics.context";

export const useAddBody = () => {
    const {
        addSyncedBody,
        addBody,
    } = usePhysics()
    return useCallback((id: string, body: Body, dynamic: boolean = true) => {
        const unsub: any[] = []

        unsub.push(addBody(id, body))

        if (dynamic) {
            unsub.push(addSyncedBody(id, body))
        }
        return () => {
            unsub.forEach(callback => callback())
        }
    }, [])
}