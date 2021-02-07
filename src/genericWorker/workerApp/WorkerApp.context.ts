import {createContext, useContext} from "react";

type State = {
    worker: Worker
}

export const Context = createContext(null as unknown as State)

export const useWorker = () => {
    return useContext(Context).worker
}