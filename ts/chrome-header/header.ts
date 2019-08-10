
export {};

declare global {
    interface RecorderTabCapSupport{
        enable(): void
        getCapture(options?: MediaStreamConstraints): Promise<MediaStream>
        __getCaptureCallback(streamId: string, reason: any): void
    }

    interface Window {
        RecorderTabCapSupport: RecorderTabCapSupport;
    }
}
