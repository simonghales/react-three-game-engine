export const getNow = () => {
    return performance.timing.navigationStart + performance.now()
}