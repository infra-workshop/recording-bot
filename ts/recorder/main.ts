/// <reference path="../types/MediaRecorder.d.ts" />
///<reference path="../types/window.d.ts"/>

import "../chrome-header/header";

class AudioPlayer {
    private readonly connectTo: AudioNode;
    private nextPlay = 0;

    constructor(connectTo: AudioNode) {
        this.connectTo = connectTo;
    }

    async onData(buffer: ArrayBuffer) {
        try {
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
}

async function main () {
    try {
        await window.RecorderTabCapSupport.enable();
        console.log(window.innerWidth);
        console.log(window.innerHeight);
        const screenStream = await window.RecorderTabCapSupport.getCapture({
            audio: false,
            video: {
                mandatory: {
                    minWidth: window.innerWidth,
                    maxWidth: window.innerWidth,
                    minHeight: window.innerHeight,
                    maxHeight: window.innerHeight,
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
            players.set(user, new AudioPlayer(audioDestination));
        };
        window.endAudio = (user) => {
            players.set(user, new AudioPlayer(audioDestination));
        };

        window.playAudio = async (user: string, buffer: ArrayBuffer) => {
            players.get(user) && players.get(user).onData(buffer);
        };

        const mediaRecorder = new MediaRecorder(recordStream, {
            mimeType: "video/webm"
        });
        video1.addEventListener("loadedmetadata", () => {
            tick();
            mediaRecorder.start()
        });
        stop.addEventListener("click", () => {
            mediaRecorder.stop();
            mediaRecorder.addEventListener("dataavailable", (e) => {
                const download = document.getElementById("download") as HTMLAnchorElement;
                download.download = "video.webm";
                download.href = window.URL.createObjectURL(e.data);
            });
        });
        const play1 = video1.play();
        await play1;
    } catch (e) {
        console.error(e);
    }
}
(window.RecorderTabCapSupport || (window.RecorderTabCapSupport = {} as any)).onLoad = main;
//else document.addEventListener("load", main);
