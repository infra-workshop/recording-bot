import {Lines} from "./Lines";
import {Token} from "./Token";
import {BlockParser} from "./BlockParser";
import {inlineToken} from "./Tokens";

export class BlockState {
    public lines: Lines;

    constructor(string: string) {
        this.lines = new Lines(string)
    }

    private tokens: Token[] = [];

    pushToken(token: Token) {
        this.tokens.push(token)
    }

    private parsers: BlockParser[] = [];

    addParser(parser: BlockParser) {
        this.parsers.push(parser);
    }

    parseAll(): Token[] {
        let unparsedLines: string[] = [];
        let prevParsed = false;
        while (this.lines.has()) {
            const oldCurrent = this.lines.getCurrent();
            let parsed = false;
            for (let parser of this.parsers) {
                if (parser(this)) {
                    parsed = true;
                    break
                } else {
                    this.lines.setCurrent(oldCurrent)
                }
            }
            if (!parsed) {
                unparsedLines.push(this.lines.getAndNext());
                if (!prevParsed)
                    this.tokens.pop();
                else
                    prevParsed = false;
                this.pushToken(inlineToken(unparsedLines.join("\n")));
            } else {
                unparsedLines = [];
                prevParsed = true
            }
        }
        return this.tokens
    }
}
