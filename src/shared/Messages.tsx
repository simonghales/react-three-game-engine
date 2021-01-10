import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { MessageData } from './types';

type MessagesContextState = {
  handleMessage: (message: MessageData) => void;
  subscribeToMessage: (
    messageKey: string,
    callback: (data: any) => void
  ) => () => void;
};

const MessagesContext = createContext(
  (null as unknown) as MessagesContextState
);

export const useMessagesContext = () => {
  return useContext(MessagesContext);
};

export const useOnMessage = () => {
  return useMessagesContext().subscribeToMessage;
};

const Messages: React.FC = ({ children }) => {
  const messageCountRef = useRef(0);
  const [messageSubscriptions] = useState<{
    [key: string]: {
      [id: number]: (data: any) => void;
    };
  }>({});

  const subscribeToMessage = useCallback(
    (messageKey: string, callback: (data: any) => void) => {
      const id = messageCountRef.current;
      messageCountRef.current += 1;

      if (!messageSubscriptions[messageKey]) {
        messageSubscriptions[messageKey] = {
          [id]: callback,
        };
      } else {
        messageSubscriptions[messageKey][id] = callback;
      }

      const unsubscribe = () => {
        delete messageSubscriptions[messageKey][id];
      };

      return unsubscribe;
    },
    [messageSubscriptions]
  );

  const handleMessage = useCallback(
    ({ key, data }: MessageData) => {

      const subscriptions = messageSubscriptions[key];

      if (subscriptions) {
        Object.values(subscriptions).forEach(subscription => {
          subscription(data);
        });
      }
    },
    [messageSubscriptions]
  );

  return (
    <MessagesContext.Provider
      value={{
        handleMessage,
        subscribeToMessage,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export default Messages;
