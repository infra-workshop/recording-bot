import {kind, request_capture, tagName} from "./shared";

export {};
declare global {
    interface RecorderTabCapSupport{
        enable(): void
        getCapture(options?: MediaStreamConstraints): Promise<MediaStream>
        __getCaptureCallback(streamId: string, reason: any): void
    }

    interface Window {
        RecorderTabCapSupport: RecorderTabCapSupport;
    }
}

window.RecorderTabCapSupport = (function (): RecorderTabCapSupport {
    class RecorderTabCapSupportWrapper extends HTMLElement {
        constructor() {
            super();
            this.setAttribute("hidden", "hidden")
        }
    }
    class RecorderTabCapSupport extends HTMLElement {
        constructor() {
            super();
            this.setAttribute("hidden", "hidden")
        }
    }
    let wrapper: undefined|RecorderTabCapSupportWrapper = undefined;
    let getCapturePromise: undefined|{resolve: (value?: MediaStream | PromiseLike<MediaStream>) => void, reject: (reason?: any) => void, options?: MediaStreamConstraints} = undefined;
    return {
        enable() {
            if (!window.isSecureContext) throw Error("RecorderTabCapSupport is supported only on the secure context");
            customElements.define(tagName+"-wrapper", RecorderTabCapSupportWrapper);
            document.appendChild(new RecorderTabCapSupportWrapper());
            customElements.define(tagName, RecorderTabCapSupport);
        },

        getCapture(options?: MediaStreamConstraints): Promise<MediaStream>{
            if (!wrapper) throw new Error("not enabled");
            if (getCapturePromise) throw new Error("can't get two or more capture");
            const requestCapture = new RecorderTabCapSupport();
            requestCapture.setAttribute(kind, request_capture);
            wrapper.appendChild(requestCapture);
            return new Promise((resolve, reject) => {
                getCapturePromise = {resolve, reject, options}
            })
        },

        __getCaptureCallback(streamId: string, reason: any): void {
            let {resolve, reject, options} = getCapturePromise!;
            if (reason) reject(reason);
            options = options || {};
            // @ts-ignore
            options.mandatory = options.mandatory || {};
            // @ts-ignore
            options.mandatory.chromeMediaSource = 'desktop';
            // @ts-ignore
            options.mandatory.chromeMediaSourceId = streamId;
            navigator.mediaDevices.getUserMedia(options)
                .then(resolve, reject)
        }
    }
})();
