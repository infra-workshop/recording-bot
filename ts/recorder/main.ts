/// <reference path="../types/MediaRecorder.d.ts" />

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
        const mediaRecorder = new MediaRecorder(canvas.captureStream(), {
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
