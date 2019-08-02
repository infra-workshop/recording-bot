import {Client, Emoji, Message, MessageReaction, User} from 'discord.js';
import 'jquery';

const chat = $('#chat')!;
const content = chat.children('.content').last();
const tokens = require("../tokens.json");

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
<div class="message-body">${parseMessageToHtml(messageInfo)}</div>
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
    message.children('.message-body').html(parseMessageToHtml(newMessage));
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

const wrapWithSpan = (mkMsg: (arg0: string) => string|[string, number]) => (msg: string) => {
    const result = mkMsg(msg);
    if (Array.isArray(result)) {
        const colorInt = result[1];
        const red = (colorInt >> 16) & 0xFF;
        const green = (colorInt >> 8) & 0xFF;
        const blue = (colorInt >> 0) & 0xFF;
        return `<span class="mention" style="color: rgb(${red}, ${green}, ${blue}); background-color: rgba(${red}, ${green}, ${blue}, .1)">${result[0]}</span>`
    } else {
        return `<span class="mention">${result}</span>`
    }
};

function escapeHTMLRegex(regex: RegExp): RegExp {
    const source = regex.source;
    const newSource = source.replace('&', "(?:&amp;)")
        .replace('<', "(?:&lt;)")
        .replace('>', "(?:&gt;)")
        .replace('"', "(?:&quot;)");

    return new RegExp(newSource, regex.flags);
}

function getFlag(name: string): boolean {
    const id = "flags-" + name.replace(' ', '-');
    let element = (document.getElementById(id) as HTMLInputElement);
    if (element == null) {
        const input = $<HTMLInputElement>("<input type=\"checkbox\" checked>");
        const label = $("<label></label>");
        input.attr('id', id);
        label.attr('for', id);
        label.text(name);
        $("#flags").append(
            input,
            label,
            $("<br>")
        );
        element = input.get(0);
    }
    return element.checked
}

/**
 *
 * @param {Message} msg
 * @return {string}
 */
// noinspection RegExpSingleCharAlternation
function parseMessageToHtml(msg: Message) {
    let content = msg.content;
    // general
    content = content.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;");

    // global mentions
    if (getFlag("global mentions"))
        content = content.replace(/@(everyone|here)/g, wrapWithSpan(msg => `${msg}`));

    // user mentions
    if (getFlag("user mentions"))
        content = content.replace(escapeHTMLRegex(/<@!?[0-9]+>/g), wrapWithSpan(input => {
            const id = input.replace(escapeHTMLRegex(/<|!|>|@/g), '');
            if (msg.channel.type === 'dm' || msg.channel.type === 'group') {
                return msg.client.users.has(id) ? `@${msg.client.users.get(id)!.username}` : input;
            }

            const member = (msg.channel as GuildChannel).guild.members.get(id);
            if (member) {
                if (member.nickname) return `@${member.nickname}`;
                return `@${member.user.username}`;
            } else {
                const user = msg.client.users.get(id);
                if (user) return `@${user.username}`;
                return input;
            }
        }));

    // channel mentions
    if (getFlag("channel mentions"))
        content = content.replace(escapeHTMLRegex(/<#[0-9]+>/g), wrapWithSpan(input => {
            const channel = msg.client.channels.get(input.replace(escapeHTMLRegex(/<|#|>/g), ''));
            if (channel) return `#${(channel as any).name}`;
            return input;
        }));

    // role mentions
    if (getFlag("role mentions"))
        content = content.replace(escapeHTMLRegex(/<@&[0-9]+>/g), wrapWithSpan(input => {
            if (msg.channel.type === 'dm' || msg.channel.type === 'group') return input;
            const role = msg.guild.roles.get(input.replace(escapeHTMLRegex(/<|@|>|&/g), ''));

            if (role) return [`@${role.name}`, role.color];
            return input;
        }));

    // emoji
    if (getFlag("emoji"))
        content = content.replace(escapeHTMLRegex(/<:[^:]+:[0-9]+>/g), input => {
            if (msg.channel.type === 'dm' || msg.channel.type === 'group') return input;
            const emojiId = input.match(escapeHTMLRegex(/<:[^:]+:([0-9]+)>/))![1];
            const emoji = msg.guild.emojis.get(emojiId);
            console.log(`emoji: ${emojiId}`);

            if (emoji) {
                return `<img alt=":${emoji.name}:" src="${emoji.url}" class="emoji">`
            }
            return input;
        });

    return content;
}

// init flags
getFlag("global mentions");
getFlag("user mentions");
getFlag("channel mentions");
getFlag("role mentions");
getFlag("emoji");

(async () => {
    await client.login(tokens.discord);
    console.log(`login success!`);

    console.log("add click secs");

    client.on('message', async (message: Message) => {
        await addMessage(message.author, message);
        if (message.content === 'ping') {
            await message.reply('Pong!');
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