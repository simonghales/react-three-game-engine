import React, {createContext, FC, useContext, useState} from "react"

type Bodies = {
    [uuid: string]: number,
}

type ContextState = {
    data: {
        bodies: Bodies,
    },
}

const Context = createContext(null as unknown as ContextState)

export const useStoredData = () => {
    return useContext(Context).data
}

const StoredPhysicsData: FC = ({children}) => {

    const [data] = useState<{
        bodies: Bodies
    }>({
        bodies: {},
    })

    return (
        <Context.Provider value={{
            data
        }}>
            {children}
        </Context.Provider>
    )
}

export default StoredPhysicsData