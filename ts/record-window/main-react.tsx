import {Client, Emoji, Message, MessageReaction, User} from 'discord.js';
import messageFormatter from "./message-formatter";
import * as ReactDOM from "react-dom";
import * as React from "react";
import {Content} from "./content";
import {RefObject} from "react";

const tokens = require("../../resources/tokens.json");
/*
function scroll_to_end() {
    chat.animate({scrollTop: chat[0].scrollHeight}, { duration: 800, easing: 'swing' });
}
 */

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


const content: RefObject<Content> = React.createRef()

ReactDOM.render(
    <Content ref={content}/>,
    document.getElementById('content-wrapper')
);


function addMessage(messageInfo: Message) {
    content.current.addMessage(messageInfo)
}

function removeMessage(messageInfo: Message) {
    content.current.removeMessage(messageInfo)
}

function editMessage(newMessage: Message) {
    content.current.editMessage(newMessage)
}

function updateReaction(reactionInfo: MessageReaction) {
    content.current.updateReaction(reactionInfo)
}

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

(async () => {
    await client.login(tokens.discord);
    console.log(`login success!`);

    console.log("add click secs");

    client.on('message', async (message: Message) => {
        if (message.type == "DEFAULT") {
            await addMessage(message);
            if (message.content === 'ping') {
                await message.reply('Pong!');
            }
        } else {
            console.warn("unknown type message");
            console.warn(message);
        }
    });

    client.on('messageDelete', async (message: Message) => { removeMessage(message) });

    client.on("messageUpdate", async (oldMessage: Message, newMessage: Message) => {
        console.log(`oldMessage.id: ${oldMessage.id}`);
        console.log(`newMessage.id: ${newMessage.id}`);
        editMessage(newMessage);
    });

    client.on("messageReactionAdd", async (messageReaction: MessageReaction, user: User) => {
        updateReaction(messageReaction)
    });

    client.on("messageReactionRemove", async (messageReaction: MessageReaction, user: User) => {
        updateReaction(messageReaction)
    });

    await new Promise((resolve) => { setTimeout(resolve, 10000); });


})();