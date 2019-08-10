/// <reference path="../types/MediaRecorder.d.ts" />

import {desktopCapturer} from 'electron';

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
                break
            }
        }
    } catch (e) {
        console.error(e);
    }
})();
