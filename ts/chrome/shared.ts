export const tagName = "recorder-tab-cap-support";
export const kind = "kind";
export const request_capture = "request_capture";

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
