import React, {useEffect} from "react"
import {useSyncMeshes} from "./PhysicsConsumerHandler.context";
import {useFrame} from "react-three-fiber";

const RAFSync: React.FC = () => {

    const syncMeshes = useSyncMeshes()
    useFrame(syncMeshes)

    return null
}

const IntervalSync: React.FC = () => {

    const syncMeshes = useSyncMeshes()

    useEffect(() => {
        const interval = setInterval(() => {
            syncMeshes()
        }, 1000 / 30)
        return () => {
            clearInterval(interval)
        }
    }, [])

    return null
}

const PhysicsConsumerSyncMeshes: React.FC<{
    useRAF?: boolean
}> = ({
    useRAF = false,
}) => {
    if (useRAF) return <RAFSync/>
    return <IntervalSync/>
}

export default PhysicsConsumerSyncMeshes