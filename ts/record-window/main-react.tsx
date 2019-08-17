///<reference path="../types/window.d.ts"/>


import {Snowflake} from "discord.js";
import {Message, MessageReaction} from "../common-objects/constant-discord-elements";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {Content} from "./content";
import {RefObject} from "react";

/**
 * 文字列を16進数に変換する
 * 16進数ひとけたの場合は01 02 03と表記する
 */
function hex(s: string): string {
    let result = "";
    for(let i=0; i<s.length; ++i){
        result += ("0"+s.charCodeAt(i).toString(16)).substr(-2);
    }
    return result;
}


const content: RefObject<Content> = React.createRef();

ReactDOM.render(
    <Content ref={content}/>,
    document.getElementById('content-wrapper')
);


export function addMessage(messageInfo: Message) {
    content.current.addMessage(messageInfo)
}

export function removeMessage(messageInfo: Message) {
    content.current.removeMessage(messageInfo)
}

export function editMessage(newMessage: Message) {
    content.current.editMessage(newMessage)
}

export function updateReaction(messageId: Snowflake, newReaction: MessageReaction) {
    content.current.updateReaction(messageId, newReaction)
}

window.addMessage = addMessage;
window.removeMessage = removeMessage;
window.editMessage = editMessage;
window.updateReaction = updateReaction;
