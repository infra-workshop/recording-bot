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
