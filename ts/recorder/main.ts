/// <reference path="../types/MediaRecorder.d.ts" />
///<reference path="../types/window.d.ts"/>

import "../chrome-header/header";

class AudioPlayer {
    private readonly connectTo: AudioNode;
    private readonly nodes: ArrayBuffer[];
    private readonly user: string;
    private nextPlay = 0;

    constructor(user: string, connectTo: AudioNode, debug: boolean) {
        this.connectTo = connectTo;
        this.user = user;
        if (debug) this.nodes = [];
    }

    async onData(buffer: ArrayBuffer) {
        try {
            this.nodes && this.nodes.push(buffer.slice(0));
            // source を作成
            const source = this.connectTo.context.createBufferSource();
            // buffer をセット
            source.buffer = await this.connectTo.context.decodeAudioData(buffer);
            // context に connect
            source.connect(this.connectTo);
            // 再生

            if (this.nextPlay == 0) {
                this.nextPlay = this.connectTo.context.currentTime + 0.5;
            }
            console.log("play at : " + this.nextPlay);
            source.start(this.nextPlay);
            this.nextPlay += source.buffer!.duration;
        } catch (e) {
            if (e instanceof DOMException) {
                console.error("error", e.message, e);
            } else {
                console.error("error", e);
            }
        }
    }

    async onEnd() {
        if (this.nodes) {
            window.sendDebugVoice(this.user, this.nodes.map(it => new Uint8Array(it)));
        }
    }
}

async function main () {
    let debug: boolean = false;
    try {
        await window.RecorderTabCapSupport.enable();
        const width = window.innerWidth;
        const height = window.innerHeight;
        console.log(width);
        console.log(height);
        const screenStream = await window.RecorderTabCapSupport.getCapture({
            audio: false,
            video: {
                mandatory: {
                    minWidth: width,
                    maxWidth: width,
                    minHeight: height,
                    maxHeight: height,
                }
            } as any
        });
        const video1 = document.getElementById("screen-video") as HTMLVideoElement;
        const canvas = document.getElementById("resize-canvas") as HTMLCanvasElement;
        const stop = document.getElementById("stop") as HTMLInputElement;
        const ctx = canvas.getContext("2d")!;
        video1.srcObject = screenStream;
        const tick = () => {
            ctx.drawImage(video1, 10, 10, 1280, 720, 0, 0, 1280, 720);
            window.requestAnimationFrame(tick);
        };
        const recordStream = new MediaStream();
        (window as any).recordStream = recordStream;
        for (let track of canvas.captureStream().getTracks()) {
            recordStream.addTrack(track);
        }
        const audioContext = new AudioContext();
        const audioDestination = audioContext.createMediaStreamDestination();

        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.connect(audioDestination);

        for (let track of audioDestination.stream.getTracks()) {
            recordStream.addTrack(track)
        }

        const players = new Map<string, AudioPlayer>();
        window.startAudio = (user) => {
            players.set(user, new AudioPlayer(user, audioDestination, debug));
        };
        window.endAudio = (user) => {
            players.get(user) && players.get(user).onEnd();
            players.delete(user);
        };

        window.playAudio = async (user: string, buffer: ArrayBuffer) => {
            players.get(user) && players.get(user).onData(buffer);
        };

        window.stopRecording = () => new Promise((resolve, reject) => {
            mediaRecorder.stop();
            mediaRecorder.addEventListener("error", (e) => {
                reject(e)
            });
            mediaRecorder.addEventListener("dataavailable", (e) => {
                resolve(e.data);
            });
        });

        window.takeShot = () => new Promise<Blob>(resolve => { canvas.toBlob(blob => resolve(blob)) });
        window.debug = (on: boolean) => debug = on;

        const mediaRecorder = new MediaRecorder(recordStream, {
            mimeType: "video/webm"
        });
        video1.addEventListener("loadedmetadata", () => {
            tick();
            mediaRecorder.start()
        });
        stop.addEventListener("click", async () => {
            const download = document.getElementById("download") as HTMLAnchorElement;
            download.download = "video.webm";
            download.href = window.URL.createObjectURL(await window.stopRecording());
        });
        await video1.play();
    } catch (e) {
        console.error(e);
    }
}
(window.RecorderTabCapSupport || (window.RecorderTabCapSupport = {} as any)).onLoad = main;
//else document.addEventListener("load", main);
