import {enable, request_capture, tagName} from "./shared";

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

    const sendToContent = (kind: string, msg: string|undefined = kind, timeout: number|undefined = 10000): Promise<any> => {
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

        customElements.define(tagName + "-wrapper", RecorderTabCapSupportWrapper);
        document.head.appendChild(wrapper = new RecorderTabCapSupportWrapper());
        customElements.define(tagName, RecorderTabCapSupportTag);
        await sendToContent(enable, undefined);
    };

    result.getCapture = async (options?: MediaStreamConstraints): Promise<MediaStream> => {
        if (!wrapper) throw new Error("not enabled");
        if (promises[request_capture]) throw new Error("can't get two or more capture");
        const {streamId} = await sendToContent(request_capture);
        options.video = options.video || {};
        //@ts-ignore
        options.video.mandatory = options.video.mandatory || {};
        //@ts-ignore
        options.video.mandatory.chromeMediaSource = 'tab';
        //@ts-ignore
        options.video.mandatory.chromeMediaSourceId = streamId;
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
