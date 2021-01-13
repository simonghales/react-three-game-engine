export declare enum MessageKeys {
    SYNC_COMPONENT = "SYNC_COMPONENT"
}
export declare type MessageData = {
    key: string;
    data: any;
};
export declare enum SyncComponentMessageType {
    MOUNT = 0,
    UNMOUNT = 1,
    UPDATE = 2
}
export declare enum SyncComponentType {
    PLAYER = 0
}
export declare type SyncComponentMessageInfo = {
    componentType: SyncComponentType;
    componentKey: string;
};
export declare type ValidProps = undefined | {
    [key: string]: any;
};
export declare type SyncComponentMessage = {
    data: ValidProps;
    info: SyncComponentMessageInfo;
    messageType: SyncComponentMessageType;
};
export declare type MappedComponents = {
    [key: string]: any;
};
