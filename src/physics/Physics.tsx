import React, {FC} from "react";
import PhysicsWorker from "./PhysicsWorker";
import PhysicsSync from "./PhysicsSync";

export const Physics: FC<{
    maxNumberOfPhysicsObjects?: number,
}> = ({
    children,
    maxNumberOfPhysicsObjects = 100
}) => {

    return (
        <PhysicsWorker maxNumberOfPhysicsObjects={maxNumberOfPhysicsObjects}>
            {children}
        </PhysicsWorker>
    )
}