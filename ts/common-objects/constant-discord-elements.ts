import {GuildMember, Snowflake} from "discord.js";
import {
    Message as DiscordMessage,
    User as DiscordUser,
    MessageReaction as DiscordMessageReaction,
    Emoji as DiscordEmoji,
    ReactionEmoji as DiscordReactionEmoji
} from "discord.js";
import {JSONObject} from "puppeteer";
import formatter from "./message-formatter";

type Optionals<T> = {
    [P in keyof T]?: T[P]
}

export interface Message extends JSONObject {
    readonly author: User;
    readonly reactions: MessageReaction[];
    readonly contentHtml: string;
    readonly id: Snowflake;
}

export function newMessage(base: DiscordMessage): Message {
    return {
        author: newUser(base.member),
        reactions: base.reactions.array().map(r => newMessageReaction(r)),
        contentHtml: formatter.format(base),
        id: base.id,
    };
}

export function copyMessage(base: Message, {author = base.author, reactions = base.reactions, contentHtml = base.contentHtml, id = base.id}: Optionals<Message> = {}): Message {
    return {
        author: author,
        reactions: reactions,
        contentHtml: contentHtml,
        id: id,
    }
}

export interface User extends JSONObject {
    readonly discriminator: string;
    readonly id: Snowflake;
    readonly avatar: string;
    readonly nickname: string;
}

export function newUser(base: GuildMember): User {
    return {
        id: base.id,
        avatar: base.user.avatar,
        discriminator: base.user.discriminator,
        nickname: base.nickname || base.user.username,
    };
}

export interface MessageReaction  extends JSONObject {
    readonly emoji: Emoji | ReactionEmoji;
    readonly count: number;
}

export function newMessageReaction(base: DiscordMessageReaction): MessageReaction {
    return {
        emoji: base.emoji instanceof DiscordEmoji ? newEmoji(base.emoji) : newReactionEmoji(base.emoji),
        count: base.count,
    }
}

export function isEmoji(v: any): v is Emoji {
    if (typeof v.url !== "string") return false;
    if (typeof v.identifier !== "string") return false;
    return true;
}

export interface Emoji extends JSONObject {
    readonly url: string;
    readonly identifier: string;
}

export function newEmoji(base: DiscordEmoji): Emoji {
    return {
        url: base.url,
        identifier: base.identifier,
    }
}

export interface ReactionEmoji extends JSONObject {
    readonly name: string;
    readonly identifier: string;
}

export function newReactionEmoji(base: DiscordReactionEmoji): ReactionEmoji {
    return {
        name: base.name,
        identifier: base.identifier,
    }
}
