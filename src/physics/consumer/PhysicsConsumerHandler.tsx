import React, {MutableRefObject, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {useWorkersFeatures} from "../../genericWorker/workerApp/WorkerCommunication.context";
import {AvailableFeatures, WorkerMessageData, WorkerMessageTypes} from "../../genericWorker/types";
import {MessagingHandlers, useWorkerMessaging} from "../../genericWorker/workerApp/Workers.context";
import {getNow} from "../../utils/time";
import {Context} from "./PhysicsConsumerHandler.context"
import {getPositionAndAngle} from "../../shared/utils";
import {Object3D} from "three";
import {lerp} from "../../utils/numbers";
import {PHYSICS_UPDATE_RATE} from "../../main/worker/planckjs/config";

export const usePhysicsProviderMessaging = (): MessagingHandlers | null => {
    const workersFeatures = useWorkersFeatures()
    const providerWorker = useMemo(() => {
        return Object.entries(workersFeatures).find(([id, availableFeatures]) => {
            return !!availableFeatures[AvailableFeatures.PHYSICS]
        })
    }, [workersFeatures])
    return useWorkerMessaging(providerWorker ? providerWorker[0] : '') || null
}

type BodyData = {
    ref: MutableRefObject<Object3D>,
    index: number,
    position: [number, number],
    angle: number,
    previous: {
        position: [number, number],
        angle: number,
    },
    lastUpdate: number,
    lastRender: number,
}

type Return = {
    onPhysicsUpdate: (message: WorkerMessageData) => void,
    syncMeshes: () => void,
    syncBody: (id: string, ref: MutableRefObject<Object3D>) => () => void,
    subscribeToOnPhysicsUpdate: (callback: (delta: number) => void) => () => void,
}

const useOnPhysicsUpdate = (updateRate: number): Return => {

    const localStateRef = useRef({
        lastUpdate: getNow(),
        subscriptionsCount: 0,
    })

    const [onPhysicsUpdateCallbacks] = useState<{
        [key: string]: (delta: number) => void,
    }>({})

    const [bodiesData] = useState<{
        [id: string]: BodyData
    }>({})

    const [onFrameCallbacks] = useState<{
        [id: string]: () => void,
    }>({})

    const subscribeToOnPhysicsUpdate = useCallback((callback: (delta: number) => void) => {
        const id = localStateRef.current.subscriptionsCount.toString()
        localStateRef.current.subscriptionsCount += 1
        onPhysicsUpdateCallbacks[id] = callback
        return () => {
            delete onPhysicsUpdateCallbacks[id]
        }
    }, [])

    const syncMeshes = useCallback(() => {
        Object.values(onFrameCallbacks).forEach(callback => callback())
    }, [])

    const lerpMesh = useCallback((body: BodyData, ref: MutableRefObject<Object3D>) => {
        if (!ref.current) return
        const object = ref.current
        const {
            position,
            angle,
            lastUpdate,
            lastRender,
            previous,
        } = body

        const now = getNow()

        const nextExpectedUpdate = lastUpdate + updateRate + 2

        const min = lastUpdate
        const max = nextExpectedUpdate

        let normalised = ((now - min) / (max - min))

        normalised = normalised < 0 ? 0 : normalised > 1 ? 1 : normalised

        const physicsRemainingRatio = normalised

        object.position.x = lerp(
            previous.position[0],
            position[0],
            physicsRemainingRatio
        );
        object.position.y = lerp(
            previous.position[1],
            position[1],
            physicsRemainingRatio
        );

        // const ratio = (now - lastUpdate) / 1000 / (updateRate)
        // var oneMinusRatio = 1 - ratio;
        //
        // object.position.x = (position[0] * ratio) + (previous.position[0] * oneMinusRatio);
        // object.position.y = (position[1] * ratio) + (previous.position[1] * oneMinusRatio);

        object.rotation.z = angle; // todo - lerp

    }, [])

    const syncBody = useCallback((id: string, ref: MutableRefObject<Object3D>) => {
        if (!bodiesData[id]) {
            const position: [number, number] = [ref.current.position.x, ref.current.position.y]
            const angle = ref.current.rotation.z
            bodiesData[id] = {
                ref,
                index: -1,
                position,
                angle,
                previous: {
                    position,
                    angle,
                },
                lastUpdate: getNow(),
                lastRender: getNow(),
            }
        }
        const body = bodiesData[id]
        onFrameCallbacks[id] = () => lerpMesh(body, ref)
        return () => {
            delete onFrameCallbacks[id]
            delete bodiesData[id]
        }
    }, [])

    const updateBodiesData = useCallback((positions: Float32Array, angles: Float32Array, bodies: undefined | string[]) => {
        Object.entries(bodiesData).forEach(([id, bodyData]) => {
            if (bodies) {
                bodyData.index = bodies.indexOf(id)
            }
            if (bodyData.index >= 0) {
                // bodyData.previous.position = bodyData.position
                // bodyData.previous.angle = bodyData.angle
                // bodyData.ref.current.position.x = lerp(bodyData.ref.current.position.x, bodyData.position[0], 0.5)
                // bodyData.ref.current.position.x = lerp(bodyData.ref.current.position.y, bodyData.position[1], 0.5)
                // bodyData.ref.current.rotation.z = bodyData.angle
                bodyData.previous.position = [bodyData.ref.current.position.x, bodyData.ref.current.position.y]
                bodyData.previous.angle = bodyData.ref.current.rotation.z
                const update = getPositionAndAngle({
                    positions,
                    angles,
                }, bodyData.index)
                if (update) {
                    bodyData.position = update.position
                    bodyData.angle = update.angle
                }
            }
        })
    }, [])

    const onPhysicsUpdate = useCallback((message: WorkerMessageData) => {


        const now = getNow();
        const delta = (now - localStateRef.current.lastUpdate) / 1000;
        localStateRef.current.lastUpdate = now;
        // console.log('onPhysicsUpdate', delta)
        // console.log('update delta', delta)

        const positions = message.positions as Float32Array;
        const angles = message.angles as Float32Array;
        const bodies = message.bodies as undefined | string[]
        updateBodiesData(positions, angles, bodies)


        Object.values(onPhysicsUpdateCallbacks).forEach(callback => callback(delta))

    }, [])

    return {
        onPhysicsUpdate,
        syncMeshes,
        syncBody,
        subscribeToOnPhysicsUpdate,
    }

}

const defaultSendMessage = () => {
    console.warn(`Unable to send message to physics worker as it's not connected yet.`)
}

let lastUpdate = getNow()

const PhysicsConsumerHandler: React.FC<{
    updateRate: number,
}> = ({children, updateRate}) => {

    const messagingHandler = usePhysicsProviderMessaging()
    const [waitingForFirstUpdate, setWaitingForFirstUpdate] = useState(false)

    const {onPhysicsUpdate, syncMeshes, syncBody, subscribeToOnPhysicsUpdate} = useOnPhysicsUpdate(updateRate)

    useEffect(() => {
        if (!messagingHandler) return

        const [onMessage, sendMessage] = messagingHandler

        onMessage(event => {
            const message: WorkerMessageData = event.data
            switch (message.type) {
                case WorkerMessageTypes.PHYSICS_CONFIRMED:
                    setWaitingForFirstUpdate(false)
                    break;
                case WorkerMessageTypes.PHYSICS_UPDATE:
                    // console.time('PHYSICS_UPDATE')
                    const now = getNow()
                    const delta = (now - lastUpdate) / 1000
                    lastUpdate = now
                    // console.log('consumer handler delta', delta)
                    onPhysicsUpdate(message)
                    sendMessage({
                        type: WorkerMessageTypes.PHYSICS_PROCESSED,
                        positions: message.positions,
                        angles: message.angles,
                    }, [message.positions.buffer, message.angles.buffer])
                    // console.timeEnd('PHYSICS_UPDATE')
                    break;
            }
        })

        sendMessage({
            type: WorkerMessageTypes.READY_FOR_PHYSICS,
        })

        setWaitingForFirstUpdate(true)

    }, [messagingHandler])

    useEffect(() => {

        if (!waitingForFirstUpdate || !messagingHandler) return

        const [, sendMessage] = messagingHandler

        const interval = setInterval(() => {
            sendMessage({
                type: WorkerMessageTypes.READY_FOR_PHYSICS,
            })
        }, 1000)

        return () => {
            clearInterval(interval)
        }

    }, [waitingForFirstUpdate, messagingHandler])

    return (
        <Context.Provider value={{
            syncMeshes,
            syncBody,
            sendPhysicsMessage: messagingHandler ? messagingHandler[1] : defaultSendMessage,
            subscribeToOnPhysicsUpdate,
        }}>
            {children}
        </Context.Provider>
    )
}

export default PhysicsConsumerHandler