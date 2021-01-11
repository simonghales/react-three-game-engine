import React, {
  createContext,
  MutableRefObject,
  useContext,
  useRef,
  useState,
} from 'react';
import { ValidUUID } from '../shared/types';
import { Body } from 'planck-js';

type BodiesMap = Map<ValidUUID, Body>;
type DynamicBodies = Set<ValidUUID>;
type CollisionListeners = Set<ValidUUID>;

type ContextState = {
  bodies: BodiesMap;
  dynamicBodies: DynamicBodies;
  collisionListeners: CollisionListeners;
  bodiesNeedSync: boolean;
  setBodiesNeedSync: (bool: boolean) => void;
  bodiesNeedSyncRef: MutableRefObject<boolean>;
  logicBodiesNeedSyncRef: MutableRefObject<boolean>;
};

const Context = createContext((null as unknown) as ContextState);

export const useWorldState = (): ContextState => {
  return useContext(Context);
};

export const WorldState: React.FC = ({ children }) => {
  const [bodies] = useState<BodiesMap>(() => new Map());
  const [dynamicBodies] = useState<DynamicBodies>(() => new Set());
  const [collisionListeners] = useState<CollisionListeners>(() => new Set());
  const [bodiesNeedSync, setBodiesNeedSync] = useState(false);
  const bodiesNeedSyncRef = useRef(false);
  const logicBodiesNeedSyncRef = useRef(false);

  return (
    <Context.Provider
      value={{
        bodies,
        dynamicBodies,
        collisionListeners,
        bodiesNeedSync,
        setBodiesNeedSync,
        bodiesNeedSyncRef,
        logicBodiesNeedSyncRef,
      }}
    >
      {children}
    </Context.Provider>
  );
};
