import {Snowflake} from "discord.js";
import {
    Message as DiscordMessage,
    User as DiscordUser,
    MessageReaction as DiscordMessageReaction,
    Emoji as DiscordEmoji,
    ReactionEmoji as DiscordReactionEmoji
} from "discord.js";

type Optionals<T> = {
    [P in keyof T]?: T[P]
}

export class Message {
    readonly author: User;
    readonly reactions: MessageReaction[];
    readonly content: string;
    readonly id: Snowflake;

    constructor(base: DiscordMessage)
    constructor(author: User, reactions: MessageReaction[], content: string, id: Snowflake)
    constructor(author: User|DiscordMessage, reactions?: MessageReaction[], content?: string, id?: Snowflake) {
        if (author instanceof DiscordMessage) {
            const base = author as DiscordMessage;
            this.author = new User(base.author);
            this.reactions = base.reactions.array().map(r => new MessageReaction(r));
            this.content = base.content;
            this.id = base.id;
        } else {
            this.author = author;
            this.reactions = reactions;
            this.content = content;
            this.id = id;
        }
    }


    copy({author = this.author, reactions = this.reactions, content = this.content, id = this.id}: Optionals<Message> = {}) {
        return new Message(author, reactions, content, id)
    }
}

export class User {
    readonly discriminator: string;
    readonly id: Snowflake;
    readonly avatar: string;
    readonly username: string;

    constructor(base: DiscordUser) {
        this.id = base.id;
        this.avatar = base.avatar;
        this.discriminator = base.discriminator;
        this.username = base.username;
    }
}

export class MessageReaction {
    readonly emoji: Emoji | ReactionEmoji;
    readonly count: number;

    constructor(base: DiscordMessageReaction) {
        if (base.emoji instanceof DiscordEmoji) {
            this.emoji = new Emoji(base.emoji)
        } else {
            this.emoji = new ReactionEmoji(base.emoji)
        }

        this.count = base.count;
    }
}

export class Emoji {
    readonly url: string;
    readonly identifier: string;

    constructor(base: DiscordEmoji) {
        this.url = base.url;
        this.identifier = base.identifier
    }
}

export class ReactionEmoji {
    readonly name: string;
    readonly identifier: string;

    constructor(base: DiscordReactionEmoji) {
        this.name = base.name;
        this.identifier = base.identifier
    }
}
