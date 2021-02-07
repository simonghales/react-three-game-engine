import React from "react"

export const WorkerApp: React.FC<{
    worker: Worker
    app: any
}> = ({worker, app}) => {

    const App = app

    return (
        <App worker={worker}/>
    )
}