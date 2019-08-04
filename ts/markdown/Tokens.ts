import {Token} from "./Token";

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
