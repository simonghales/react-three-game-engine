import React from "react";
import Workers from "./workerApp/Workers";
import {Context} from "./workerApp/WorkerApp.context";

const WorkerWrapper: React.FC<{
    worker: Worker,
}> = ({children, worker}) => {
    return (
        <Context.Provider value={{worker}}>
            <Workers worker={worker}>
                {children}
            </Workers>
        </Context.Provider>
    )
}

export const withWorkerWrapper = (WrappedComponent: any) => {
    return (props: any) => {
        return (
            <WorkerWrapper {...props}>
                <WrappedComponent />
            </WorkerWrapper>
        );
    };
};
