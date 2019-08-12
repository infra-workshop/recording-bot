import {cerr, enable, getMediaStreamId, request_capture, tagName} from "./shared";

const doEnable = () => {
    const wrapper = document.getElementsByTagName(tagName+"-wrapper")[0] as HTMLElement;
    const observer = new MutationObserver((records: MutationRecord[]) => {
        for (let record of records) {
            if (record.type == 'childList') {
                for (let i = 0; i < record.addedNodes.length; i++) {
                    const nodeKind = (record.addedNodes[i] as Element).getAttribute("kind")!;
                    onEvent(nodeKind);
                }
            }
        }
    });
    observer.observe(wrapper, { attributes: false, childList: true, characterData: false });
    callCallback(enable, undefined, undefined);
};

const callCallback = (kind: string, args: any, reason: any) => {
    const script = document.createElement("script");
    script.textContent = `(function(){window.RecorderTabCapSupport.__callback("${kind}", ${JSON.stringify(args)}, ${JSON.stringify(reason)});})()`
    document.head.appendChild(script);
};
const callBackError = (kind: string, args: any) => {
    args.err && callCallback(kind, undefined, args.err);
    return !!args.err;
};

const onEvent = (nodeKind: string) => {
    switch (nodeKind) {
        case request_capture:
            chrome.runtime.sendMessage({message: getMediaStreamId}, args => {
                if (callBackError(request_capture, args)) return;
                callCallback(request_capture, args, undefined);
            });
            cerr();
            break;
    }
};

(async () => {
    const headObserver = new MutationObserver((records: MutationRecord[]) => {
        for (let record of records) {
            if (record.type == 'childList') {
                for (let i = 0; i < record.addedNodes.length; i++) {
                    const nodeKind = (record.addedNodes[i] as Element).tagName;
                    if (nodeKind === (tagName + "-wrapper").toUpperCase()) {
                        doEnable();
                        headObserver.disconnect();
                    }
                }
            }
        }
    });
    headObserver.observe(document.head, { attributes: false, childList: true, characterData: false });
})();

(()=>{
    const script = document.createElement("script");
    script.src =  chrome.extension.getURL("web_script.js");
    document.head.appendChild(script);
})();
