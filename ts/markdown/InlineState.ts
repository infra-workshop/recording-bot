import {Token} from "./Token";
import {inlineToken} from "./Tokens";
import {Env} from "./env";
import {InlineParser} from "./InlineParser";
import codeBlock from "./inline/codeBlock";
import emoji from "./inline/emoji";
import escape from "./inline/escape";
import generalFormats from "./inline/generalFormats";
import inlineCode from "./inline/inlineCode";
import strikethrough from "./inline/strikethrough";
import link from "./inline/link";


export class InlineState {
    private str: string;
    private pos = 0;

    constructor(str: string) {
        this.str = str;
    }

    addDefaultParsers() {
        for (let defaultInlineParser of defaultInlineParsers) {
            this.addParser(defaultInlineParser);
        }
    }

    match(regex: RegExp): RegExpMatchArray | null {
        return this.str.substring(this.pos).match(regex)
    }

    get(length: number = 1): string {
        return this.str.substr(this.pos, length)
    }

    charAt(offset: number = 0): string {
        return this.str.charAt(this.pos + offset)
    }

    indexOf(searchString: string, offset: number = 0) {
        const index = this.str.indexOf(searchString, this.pos + offset);
        if (index == -1) return index;
        return index - this.pos;
    }

    startsWith(searchString: string): boolean {
        return this.get(searchString.length) == searchString
    }

    goCursor(length: number) {
        this.pos += length
    }

    // tokens

    private tokens: Token[] = [];

    pushToken(token: Token) {
        this.tokens.push(token)
    }

    // parsers

    private parsers: InlineParser[] = [];

    addParser(parser: InlineParser) {
        this.parsers.push(parser);
    }

    parseAll(env: Env = {}): Token[] {
        let unparsed: string = "";
        let prevParsed = false;
        while (this.pos < this.str.length) {
            const oldCurrent = this.pos;
            let parsed = false;
            for (let parser of this.parsers) {
                if (parser(this, env)) {
                    parsed = true;
                    break
                } else {
                    this.pos = oldCurrent
                }
            }
            if (!parsed) {
                unparsed += this.get();
                this.goCursor(1);
                if (!prevParsed)
                    this.tokens.pop();
                else
                    prevParsed = false;
                this.pushToken(inlineToken(unparsed));
            } else {
                unparsed = "";
                prevParsed = true
            }
        }
        return this.tokens
    }

    parseUntil(length: number, env: Env = {}) {
        let newState = new InlineState(this.get(length));
        newState.parsers = this.parsers;
        this.tokens.push(...newState.parseAll(env));
        this.goCursor(length);
    }
}

const defaultInlineParsers: InlineParser[] = [
    escape,
    codeBlock,
    emoji,
    generalFormats,
    inlineCode,
    strikethrough,
    link,
];
