import { useCallback } from 'react';
import {
  MessageKeys,
  SyncComponentMessageInfo,
  SyncComponentMessageType,
} from '../../../shared/types';
import {useSendMessageToMain} from "../../ApiWrapper";

export const useSendSyncComponentMessage = () => {
  const sendMessageRaw = useSendMessageToMain();

  const sendMessage = useCallback(
    (
      messageType: SyncComponentMessageType,
      info: SyncComponentMessageInfo,
      data?: any
    ) => {
      sendMessageRaw({
        key: MessageKeys.SYNC_COMPONENT,
        data: {
          messageType,
          info,
          data,
        },
      });
    },
    [sendMessageRaw]
  );

  return sendMessage;
};
