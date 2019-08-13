///<reference path="../types/MediaRecorder.d.ts"/>

import {enable, request_capture, request_capture_with_click, somePrefix} from "./shared";

window.RecorderTabCapSupport = (function (): RecorderTabCapSupport {
    class RecorderTabCapSupportWrapper extends HTMLElement {
        constructor() {
            super();
            this.setAttribute("hidden", "hidden")
        }
    }

    class RecorderTabCapSupportTag extends HTMLElement {
        constructor() {
            super();
            this.setAttribute("hidden", "hidden")
        }
    }

    interface PromiseInfo<T> {
        resolve: (value?: T | PromiseLike<T>) => void;
        reject: (reason?: any) => void;
    }

    let wrapper: undefined | RecorderTabCapSupportWrapper = undefined;
    const promises: { [key: string]: PromiseInfo<any> } = {};
    const result: RecorderTabCapSupport = window.RecorderTabCapSupport || {} as any;

    const sendToContent = (kind: string, {msg = kind, timeout = 1000}: {msg?: string|null, timeout?: number|null} = {}): Promise<any> => {
        if (msg) {
            const requestCapture = new RecorderTabCapSupportTag();
            requestCapture.setAttribute("kind", kind);
            wrapper!.appendChild(requestCapture);
        }
        return new Promise((resolveIn, rejectIn) => {
            let resolve = resolveIn;
            let reject = rejectIn;
            let timer: number|undefined = undefined;

            function reset() {
                timer && clearTimeout(timer);
                timer = undefined;
                resolve = undefined;
                reject = undefined;
            }

            if (timeout) {
                timer = window.setTimeout(function () {
                    const reject1 = reject;
                    reset();
                    reject1(new Error(`timeout for ${kind}`));
                }, timeout)
            }

            function resolve1(value?: any | PromiseLike<any>) {
                const resolve1 = resolve;
                reset();
                if (resolve1) resolve1(value);
                else console.error(`timeout rejected ${kind}`);
            }

            function reject1(value?: any) {
                const reject1 = reject;
                reset();
                if (reject1) reject1(value);
                else console.error(`timeout rejected ${kind}`);
            }

            promises[kind] = {resolve:resolve1, reject:reject1};
        });
    };

    result.enable = async () => {
        if (!window.isSecureContext) throw Error("RecorderTabCapSupport is supported only on the secure context");
        if (promises[enable]) throw new Error("now enabling");

        customElements.define(somePrefix + "-wrapper", RecorderTabCapSupportWrapper);
        document.head.appendChild(wrapper = new RecorderTabCapSupportWrapper());
        customElements.define(somePrefix, RecorderTabCapSupportTag);
        await sendToContent(enable, {msg: null});
    };

    result.getCapture = async (options?: MediaStreamConstraints): Promise<MediaStream> => {
        if (!wrapper) throw new Error("not enabled");
        if (promises[request_capture]) throw new Error("can't get two or more capture");
        let streamId;
        try {
            const {streamId: streamIdIn} = await sendToContent(request_capture);
            streamId = streamIdIn;
        } catch (e) {
            if (e.message == "Extension has not been invoked for the current page (see activeTab permission). Chrome pages cannot be captured.") {
                const {streamId: streamIdIn} = await sendToContent(request_capture_with_click, {timeout:null});
                streamId = streamIdIn;
            } else {
                throw e;
            }
        }
        options.video = (typeof options.video == "object") ? options.video : {};
        const videoOpt = options.video as MediaTrackConstraints;

        videoOpt.mandatory = videoOpt.mandatory || {};
        videoOpt.mandatory.chromeMediaSource = 'tab';
        videoOpt.mandatory.chromeMediaSourceId = streamId;
        return await navigator.mediaDevices.getUserMedia(options);
    };

    result.__callback = (kind, args, reason): void => {
        let {resolve, reject} = promises[kind]!;
        if (reason) reject(reason);
        resolve(args);
    };

    if (result.onLoad)
        result.onLoad();

    Object.defineProperty(result, "onLoad", {
        set(fun: ()=>void) { fun() },
        get() { return undefined }
    });

    return result;
})();
