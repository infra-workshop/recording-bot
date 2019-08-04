import {BlockParser} from "../BlockParser";
import {Token} from "../Token";
import {BlockState} from "../BlockState";
import {inlineToken} from "../Tokens";

export const blockquote: BlockParser = function blockquote(state: BlockState) {
    if (!state.lines.get().startsWith("> "))
        return false;
    const body: string[] = [];
    while (state.lines.has()) {
        if (state.lines.get().startsWith("> ")) {
            body.push(state.lines.getAndNext().substring(2));
        } else {
            break
        }
    }
    state.pushToken(begin);
    state.pushToken(inlineToken(body.join("\n")));
    state.pushToken(end);
    return true
};

const begin: BlockquoteBegin = {
    name: "blockquote_begin",
    tag: "blockquote",
    indent: 1
};

const end: BlockquoteEnd = {
    name: "blockquote_end",
    tag: "blockquote",
    indent: -1
};

export interface BlockquoteBegin extends Token {
    name: "blockquote_begin";
    tag: "blockquote";
    indent: 1;
}

export interface BlockquoteEnd extends Token {
    name: "blockquote_end";
    tag: "blockquote";
    indent: -1;
}


