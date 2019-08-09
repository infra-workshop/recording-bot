import {Client, Emoji, Message, MessageReaction, User} from 'discord.js';
import 'jquery';
import messageFormatter from "./message-formatter";

const chat = $('#chat')!;
const content = chat.children('.content').last();
const tokens = require("../../resources/tokens.json");

function scroll_to_end() {
    chat.animate({scrollTop: chat[0].scrollHeight}, { duration: 800, easing: 'swing' });
}
/**
 * 文字列を16進数に変換する
 * 16進数ひとけたの場合は01 02 03と表記する
 */
function hex(s: string): string {
    var result="";
    for(var i=0;i<s.length;++i){
        var h = ("0"+s.charCodeAt(i).toString(16)).substr(-2);
        result += h;
    }
    return result;
}

function addMessage(userInfo: User, messageInfo: Message) {
    console.log("addMessage call");
    console.log(userInfo);
    console.log(messageInfo);
    const [messageGroup, addUser] = getOrCreateAndAppendContent(userInfo);

    const messageData = $("<div class='message-data'></div>");

    if (addUser) {
        const userInfoE = $("<div class='user-info'>")
            .append($("<div class='icon'>").css('background-image', `url("${getAvatar(userInfo)}")`))
            .append($("<h2>").append($("<span class='user-name'>").text(userInfo.username)));

        messageData.append(userInfoE);
    } else {
        // remove hr
        messageGroup.children().last().remove();
    }

    messageData.append(`<div class="message" id="message-${messageInfo.id}">
<div class="message-body">${messageFormatter.format(messageInfo)}</div>
<div class="reactions-div"></div>
</div>`);

    messageGroup.append(messageData);
    messageGroup.append("<hr class='divider-end-msg'>");
    scroll_to_end();
}

function getOrCreateAndAppendContent(userInfo: User): [JQuery, boolean] {
    let addUser = false;
    let messageGroup = content.children().last();
    if (!messageGroup.hasClass(`message-by-${userInfo.id}`)) {
        messageGroup = $(`<div class="message-group message-by-${userInfo.id}"></div>`);
        content.append(messageGroup);
        addUser = true
    }
    return [messageGroup, addUser];
}

function removeMessage(messageInfo: Message) {
    // デバッグログ
    console.log("removeMessage");
    console.log(messageInfo);

    const msgId = messageInfo.id;
    const msgElement = $(`#message-${msgId}`);
    const messageData = msgElement.parent();
    const messageGroup = messageData.parent();
    //メッセージがないならスキップ
    if (msgElement.length == 0) { console.log(`#message-${msgId} not found`); return; }
    if (messageGroup.children().first().is(messageData)) {
        // アイコン類がある
        const nextMsg = messageGroup.children().eq(1);
        if (nextMsg.prop("tagName") != "HR")
            nextMsg.prepend(messageData.children().first());
        else
            messageGroup.remove()
    }
    messageData.remove();
}

function editMessage(newMessage: Message) {
    const message = $(`#message-${newMessage.id}`);
    message.children('.message-body').html(messageFormatter.format(newMessage));
}

function updateReactionToMessage(reactionInfo: MessageReaction) {
    // デバッグログ
    console.log("updateReactionToMessage");
    console.log(reactionInfo);

    const msgId = reactionInfo.message.id;
    const emoji = reactionInfo.emoji;

    //メッセージがないならスキップ
    const msgElement = $(`#message-${msgId}`);
    if (msgElement.length == 0) { console.log(`#message-${msgId} not found`); return; }

    const reactionsDiv = msgElement.children(".reactions-div");
    //reactions spanがなかったら作成
    if (!reactionsDiv.has(".reactions").length) {
        reactionsDiv.append("<span class='reactions'></span>")
    }
    const reactions = reactionsDiv.children(".reactions");
    const reactionClass = emoji instanceof Emoji || emoji.id != null ? `reaction-${emoji.id}` : `reaction-named-${hex(emoji.name)}`;

    // reactionがなくなったわけでなければ
    if (reactionInfo.count != 0) {

        let reactionEmojiHtml: string;
        if (emoji instanceof Emoji) {
            reactionEmojiHtml = `<img src="${emoji.url}" alt="azasu" draggable="false" class="emoji">`
        } else {
            reactionEmojiHtml = `<span class="emoji-text">${emoji.name}</span>`
        }

        const newReaction = $(`<div class="reaction ${reactionClass}">
<div class="reaction-inner">
${reactionEmojiHtml}
<div class="reactionCount">${reactionInfo.count}</div>
</div>
</div>`);
        const reaction = reactions.children(`.${reactionClass}`);
        if (reaction.length == 0) {
            reactions.append(newReaction)
        } else {
            reaction.replaceWith(newReaction)
        }
    } else {
        reactions.children(`.${reactionClass}`).remove();
        //reactionが全てなくなったらreactionsを削除
        if (reactions.children(`.reaction`).length == 0) {
            reactionsDiv.empty();
        }
    }
    scroll_to_end();
}

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const getAvatar = (user: User) => {
    if (user.avatar) {
        return (`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=40`);
    } else {
        return (`https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator)%5}.png?size=40`);
    }
};

(async () => {
    await client.login(tokens.discord);
    console.log(`login success!`);

    console.log("add click secs");

    client.on('message', async (message: Message) => {
        if (message.type == "DEFAULT") {
            await addMessage(message.author, message);
            if (message.content === 'ping') {
                await message.reply('Pong!');
            }
        } else {
            console.warn("unknown type message");
            console.warn(message);
        }
    });

    client.on('messageDelete', async (message: Message) => {
        removeMessage(message)
    });

    client.on("messageUpdate", async (oldMessage: Message, newMessage: Message) => {
        console.log(`oldMessage.id: ${oldMessage.id}`);
        console.log(`newMessage.id: ${newMessage.id}`);
        editMessage(newMessage);
    });

    client.on("messageReactionAdd", async (messageReaction: MessageReaction, user: User) => {
        updateReactionToMessage(messageReaction)
    });

    client.on("messageReactionRemove", async (messageReaction: MessageReaction, user: User) => {
        updateReactionToMessage(messageReaction)
    });

    await new Promise((resolve) => { setTimeout(resolve, 10000); });


})();