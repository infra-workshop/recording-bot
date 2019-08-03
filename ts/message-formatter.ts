import {GuildChannel, Message} from "discord.js";
import getFlag from "./flags";
import md from "./markdown";

function escapeHTMLRegex(regex: RegExp): RegExp {
    const source = regex.source;
    const newSource = source.replace('&', "(?:&amp;)")
        .replace('<', "(?:&lt;)")
        .replace('>', "(?:&gt;)")
        .replace('"', "(?:&quot;)");

    return new RegExp(newSource, regex.flags);
}

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

class MessageFormatter {
    public format(msg: Message): string {
        let content = msg.content;
        // general markdown
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
}

export default new MessageFormatter();
