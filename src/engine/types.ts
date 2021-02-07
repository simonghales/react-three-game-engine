export type Workers = {
    [key: string]: {
        worker: Worker,
        connectTo?: string[],
    }
}