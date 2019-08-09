import {kind, request_capture, tagName} from "./shared";

(()=>{
    const script = document.createElement("script");
    script.src = "web_script.js";
    document.appendChild(script);
})();

(async () => {
    await customElements.whenDefined(tagName);
    const wrapper = document.getElementsByTagName(tagName+"-wrapper")[0] as HTMLElement;
    const observer = new MutationObserver((records: MutationRecord[]) => {
        for (let record of records) {
            if (record.type == 'childList') {
                for (let i = 0; i < record.addedNodes.length; i++) {
                    const nodeKind = (record.addedNodes[i] as Element).getAttribute(kind);
                    switch (nodeKind) {
                        case request_capture:
                            chrome.tabs.getCurrent(tab => {
                                if (!tab) throw Error("");
                                const id = tab.id;
                                // @ts-ignore
                                chrome.tabCapture.getMediaStreamId({consumerTabId: id, targetTabId: id},
                                    (streamId: string) => {
                                        function onSuccess() {
                                            window.RecorderTabCapSupport.__getCaptureCallback(streamId, undefined);
                                        }

                                        const script = document.createElement("script");
                                        script.textContent = `(function(){const streamId = "${streamId}";${onSuccess};onSuccess();)()`;
                                        document.appendChild(script);
                                    })
                            })
                    }
                }
            }
        }
    });
    observer.observe(wrapper, { attributes: false, childList: true, characterData: false });
})();

