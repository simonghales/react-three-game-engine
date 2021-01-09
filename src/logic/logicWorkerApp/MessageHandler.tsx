import React, {useEffect} from "react"
import {useMessagesContext} from "../../shared/Messages";
import {WorkerOwnerMessageType} from "../../main/worker/shared/types";
import {MessageData} from "../../shared/types";

const MessageHandler: React.FC<{
    worker: Worker,
}> = ({children, worker}) => {

    const { handleMessage } = useMessagesContext();

    useEffect(() => {

        worker.onmessage = (event: MessageEvent) => {
            const type = event.data.type;

            switch (type) {
                case WorkerOwnerMessageType.MESSAGE:
                    handleMessage(event.data.message as MessageData);
                    break;
            }
        };
    }, [worker]);

    return (
        <>
            {children}
        </>
    )
}

export default MessageHandler