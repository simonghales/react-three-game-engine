import React, { useEffect, useState } from 'react';
import { useSubscribeToMessage } from './Messages';
import {
  MappedComponents,
  MessageKeys,
  SyncComponentMessage,
  SyncComponentMessageType,
  SyncComponentType,
  ValidProps,
} from '../shared/types';

const LogicHandler: React.FC<{
  mappedComponentTypes: MappedComponents;
}> = ({ children, mappedComponentTypes }) => {
  const subscribeToMessage = useSubscribeToMessage();

  const [components, setComponents] = useState<{
    [key: string]: {
      componentType: SyncComponentType;
      props: ValidProps;
    };
  }>({});

  useEffect(() => {
    const unsubscribe = subscribeToMessage(
      MessageKeys.SYNC_COMPONENT,
      ({ info, messageType, data }: SyncComponentMessage) => {
        const props = data || {};

        switch (messageType) {
          case SyncComponentMessageType.MOUNT:
            setComponents(state => {
              return {
                ...state,
                [info.componentKey]: {
                  componentType: info.componentType,
                  props,
                },
              };
            });
            break;
          case SyncComponentMessageType.UPDATE:
            setComponents(state => {
              return {
                ...state,
                [info.componentKey]: {
                  componentType: info.componentType,
                  props,
                },
              };
            });
            break;
          case SyncComponentMessageType.UNMOUNT:
            setComponents(state => {
              let update = {
                ...state,
              };
              delete update[info.componentKey];
              return update;
            });
            break;
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      {children}
      {Object.entries(components).map(([key, { componentType, props }]) => {
        const Component = mappedComponentTypes[componentType];
        return Component ? <Component key={key} {...props} /> : null;
      })}
    </>
  );
};

export default LogicHandler;
