import {ValidUUID} from "../worker/shared/types";
import {useCollisionsProviderContext} from "../../shared/CollisionsProvider";
import {useEffect} from "react";

export const useCollisionEvents = (
    uuid: ValidUUID,
    onCollideStart?: (data: any, fixtureIndex: number, isSensor: boolean) => void,
    onCollideEnd?: (data: any, fixtureIndex: number, isSensor: boolean) => void,
) => {

    const {
        addCollisionHandler,
        removeCollisionHandler
    } = useCollisionsProviderContext()

    // @ts-ignore
    useEffect(() => {
        if (onCollideStart) {
            addCollisionHandler(true, uuid, onCollideStart)
            return () => {
                removeCollisionHandler(true, uuid)
            }
        }
    }, [uuid, onCollideStart])

    // @ts-ignore
    useEffect(() => {
        if (onCollideEnd) {
            addCollisionHandler(false, uuid, onCollideEnd)
            return () => {
                removeCollisionHandler(false, uuid)
            }
        }
    }, [uuid, onCollideEnd])

}