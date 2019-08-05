import {InlineParser} from "../InlineParser";
import {inlineToken} from "../Tokens";

const escape: InlineParser = function escape(state): boolean {
    if (state.get() !== "\\") return false;
    state.goCursor(1);
    if (state.get() == "") {
        state.pushToken(inlineToken("\\"));
    } else {
        state.pushToken(inlineToken(state.get()));
    }
    state.goCursor(1);
    return true;
};

export = escape;
