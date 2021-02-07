import {createContext, useContext} from "react";
import {AvailableFeatures, AvailableFeaturesData} from "../types";

type State = {
    registerFeature: (feature: AvailableFeatures) => void,
    workersFeatures: {
        [key: string]: AvailableFeaturesData
    }
}

export const Context = createContext<State>(null as unknown as State)

export const useRegisterFeature = () => {
    return useContext(Context).registerFeature
}

export const useWorkersFeatures = () => {
    return useContext(Context).workersFeatures
}