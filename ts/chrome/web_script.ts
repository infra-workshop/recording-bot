import {enable, kind, request_capture, tagName} from "./shared";

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
        others?: any
    }

    let wrapper: undefined | RecorderTabCapSupportWrapper = undefined;
    const promises: { [key: string]: PromiseInfo<any> } = {};
    const result: RecorderTabCapSupport = window.RecorderTabCapSupport || {} as any;

    result.enable = () => {
        if (!window.isSecureContext) throw Error("RecorderTabCapSupport is supported only on the secure context");
        if (promises[enable]) throw new Error("now enabling");
        return new Promise((resolve, reject) => {
            promises[enable] = {resolve, reject};

            customElements.define(tagName + "-wrapper", RecorderTabCapSupportWrapper);
            document.head.appendChild(wrapper = new RecorderTabCapSupportWrapper());
            customElements.define(tagName, RecorderTabCapSupportTag);
        })
    };

    result.getCapture = (options?: MediaStreamConstraints): Promise<MediaStream> => {
        if (!wrapper) throw new Error("not enabled");
        if (promises[request_capture]) throw new Error("can't get two or more capture");
        return new Promise((resolve, reject) => {
            promises[request_capture] = {resolve, reject, others: options}

            const requestCapture = new RecorderTabCapSupportTag();
            requestCapture.setAttribute(kind, request_capture);
            wrapper!.appendChild(requestCapture);
        })
    };

    result.__callback = (kind, args, reason): void => {
        let {resolve, reject, others} = promises[kind]!;
        if (reason) reject(reason);
        switch (kind) {
            case request_capture: {
                const options = others || {};
                options.video = options.video || {};
                // @ts-ignore
                options.video.mandatory = options.video.mandatory || {};
                // @ts-ignore
                options.video.mandatory.chromeMediaSource = 'tab';
                // @ts-ignore
                options.video.mandatory.chromeMediaSourceId = args.streamId;
                navigator.mediaDevices.getUserMedia(options)
                    .then(resolve, reject);
                break;
            }

            case enable: {
                resolve();
            }
        }
    };

    if (result.onLoad)
        result.onLoad();

    Object.defineProperty(result, "onLoad", {
        set(fun: ()=>void) { fun() },
        get() { return undefined }
    });

    return result;
})();
