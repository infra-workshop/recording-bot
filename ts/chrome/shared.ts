export const somePrefix = "recorder-tab-cap-support";
// web <-> content
export const request_capture = "request_capture";
export const enable = "enable";
export const request_capture_with_click = "request_capture_with_click";

// content -> event
export const getMediaStreamId = "getMediaStreamId";
export const getMediaStreamIdWithClick = "getMediaStreamIdWithClick";

// event -> content
export const makePopUp = "makePopUp";
export const rmPopUp = "rmPopUp";

export function cerr() {
    const e = chrome.runtime.lastError;
    if (e) {
        console.error("err");
        console.log(e);
        throw e;
    }
}

export const sendError = (sendResponse: (response?: any) => void) => {
    const e = chrome.runtime.lastError;
    if (e) {
        sendResponse({err: e});
        return true
    }
    return false
};


import "../chrome-header/header";
