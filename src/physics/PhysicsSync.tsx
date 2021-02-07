import React, {useCallback, useEffect, useRef, useState} from "react"
import {usePhysics} from "./Physics.context";
import {useWorkersFeatures} from "../genericWorker/workerApp/WorkerCommunication.context";
import {AvailableFeatures, WorkerMessageData, WorkerMessageTypes} from "../genericWorker/types";
import {generateBuffers} from "../main/worker/utils";
import {useWorkerMessaging} from "../genericWorker/workerApp/Workers.context";
import {Body} from "planck-js";
import {Buffers} from "../main/worker/shared/types";
import {getNow} from "../utils/time";

const usePhysicsConsumerWorkers = () => {
    const workersFeatures = useWorkersFeatures()
    return Object.entries(workersFeatures).filter(([id, availableFeatures]) => {
        return !!availableFeatures[AvailableFeatures.CONSUME_PHYSICS]
    }).map(([id]) => id)
}

const applyBufferData = (
    buffers: Buffers,
    syncedBodies: {
        [key: string]: Body,
    }, syncedBodiesOrder: string[]) => {

    const {
        positions,
        angles,
    } = buffers

    syncedBodiesOrder.forEach((id, index) => {
        const body = syncedBodies[id]
        if (!body) return;
        const position = body.getPosition();
        const angle = body.getAngle();
        positions[2 * index + 0] = position.x;
        positions[2 * index + 1] = position.y;
        angles[index] = angle;
    })

}

const PhysicsConsumer: React.FC<{
    id: string,
    registerWorker: (onUpdate: (count: number) => void) => void,
}> = ({id, registerWorker}) => {

    const {
        syncedBodies, syncedBodiesOrder,
        maxNumberOfSyncedBodies,
        syncedBodiesUpdateCount,
        onBodyMethod
    } = usePhysics()

    const [onMessage, sendMessage] = useWorkerMessaging(id)
    const [buffers] = useState(() => generateBuffers(maxNumberOfSyncedBodies))
    const localStateRef = useRef<{
        lastSentStep: number,
        lastUpdate: number,
        pendingUpdate: null | number,
        buffersAvailable: boolean,
    }>({
        lastSentStep: -1,
        lastUpdate: getNow(),
        pendingUpdate: null,
        buffersAvailable: false,
    })
    const needToSyncBodies = useRef(true)

    useEffect(() => {
        needToSyncBodies.current = true
    }, [syncedBodiesUpdateCount])

    const sendUpdate = useCallback((count: number) => {
        if (!localStateRef.current.buffersAvailable) {
            localStateRef.current.pendingUpdate = count
            return
        }
        if (count <= localStateRef.current.lastSentStep) {
            return
        }
        // console.log('send update!')
        // console.time('sendUpdate')
        localStateRef.current.buffersAvailable = false
        localStateRef.current.lastSentStep = count

        applyBufferData(buffers, syncedBodies, syncedBodiesOrder)

        const {
            positions,
            angles,
        } = buffers

        const message: any = {
            type: WorkerMessageTypes.PHYSICS_UPDATE,
            physicsTick: count,
            positions: positions,
            angles: angles,
        }

        if (needToSyncBodies.current) {
            needToSyncBodies.current = false
            message.bodies = syncedBodiesOrder
        }

        // console.log('send update', count)
        const now = getNow()
        const diff = localStateRef.current.lastUpdate - now
        localStateRef.current.lastUpdate = now
        // console.log('diff?', diff)
        sendMessage(message, [positions.buffer, angles.buffer])
        // console.timeEnd(`updateStep-${count}`)
        // console.timeEnd('sendUpdate')

    }, [])

    const handleBuffersReady = useCallback(() => {
        localStateRef.current.buffersAvailable = true
        if (localStateRef.current.pendingUpdate !== null) {
            sendUpdate(localStateRef.current.pendingUpdate)
            localStateRef.current.pendingUpdate = null
        }
    }, [])

    useEffect(() => {
        registerWorker(sendUpdate)
    }, [])

    useEffect(() => {
        return onMessage(event => {
            const message = event.data as WorkerMessageData
            switch (message.type) {
                case WorkerMessageTypes.PHYSICS_PROCESSED:
                    buffers.positions = message.positions
                    buffers.angles = message.angles
                    handleBuffersReady()
                    break;
                case WorkerMessageTypes.READY_FOR_PHYSICS:
                    handleBuffersReady()
                    sendMessage({
                        type: WorkerMessageTypes.PHYSICS_CONFIRMED,
                    })
                    break;
                case WorkerMessageTypes.PHYSICS_BODY_METHOD:
                    onBodyMethod(message.body as string, message.method as string, message.args as any)
                    break;
            }
        })
    }, [])

    return null
}

const PhysicsSync: React.FC<{
    registerWorker: (onUpdate: (count: number) => void) => void,
}> = ({
                             registerWorker,
}) => {
    const physicsConsumers = usePhysicsConsumerWorkers()
    return (
        <>
            {
                physicsConsumers.map((id) => (
                    <PhysicsConsumer registerWorker={registerWorker} id={id} key={id}/>
                ))
            }
        </>
    )
}

export default PhysicsSync