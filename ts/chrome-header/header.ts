
export {};

declare global {
    interface RecorderTabCapSupport{
        enable(): Promise<void>
        getCapture(options?: MediaStreamConstraints): Promise<MediaStream>
        __callback(kind: string, args: any, reason: any): void
        onLoad?: () => void
    }

    interface Window {
        RecorderTabCapSupport: RecorderTabCapSupport;
    }
}
