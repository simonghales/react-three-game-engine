import React from "react"
import EngineWorkers from "./workers/EngineWorkers";
import {Workers} from "./types";
import PhysicsConsumer from "../physics/consumer/PhysicsConsumer";
import {PHYSICS_UPDATE_RATE} from "../main/worker/planckjs/config";
import PhysicsConsumerSyncMeshes from "../physics/consumer/PhysicsConsumerSyncMeshes";

export const Engine: React.FC<{
    workers: Workers,
    config?: {
        updateRate: number,
    }
}> = ({workers, children, config = {
    updateRate: PHYSICS_UPDATE_RATE,
}}) => {
    return (
        <>
            <EngineWorkers workers={workers}>
                <PhysicsConsumer updateRate={config.updateRate}>
                    <PhysicsConsumerSyncMeshes useRAF/>
                    {children}
                </PhysicsConsumer>
            </EngineWorkers>
        </>
    )
}