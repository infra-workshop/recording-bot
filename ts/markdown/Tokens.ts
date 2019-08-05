import {Token} from "./Token";
import {Snowflake} from "discord.js";

export interface InlineToken extends Token {
    readonly name: "inline";
    readonly tag?: undefined;
    readonly indent: 0;
    readonly content: string;
}

export function inlineToken(content: string): InlineToken {
    return {
        name: "inline",
        indent: 0,
        content: content
    }
}

export interface DiscordSnowflakeToken extends Token {
    readonly name: string;
    readonly tag?: undefined;
    readonly indent: 0;
    readonly content: string;
    readonly snowflake: Snowflake;
}

export type SnowflakeKind = "global" | "user" | "role" | "channel" | "emoji";

export function snowflakeToken(kind: SnowflakeKind, content: string, snowflake: Snowflake): DiscordSnowflakeToken {
    return {
        name: "snowflake_" + kind,
        indent: 0,
        content: content,
        snowflake: snowflake
    }
}

export function codeToken(lang: string | null, content: string): CodeToken {
    return {
        name: "code",
        tag: undefined,
        indent: 0,
        lang: lang,
        content: content
    }
}

export interface CodeToken extends Token {
    readonly name: "code";
    readonly tag?: undefined;
    readonly indent: 0;
    readonly lang?: string | null;
    readonly content: string;
}

export function inlineCodeToken(content: string): InlineCodeToken {
    return {
        name: "inline_code",
        tag: undefined,
        indent: 0,
        content: content
    }
}

export interface InlineCodeToken extends Token {
    readonly name: "inline_code";
    readonly tag?: undefined;
    readonly indent: 0;
    readonly content: string;
}

export function linkToken(link: string): LinkToken {
    return {
        name: "link",
        tag: undefined,
        indent: 0,
        link: link
    }
}

export interface LinkToken extends Token {
    readonly name: "link";
    readonly tag?: undefined;
    readonly indent: 0;
    readonly link: string;
}
