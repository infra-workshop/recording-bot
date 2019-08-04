import {Token} from "../Token";
import {CustomWriter} from "./CustomWriter";
import inline from "./inline";

export class Writer {
    private tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.addWriter("inline", inline);
    }

    private str: string = "";

    append(str: string) {
        this.str += str;
    }

    private customWriters: Map<string, CustomWriter<Token>> = new Map<string, CustomWriter<Token>>();

    addWriter<T extends Token = Token>(name: string, writer: CustomWriter<T>) {
        this.customWriters.set(name, writer as CustomWriter<Token>)
    }

    writeAll(): string {
        for (let token of this.tokens) {
            this.writeToken(token)
        }
        return this.str;
    }

    writeToken(token: Token) {
        const custom = this.customWriters.get(token.name);
        if (custom != null) {
            custom(this, token)
        } else {
            if (!token.tag) throw "Token without tag must have CustomWriter";
            this.writeTagToken(token);
        }
    }

    private writeTagToken(token: Token) {
        const tagPrefix = token.indent < 0 ? "</" : "<";
        this.append(tagPrefix);
        this.append(token.tag!);
        this.append(">");
    }
}
