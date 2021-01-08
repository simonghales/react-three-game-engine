import { useCallback, useEffect, useMemo } from 'react';
import {
  SyncComponentMessageType,
  SyncComponentType,
} from '../../../shared/types';
import { useSendSyncComponentMessage } from './messaging';

export const useSyncWithMainComponent = (
  componentType: SyncComponentType,
  componentKey: string,
  initialProps?: any
) => {
  const sendMessage = useSendSyncComponentMessage();

  const info = useMemo(
    () => ({
      componentType,
      componentKey,
    }),
    [componentType, componentKey]
  );

  const updateProps = useCallback(
    (props: any) => {
      sendMessage(SyncComponentMessageType.UPDATE, info, props);
    },
    [info]
  );

  useEffect(() => {
    sendMessage(SyncComponentMessageType.MOUNT, info, initialProps);

    return () => {
      sendMessage(SyncComponentMessageType.UNMOUNT, info);
    };
  }, [info]);

  return updateProps;
};
