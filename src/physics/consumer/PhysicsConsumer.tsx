import React, {useEffect} from "react"
import {useRegisterFeature} from "../../genericWorker/workerApp/WorkerCommunication.context";
import {AvailableFeatures} from "../../genericWorker/types";
import PhysicsConsumerHandler from "./PhysicsConsumerHandler";

const PhysicsConsumer: React.FC<{
    updateRate: number,
}> = ({children, updateRate}) => {

    const registerFeature = useRegisterFeature()

    useEffect(() => {
        console.log('registering consume physics')
        registerFeature(AvailableFeatures.CONSUME_PHYSICS)
    }, [])

    return (
        <>
            <PhysicsConsumerHandler updateRate={updateRate}>
                {children}
            </PhysicsConsumerHandler>
        </>
    )
}

export default PhysicsConsumer