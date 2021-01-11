import {createContext} from "react";
import {World} from "planck-js";

export type AppContextState = {
    world: World,
}

export const AppContext = createContext(null as unknown as AppContextState)