import React from 'react';
import { MessageData } from './types';
declare type MessagesContextState = {
    handleMessage: (message: MessageData) => void;
    subscribeToMessage: (messageKey: string, callback: (data: any) => void) => () => void;
};
export declare const useMessagesContext: () => MessagesContextState;
export declare const useOnMessage: () => (messageKey: string, callback: (data: any) => void) => () => void;
declare const Messages: React.FC;
export default Messages;
