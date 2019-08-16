/// <reference path="../types/MediaRecorder.d.ts" />
///<reference path="../types/window.d.ts"/>

import "../chrome-header/header";

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
        for (let track of canvas.captureStream().getTracks()) {
            recordStream.addTrack(track)
        }
        const audioContext = new AudioContext();
        const audioDestination = audioContext.createMediaStreamDestination();
        const oscillator = audioContext.createOscillator();

        oscillator.type = 'sine';
        oscillator.frequency.value = 0; // 値はHz(ヘルツ)
        oscillator.connect(audioDestination);
        oscillator.start();

        for (let track of audioDestination.stream.getTracks()) {
            recordStream.addTrack(track)
        }

        window.playAudio = async (buffer: ArrayBuffer) => {
            // source を作成
            const source = audioContext.createBufferSource();
            // buffer をセット
            source.buffer = await audioContext.decodeAudioData(buffer);
            // context に connect
            source.connect(audioDestination);
            // 再生
            source.start(0);
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
