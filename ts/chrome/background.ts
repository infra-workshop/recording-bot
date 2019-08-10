import {cerr, getMediaStreamId, give_me_tab_id,} from "./shared";

const sendError = (sendResponse: (response?: any) => void) => {
    const e = chrome.runtime.lastError;
    if (e) {
        sendResponse({err: e});
        return true
    }
    return false
};

chrome.runtime.onMessage.addListener(({message, ...args}, sender, sendResponse) => {
    switch (message) {
        case give_me_tab_id: {
            console.log(sender.tab.url);
            sendResponse({id:sender.tab!.id});
            break
        }
        case getMediaStreamId:
            // @ts-ignore
            chrome.tabCapture.getMediaStreamId({consumerTabId: sender.tab!.id, targetTabId: sender.tab!.id},
                (streamId: string) => {
                    if (sendError(sendResponse))return;
                    sendResponse({streamId});
                });
            return true;
            break;
    }
});
cerr();
