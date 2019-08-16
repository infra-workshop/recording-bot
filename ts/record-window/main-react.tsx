///<reference path="../types/window.d.ts"/>


import {
    Client,
    Message as DiscordMessage,
    MessageReaction as DiscordMessageReaction,
    Snowflake,
    User as DiscordUser
} from "discord.js";
import {Message, MessageReaction, newMessage, newMessageReaction} from "../common-objects/constant-discord-elements";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {Content} from "./content";
import {RefObject} from "react";

const tokens = require("../../resources/tokens.json");

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

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

(async () => {
    await client.login(tokens.discord);
    console.log(`login success!`);

    console.log("add click secs");

    client.on('message', async (message: DiscordMessage) => {
        if (message.type == "DEFAULT") {
            await addMessage(newMessage(message));
            if (message.content === 'ping') {
                await message.reply('Pong!');
            }
        } else {
            console.warn("unknown type message");
            console.warn(message);
        }
    });

    client.on('messageDelete', async (message: DiscordMessage) => { removeMessage(newMessage(message)) });

    client.on("messageUpdate", async (oldMessage: DiscordMessage, new_Message: DiscordMessage) => {
        console.log(`oldMessage.id: ${oldMessage.id}`);
        console.log(`newMessage.id: ${new_Message.id}`);
        editMessage(newMessage(new_Message));
    });

    client.on("messageReactionAdd", async (messageReaction: DiscordMessageReaction, user: DiscordUser) => {
        updateReaction(messageReaction.message.id, newMessageReaction(messageReaction))
    });

    client.on("messageReactionRemove", async (messageReaction: DiscordMessageReaction, user: DiscordUser) => {
        updateReaction(messageReaction.message.id, newMessageReaction(messageReaction))
    });

    await new Promise((resolve) => { setTimeout(resolve, 10000); });


})();
