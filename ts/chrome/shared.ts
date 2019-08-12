export const tagName = "recorder-tab-cap-support";
export const request_capture = "request_capture";
export const enable = "enable";

export const getMediaStreamId = "getMediaStreamId";

export function cerr() {
    const e = chrome.runtime.lastError;
    if (e) {
        console.error("err");
        console.log(e);
        throw e;
    }
}

import "../chrome-header/header";
