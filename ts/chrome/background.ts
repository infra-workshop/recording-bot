import {cerr, getMediaStreamId, getMediaStreamIdWithClick, makePopUp, rmPopUp, sendError} from "./shared";
import keyEventHandled = chrome.input.ime.keyEventHandled;
import Tab = chrome.tabs.Tab;

const onClicked: {[key: number]: (tab: Tab)=>boolean|undefined} = {};

chrome.browserAction.onClicked.addListener(tab => {
    if (onClicked[tab.id] && onClicked[tab.id](tab)) {
        onClicked[tab.id] = null;
    }
});
const callBackError = (args: any) => {
    if (args.err) throw args.err;
};

chrome.runtime.onMessage.addListener(({message, ...args}, sender, sendResponse) => {
    switch (message) {
        case getMediaStreamId:
            // @ts-ignore
            chrome.tabCapture.getMediaStreamId({consumerTabId: sender.tab!.id, targetTabId: sender.tab!.id},
                (streamId: string) => {
                    if (sendError(sendResponse))return;
                    sendResponse({streamId});
                });
            return true;
            break;
        case getMediaStreamIdWithClick: {
            chrome.tabs.sendMessage(sender.tab!.id, {message: makePopUp, html:`
            please click plugin icon
            `}, ({id}) => {
                if (sendError(sendResponse))return;

                onClicked[sender.tab!.id] = () => {
                    if (sendError(sendResponse))return;
                    chrome.tabs.sendMessage(sender.tab!.id, {message: rmPopUp, id: id});
                    // @ts-ignore
                    chrome.tabCapture.getMediaStreamId({consumerTabId: sender.tab!.id, targetTabId: sender.tab!.id},
                        (streamId: string) => {
                            if (sendError(sendResponse))return;
                            sendResponse({streamId});
                        });
                    return true;
                };
            });
            return true;
            break;
        }
    }
});
cerr();
