import {CustomWriter} from "./CustomWriter";
import {DiscordSnowflakeToken} from "../Tokens";
import {escapeHtml} from "../util";
import {Message} from "discord.js";
import {Env} from "../env";

function wrapMentionSpan(content: string, colorInt?: number) {
    if (colorInt) {
        const red = (colorInt >> 16) & 0xFF;
        const green = (colorInt >> 8) & 0xFF;
        const blue = (colorInt >> 0) & 0xFF;
        return `<span class="mention" style="color: rgb(${red}, ${green}, ${blue}); background-color: rgba(${red}, ${green}, ${blue}, .1)">${escapeHtml(content)}</span>`
    } else {
        return `<span class="mention">${escapeHtml(content)}</span>`
    }
}

function getMsg(env: Env): Message {
    return env.message
}

export const snowflake_global: CustomWriter<DiscordSnowflakeToken> = function snowflake_global(writer, token): void {
    writer.append(wrapMentionSpan(token.content));
};

export const snowflake_user: CustomWriter<DiscordSnowflakeToken> = function snowflake_user(writer, token, env): void {
    const msg = getMsg(env);
    const id = token.snowflake;

    let userViewName: string;
    if (msg.channel.type === 'dm') {
        let user = msg.client.users.resolve(id);
        userViewName = user != null ? `@${user.username}` : token.content;
    } else {
        const member = msg.channel.guild.members.resolve(id);
        if (member) {
            if (member.nickname) userViewName = `@${member.nickname}`;
            else userViewName = `@${member.user.username}`;
        } else {
            const user = msg.client.users.resolve(id);
            if (user) userViewName = `@${user.username}`;
            else userViewName = token.content;
        }
    }
    writer.append(wrapMentionSpan(userViewName));
};

export const snowflake_channel: CustomWriter<DiscordSnowflakeToken> = function snowflake_channel(writer, token, env): void {
    const msg = getMsg(env);
    const id = token.snowflake;
    const channel = msg.client.channels.resolve(id);
    writer.append(wrapMentionSpan(channel ? `#${(channel as any).name}` : token.content));
};

export const snowflake_role: CustomWriter<DiscordSnowflakeToken> = function snowflake_role(writer, token, env): void {
    const msg = getMsg(env);
    const id = token.snowflake;
    let userViewName: string;
    let color: number | undefined = undefined;
    if (msg.channel.type === 'dm') {
        userViewName = token.content;
    } else {
        const role = msg.guild.roles.resolve(id);
        if (role) {
            userViewName = `@${role.name}`;
            color = role.color;
        } else {
            userViewName = token.content;
        }
    }
    writer.append(wrapMentionSpan(userViewName, color));
};

export const snowflake_emoji: CustomWriter<DiscordSnowflakeToken> = function snowflake_emoji(writer, token, env): void {
    const msg = getMsg(env);
    const id = token.snowflake;
    if (msg.channel.type === 'dm') token.content;
    const emoji = msg.guild.emojis.resolve(id);

    writer.append(emoji ? `<img alt=":${emoji.name}:" src="${emoji.url}" class="emoji">` : escapeHtml(token.content));
};

