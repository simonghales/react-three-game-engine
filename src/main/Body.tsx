import React, {MutableRefObject, ReactElement, useRef} from "react"
import {ValidUUID} from "./worker/shared/types";
import {Object3D} from "three";
import {BodyApi, BodyParams, useBody, useBodyApi} from "./hooks/useBody";
import {AddBodyDef} from "./worker/planckjs/bodies";
import { useSubscribeMesh } from "../shared/MeshSubscriptions";

export const BodySync: React.FC<{
    children: ({uuid, ref, api}: {uuid: ValidUUID, ref: MutableRefObject<Object3D>, api?: BodyApi}) => ReactElement,
    uuid: ValidUUID,
    applyAngle?: boolean,
    isDynamic?: boolean,
    bodyRef?: MutableRefObject<Object3D>,
    wrapWithGroup?: boolean,
}> = ({
     children,
     uuid,
     bodyRef,
     applyAngle = true,
     isDynamic = true,
     wrapWithGroup = false,
 }) => {

    const localRef = useRef<Object3D>(new Object3D())

    const ref = bodyRef ?? localRef

    useSubscribeMesh(uuid, ref.current, applyAngle, isDynamic)

    const api = useBodyApi(uuid)

    const inner = children({uuid, ref, api: api ?? undefined})

    if (wrapWithGroup) {
        return (
            <group ref={ref}>
                {inner}
            </group>
        )
    }

    return inner

}

export const Body: React.FC<{
    children: ({uuid, ref, api}: {uuid: ValidUUID, ref: MutableRefObject<Object3D>, api: BodyApi}) => ReactElement,
    bodyDef: AddBodyDef,
    params?: BodyParams,
    wrapWithGroup?: boolean,
}> = ({children, params, bodyDef, wrapWithGroup}) => {

    const [ref, api, uuid] = useBody(() => bodyDef, params)

    const inner = children({ref, uuid, api})

    if (wrapWithGroup) {
        return (
            <group ref={ref}>
                {inner}
            </group>
        )
    }

    return inner
}