import {Snowflake} from "ts/markdown/discord.js";
import {
    Message as DiscordMessage,
    User as DiscordUser,
    MessageReaction as DiscordMessageReaction,
    Emoji as DiscordEmoji,
    ReactionEmoji as DiscordReactionEmoji
} from "ts/markdown/discord.js";

type Optionals<T> = {
    [P in keyof T]?: T[P]
}

export interface Message {
    readonly author: User;
    readonly reactions: MessageReaction[];
    readonly content: string;
    readonly id: Snowflake;
}

export function newMessage(base: DiscordMessage): Message {
    return {
        author: newUser(base.author),
        reactions: base.reactions.array().map(r => newMessageReaction(r)),
        content: base.content,
        id: base.id,
    };
}

export function copyMessage(base: Message, {author = base.author, reactions = base.reactions, content = base.content, id = base.id}: Optionals<Message> = {}): Message {
    return {
        author: author,
        reactions: reactions,
        content: content,
        id: id,
    }
}

export interface User {
    readonly discriminator: string;
    readonly id: Snowflake;
    readonly avatar: string;
    readonly username: string;
}

export function newUser(base: DiscordUser): User {
    return {
        id: base.id,
        avatar: base.avatar,
        discriminator: base.discriminator,
        username: base.username,
    };
}

export interface MessageReaction {
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

export interface Emoji {
    readonly url: string;
    readonly identifier: string;
}

export function newEmoji(base: DiscordEmoji): Emoji {
    return {
        url: base.url,
        identifier: base.identifier,
    }
}

export interface ReactionEmoji {
    readonly name: string;
    readonly identifier: string;
}

export function newReactionEmoji(base: DiscordReactionEmoji): ReactionEmoji {
    return {
        name: base.name,
        identifier: base.identifier,
    }
}
