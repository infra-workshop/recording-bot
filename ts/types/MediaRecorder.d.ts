declare global {
    interface MediaRecorderErrorEvent extends Event {
        name: string;
    }

    interface MediaRecorderDataAvailableEvent extends Event {
        data: any;
    }

    interface MediaRecorderEventMap {
        'dataavailable': MediaRecorderDataAvailableEvent;
        'error': MediaRecorderErrorEvent;
        'pause': Event;
        'resume': Event;
        'start': Event;
        'stop': Event;
        'warning': MediaRecorderErrorEvent;
    }

    interface MediaRecorderOptions {
        mimeType?: string;
        audioBitsPerSecond?: number;
        videoBitsPerSecond?: number;
        bitsPerSecond?: number;
    }

    class MediaRecorder extends EventTarget {

        readonly mimeType: string;
        readonly state: 'inactive' | 'recording' | 'paused';
        readonly stream: MediaStream;
        ignoreMutedMedia: boolean;
        videoBitsPerSecond: number;
        audioBitsPerSecond: number;

        ondataavailable: (event: MediaRecorderDataAvailableEvent) => void;
        onerror: (event: MediaRecorderErrorEvent) => void;
        onpause: () => void;
        onresume: () => void;
        onstart: () => void;
        onstop: () => void;

        constructor(stream: MediaStream, options?: MediaRecorderOptions);

        start(): void;

        stop(): void;

        resume(): void;

        pause(): void;

        isTypeSupported(type: string): boolean;

        requestData(): void;

        addEventListener<K extends keyof MediaRecorderEventMap>(type: K, listener: (this: MediaStream, ev: MediaRecorderEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;

        addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

        removeEventListener<K extends keyof MediaRecorderEventMap>(type: K, listener: (this: MediaStream, ev: MediaRecorderEventMap[K]) => any, options?: boolean | EventListenerOptions): void;

        removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;

    }

    interface HTMLCanvasElement {
        captureStream(frameRate?: number): MediaStream;
    }

    interface MediaTrackConstraints extends MediaTrackConstraintSet {
        advanced?: MediaTrackConstraintSet[];
        mandatory?: any;
    }

    interface MediaStreamConstraints {
        audio?: boolean | MediaTrackConstraints;
        peerIdentity?: string;
        video?: boolean | MediaTrackConstraints;
    }
}
export = undefined;