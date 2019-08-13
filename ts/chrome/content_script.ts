import {
    cerr,
    enable,
    getMediaStreamId,
    getMediaStreamIdWithClick, makePopUp,
    request_capture,
    request_capture_with_click, rmPopUp, sendError,
    somePrefix
} from "./shared";

const doEnable = () => {
    const wrapper = document.getElementsByTagName(somePrefix+"-wrapper")[0] as HTMLElement;
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
        case request_capture_with_click:
            chrome.runtime.sendMessage({message: getMediaStreamIdWithClick}, args => {
                if (callBackError(request_capture_with_click, args)) return;
                callCallback(request_capture_with_click, args, undefined);
            });
            cerr();
    }
};

(async () => {
    const headObserver = new MutationObserver((records: MutationRecord[]) => {
        for (let record of records) {
            if (record.type == 'childList') {
                for (let i = 0; i < record.addedNodes.length; i++) {
                    const nodeKind = (record.addedNodes[i] as Element).tagName;
                    if (nodeKind === (somePrefix + "-wrapper").toUpperCase()) {
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

const createUl = (): HTMLUListElement => {
    const popupUl = document.createElement('ul');
    popupUl.id = somePrefix+'-popups-ul';

    popupUl.style.listStyleType = "none";
    popupUl.style.position = "fixed";
    popupUl.style.right = "10px";
    popupUl.style.top = "10px";
    popupUl.style.backgroundColor = "beige";
    popupUl.style.margin = "0";
    popupUl.style.padding = "0";

    document.body.appendChild(popupUl);

    return popupUl
};

const popupUl = document.getElementById(somePrefix+'-popups-ul') as HTMLUListElement || createUl();

let idCount = 0;
chrome.runtime.onMessage.addListener(({message, ...args}, sender, sendResponse) => {
    switch (message) {
        case makePopUp:{
            const {html} = args;

            const popupLi = document.createElement('li');
            popupLi.id = somePrefix+'-popups-li-' + (++idCount);

            popupLi.style.padding = "20px";

            popupLi.innerHTML = html;

            popupUl.appendChild(popupLi);
            sendResponse({id: idCount});
            break
        }
        case rmPopUp: {
            const {id} = args;
            const popupLi = document.getElementById(somePrefix+'-popups-li-' + id) as HTMLLIElement;
            if (!popupLi) return sendResponse({err: "popup not found"});
            popupLi.remove();
            return sendResponse({});
            break
        }
    }
});
