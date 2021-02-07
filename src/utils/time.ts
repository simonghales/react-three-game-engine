const start = Date.now()

export const getNow = () => {
    return start + performance.now()
}