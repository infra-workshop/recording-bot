import {InlineParser} from "../InlineParser";
import {linkToken} from "../Tokens";

const link: InlineParser = function link(state, env): boolean {
    const match = state.match(/^(https?:\/\/[^\s]*)/);
    if (match == null) return false;

    state.goCursor(match[1].length);

    const link = match[1];

    state.pushToken(linkToken(link));
    return true;
};

export default link;
