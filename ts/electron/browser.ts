import {ipcRenderer, desktopCapturer} from 'electron';
import {endianness} from "os";

// region type def

declare interface MediaRecorderErrorEvent extends Event {
    name: string;
}

declare interface MediaRecorderDataAvailableEvent extends Event {
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

declare interface MediaRecorderOptions {
    mimeType?: string;
    audioBitsPerSecond?: number;
    videoBitsPerSecond?: number;
    bitsPerSecond?: number;
}

declare class MediaRecorder extends EventTarget {

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

declare global {
    interface HTMLCanvasElement {
        captureStream(frameRate?: number): MediaStream;
    }
}

//endregion

let end: any;

(async function () {
    try {
        const sources = await desktopCapturer.getSources({types: ['window']});
        const title = document.title;
        for (const source of sources) {
            if (source.name === title) {
                console.log("source got");
                const screenStream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: source.id,
                            minWidth: window.innerWidth,
                            maxWidth: window.innerWidth,
                            minHeight: window.innerHeight,
                            maxHeight: window.innerHeight
                        }
                    } as any
                });
                console.log(window.innerWidth);
                console.log(window.innerHeight);
                const video1 = document.getElementById("screen-video") as HTMLVideoElement;
                const canvas = document.getElementById("resize-canvas") as HTMLCanvasElement;
                const stop = document.getElementById("stop") as HTMLInputElement;
                const ctx = canvas.getContext("2d")!;
                video1.srcObject = screenStream;


                const tick = () => {
                    ctx.drawImage(video1, 10, 10, 1280, 720, 0, 0, 1280, 720);
                    window.requestAnimationFrame(tick);
                };

                const mediaRecorder = new MediaRecorder(canvas.captureStream(), {
                    mimeType: "video/webm"
                });

                video1.addEventListener("loadedmetadata", () => {
                    tick();
                    mediaRecorder.start()
                });

                // @ts-ignore
                window.end = function() {
                    mediaRecorder.stop();
                    mediaRecorder.addEventListener("dataavailable", (e) => {
                        console.log("stop");
                        const download = document.getElementById("download") as HTMLAnchorElement;
                        download.download = "video.webm";
                        download.href = window.URL.createObjectURL(e.data);
                        const blobReader = new FileReader();
                        blobReader.onload = () => {
                            console.log("send download");
                            ipcRenderer.send("download", new Uint8Array(blobReader.result as ArrayBuffer))
                        };
                        blobReader.readAsArrayBuffer(e.data as Blob);
                    });
                };

                stop.addEventListener("click", () => {
                    // @ts-ignore
                    end();
                });

                const play1 = video1.play();
                await play1;
                break
            }
        }
    } catch (e) {
        console.error(e);
    }
})();
